import type { CollectionBeforeChangeHook, CollectionAfterDeleteHook } from 'payload'
import { APIError } from 'payload'
import { getCloudinaryCredentials } from '../utilities/cloudinaryEnv'

// Validation constraints
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
]

export const uploadToCloudinary: CollectionBeforeChangeHook = async ({
  data,
  req,
  operation,
  originalDoc,
}) => {
  // Guard clause to prevent browser execution
  if (typeof window !== 'undefined') {
    return data
  }

  // Get uploaded file
  const file = (req.file || (req.files && req.files.file)) as any

  // 1. Validation for creation
  if (operation === 'create' && !file) {
    throw new APIError('No image file uploaded.', 400)
  }

  // 2. Process file if present (create or update)
  if (file) {
    // Validate file size (10 MB limit)
    if (file.size > MAX_FILE_SIZE) {
      throw new APIError('File size exceeds the 10 MB upload limit.', 400)
    }

    // Validate MIME type
    const mimeType = file.mimetype || file.mimeType || ''
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      throw new APIError(
        'Unsupported file type. Only JPG, JPEG, PNG, WEBP, GIF, and SVG images are allowed.',
        400
      )
    }

    const credentials = getCloudinaryCredentials()
    if (!credentials) {
      throw new APIError(
        'Cloudinary is not configured. Please check your environment variables in the Render dashboard.',
        500
      )
    }

    try {
      const buffer = file.buffer || file.data
      if (!buffer) {
        throw new APIError('Uploaded file buffer could not be processed.', 400)
      }

      // Dynamically import cloudinary SDK (server-only)
      const { v2: cloudinary } = await import('cloudinary')

      // Configure Cloudinary
      cloudinary.config({
        cloud_name: credentials.cloudName,
        api_key: credentials.apiKey,
        api_secret: credentials.apiSecret,
      })

      // If we are updating the image, delete the old image from Cloudinary first
      if (operation === 'update' && originalDoc?.cloudinaryPublicId) {
        console.log(`[Cloudinary] Deleting old image: ${originalDoc.cloudinaryPublicId}`)
        await cloudinary.uploader.destroy(originalDoc.cloudinaryPublicId).catch((err) => {
          console.warn('[Cloudinary] Failed to delete previous image from Cloudinary:', err)
        })
      }

      const filename = data.filename || file.name || 'upload'
      const publicId = filename.substring(0, filename.lastIndexOf('.')) || filename

      console.log(`[Cloudinary] Uploading ${filename} to Cloudinary folder "blog/media"...`)

      const uploadResult = await new Promise<any>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            public_id: publicId,
            folder: 'blog/media',
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
        stream.write(buffer)
        stream.end()
      })

      console.log(`[Cloudinary] Successfully uploaded: ${uploadResult.secure_url}`)

      // Save metadata to Payload record
      data.url = uploadResult.secure_url
      data.cloudinaryUrl = uploadResult.secure_url
      data.cloudinaryPublicId = uploadResult.public_id
      data.imageFormat = uploadResult.format || uploadResult.resource_type
    } catch (err: any) {
      console.error('[Cloudinary] Upload hook error:', err)
      throw new APIError(
        `Cloudinary upload failed: ${err?.message || JSON.stringify(err)}`,
        500
      )
    }
  }

  return data
}

export const deleteFromCloudinary: CollectionAfterDeleteHook = async ({
  doc,
  req,
}) => {
  if (typeof window !== 'undefined') {
    return
  }

  if (doc?.cloudinaryPublicId) {
    const credentials = getCloudinaryCredentials()
    if (!credentials) return

    try {
      const { v2: cloudinary } = await import('cloudinary')

      cloudinary.config({
        cloud_name: credentials.cloudName,
        api_key: credentials.apiKey,
        api_secret: credentials.apiSecret,
      })

      console.log(`[Cloudinary] Deleting image from Cloudinary: ${doc.cloudinaryPublicId}`)
      await cloudinary.uploader.destroy(doc.cloudinaryPublicId)
    } catch (err) {
      console.error('[Cloudinary] Failed to delete image from Cloudinary:', err)
    }
  }
}
