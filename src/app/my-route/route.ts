import { v2 as cloudinary } from 'cloudinary'

export const GET = async (request: Request) => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || ''
  const apiKey = process.env.CLOUDINARY_API_KEY || ''
  const apiSecret = process.env.CLOUDINARY_API_SECRET || ''
  const cloudinaryUrl = process.env.CLOUDINARY_URL || ''

  const status = {
    cloudNameSet: !!cloudName && cloudName !== 'your_cloud_name_here',
    apiKeySet: !!apiKey && apiKey !== 'your_api_key_here',
    apiSecretSet: !!apiSecret && apiSecret !== 'your_api_secret_here',
    cloudinaryUrlSet: !!cloudinaryUrl && !cloudinaryUrl.includes('your_api_secret'),
    cloudNameLength: cloudName.length,
    apiKeyLength: apiKey.length,
    apiSecretLength: apiSecret.length,
    cloudinaryUrlLength: cloudinaryUrl.length,
    testUpload: 'Not run yet',
  }

  if (status.cloudinaryUrlSet || (status.cloudNameSet && status.apiKeySet && status.apiSecretSet)) {
    try {
      if (!status.cloudinaryUrlSet) {
        cloudinary.config({
          cloud_name: cloudName,
          api_key: apiKey,
          api_secret: apiSecret,
        })
      }

      // Try uploading a 1x1 transparent pixel base64 image
      const pixel = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
      const uploadResult = await cloudinary.uploader.upload(pixel, {
        folder: 'test',
        public_id: 'test_pixel_render',
      })

      status.testUpload = 'Success: ' + uploadResult.secure_url
    } catch (err: any) {
      status.testUpload = 'Error: ' + (err.message || JSON.stringify(err))
    }
  } else {
    status.testUpload = 'Error: Neither CLOUDINARY_URL nor individual credentials are configured.'
  }

  return Response.json(status)
}
