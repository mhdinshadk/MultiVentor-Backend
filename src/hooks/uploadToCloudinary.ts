import type { CollectionBeforeChangeHook } from 'payload'
import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary once
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export const uploadToCloudinary: CollectionBeforeChangeHook = async ({
  data,
  req,
  operation,
}) => {
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
    } catch (err) {
      console.error('[Cloudinary] Upload hook error:', err)
    }
  }

  return data
}
