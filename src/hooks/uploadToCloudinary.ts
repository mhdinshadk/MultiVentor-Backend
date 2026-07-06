import type { CollectionBeforeChangeHook } from 'payload'
import crypto from 'crypto'

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
      const buffer = (file as any).buffer || (file as any).data
      if (!buffer) {
        return data
      }

      const timestamp = Math.round(new Date().getTime() / 1000)
      const filename = data.filename || file.name || 'upload'
      // Use original filename without extension as public_id
      const publicId = filename.substring(0, filename.lastIndexOf('.')) || filename

      // Sort and sign parameters
      const params = `public_id=${publicId}&timestamp=${timestamp}`
      const stringToSign = `${params}${apiSecret}`
      const signature = crypto.createHash('sha1').update(stringToSign).digest('hex')

      const formData = new FormData()
      const base64Data = `data:${file.mimeType};base64,${buffer.toString('base64')}`

      formData.append('file', base64Data)
      formData.append('api_key', apiKey)
      formData.append('timestamp', timestamp.toString())
      formData.append('public_id', publicId)
      formData.append('signature', signature)

      console.log(`[Cloudinary] Uploading ${filename} to Cloudinary...`)
      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      })

      const resData = await response.json()
      if (!response.ok) {
        throw new Error(resData.error?.message || 'Failed to upload to Cloudinary')
      }

      console.log(`[Cloudinary] Successfully uploaded: ${resData.secure_url}`)
      // Override the url to use Cloudinary's secure URL
      data.url = resData.secure_url
    } catch (err) {
      console.error('[Cloudinary] Upload hook error:', err)
    }
  }

  return data
}
