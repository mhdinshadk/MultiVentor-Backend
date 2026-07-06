import type { CollectionBeforeChangeHook } from 'payload'

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
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME
    const apiKey = process.env.CLOUDINARY_API_KEY
    const apiSecret = process.env.CLOUDINARY_API_SECRET

    if (!cloudName || !apiKey || !apiSecret) {
      console.warn('Cloudinary credentials are not fully configured in environment variables.')
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
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
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
