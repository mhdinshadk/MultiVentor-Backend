import type { CollectionBeforeChangeHook } from 'payload'
import { getCloudinaryCredentials } from '../utilities/cloudinaryEnv'

export const uploadToCloudinary: CollectionBeforeChangeHook = async ({
  data,
  req,
  operation,
}) => {
  // Guard clause to prevent browser execution
  if (typeof window !== 'undefined') {
    return data
  }

  // Check if there is an uploaded file
  const file = (req.file || (req.files && req.files.file)) as any

  if (file && operation === 'create') {
    const credentials = getCloudinaryCredentials()

    if (!credentials) {
      console.warn('Cloudinary credentials are not configured in environment variables.')
      return data
    }

    try {
      const buffer = file.buffer || file.data
      if (!buffer) {
        console.warn('No file buffer or data found for Cloudinary upload.')
        return data
      }

      // Dynamically import cloudinary SDK (server-only)
      const { v2: cloudinary } = await import('cloudinary')

      // Configure Cloudinary on the server
      cloudinary.config({
        cloud_name: credentials.cloudName,
        api_key: credentials.apiKey,
        api_secret: credentials.apiSecret,
      })

      const filename = data.filename || file.name || 'upload'
      // Use original filename without extension as public_id
      const publicId = filename.substring(0, filename.lastIndexOf('.')) || filename

      console.log(`[Cloudinary] Uploading ${filename} to Cloudinary using SDK...`)
      
      const uploadResult = await new Promise<any>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
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
        stream.write(buffer)
        stream.end()
      })

      console.log(`[Cloudinary] Successfully uploaded to Cloudinary: ${uploadResult.secure_url}`)
      // Override the url to use Cloudinary's secure URL
      data.url = uploadResult.secure_url
      data.cloudinaryUrl = uploadResult.secure_url
    } catch (err: any) {
      console.error('[Cloudinary] Upload hook error:', err)
      throw new Error(`Cloudinary upload failed: ${err?.message || err}`)
    }
  }

  return data
}
