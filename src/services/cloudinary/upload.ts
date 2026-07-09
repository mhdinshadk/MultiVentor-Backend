import streamifier from 'streamifier'
import sharp from 'sharp'
import { getCloudinaryClient } from './config'
import { CloudinaryUploadResult } from './types'
import { retryWithBackoff } from './retry'
import { logger } from '../../utilities/logger'
import { CloudinaryError } from '../../utilities/errors'

const MAX_CLOUDINARY_BYTES = 9 * 1024 * 1024 // 9 MB safety ceiling (Cloudinary free plan: 10 MB)
const MAX_WIDTH = 1920 // Full-HD max width
const WEBP_QUALITY = 80 // 80% quality — visually identical, ~70% smaller file

/**
 * Compress an image buffer using sharp.
 * - SVG files are passed through unchanged (sharp cannot process them).
 * - GIF files are passed through unchanged (sharp strips animation).
 * - All other images are resized to max 1920px wide and converted to WebP at quality 80.
 * - If the compressed buffer still exceeds 9 MB, quality is progressively reduced (60 → 40).
 */
async function compressBuffer(buffer: Buffer, mimeType: string): Promise<{ buffer: Buffer; format: string }> {
  // SVG and GIF pass through as-is
  if (mimeType === 'image/svg+xml' || mimeType === 'image/gif') {
    return { buffer, format: mimeType === 'image/svg+xml' ? 'svg' : 'gif' }
  }

  let compressed = await sharp(buffer)
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY })
    .toBuffer()

  // Progressively reduce quality if still over 9 MB
  if (compressed.byteLength > MAX_CLOUDINARY_BYTES) {
    logger.warn(`[Cloudinary] Compressed buffer still ${Math.round(compressed.byteLength / 1024 / 1024)}MB. Reducing quality to 60...`)
    compressed = await sharp(buffer)
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .webp({ quality: 60 })
      .toBuffer()
  }

  if (compressed.byteLength > MAX_CLOUDINARY_BYTES) {
    logger.warn(`[Cloudinary] Still over limit at quality 60. Reducing quality to 40...`)
    compressed = await sharp(buffer)
      .resize({ width: 1280, withoutEnlargement: true })
      .webp({ quality: 40 })
      .toBuffer()
  }

  return { buffer: compressed, format: 'webp' }
}

export async function uploadImageStream(
  buffer: Buffer,
  folder: string,
  publicId?: string,
  mimeType?: string,
): Promise<CloudinaryUploadResult> {
  const cloudinary = getCloudinaryClient()

  // Compress buffer before uploading
  const originalMB = Math.round(buffer.byteLength / 1024 / 1024 * 10) / 10
  logger.info(`[Cloudinary] Original file size: ${originalMB}MB. Compressing...`)

  const { buffer: compressedBuffer, format } = await compressBuffer(buffer, mimeType || 'image/jpeg')

  const compressedMB = Math.round(compressedBuffer.byteLength / 1024 / 1024 * 10) / 10
  logger.info(`[Cloudinary] Compressed to ${compressedMB}MB (format: ${format}). Uploading to "${folder}"...`)

  const uploadFn = () =>
    new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          public_id: publicId,
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) {
            reject(error)
          } else {
            resolve(result)
          }
        }
      )

      // Catch stream error events to prevent fatal uncaught exceptions
      uploadStream.on('error', (err) => reject(err))

      // Convert compressed buffer to readable stream and pipe it
      streamifier.createReadStream(compressedBuffer).pipe(uploadStream)
    })

  try {
    const startTime = Date.now()

    const result = await retryWithBackoff(uploadFn)

    const duration = Date.now() - startTime
    logger.info(
      `[Cloudinary] Upload completed in ${duration}ms. URL: ${result.secure_url}`
    )

    return {
      secure_url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
      format: result.format,
      resource_type: result.resource_type,
      original_filename: result.original_filename || 'upload',
      created_at: result.created_at,
    }
  } catch (err: any) {
    logger.error(`[Cloudinary] Upload operation failed: ${err.message || err}`)
    throw new CloudinaryError(
      err.message || 'Cloudinary upload connection failed.',
      err.http_code || 500
    )
  }
}
