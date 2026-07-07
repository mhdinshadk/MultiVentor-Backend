import streamifier from 'streamifier'
import { getCloudinaryClient } from './config'
import { CloudinaryUploadResult } from './types'
import { retryWithBackoff } from './retry'
import { logger } from '../../utilities/logger'
import { CloudinaryError } from '../../utilities/errors'

export async function uploadImageStream(
  buffer: Buffer,
  folder: string,
  publicId?: string
): Promise<CloudinaryUploadResult> {
  const cloudinary = getCloudinaryClient()

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
      uploadStream.on('error', (err) => {
        reject(err)
      })

      // Convert buffer to readable stream using streamifier and pipe it
      streamifier.createReadStream(buffer).pipe(uploadStream)
    })

  try {
    const startTime = Date.now()
    logger.info(`[Cloudinary] Upload started. Target folder: "${folder}"`)

    const result = await retryWithBackoff(uploadFn)

    const duration = Date.now() - startTime
    logger.info(
      `[Cloudinary] Upload completed successfully. Duration: ${duration}ms. Public ID: ${result.public_id}`
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
