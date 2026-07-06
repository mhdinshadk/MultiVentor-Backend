import { v2 as cloudinary } from 'cloudinary'
import { getCloudinaryCredentials, isCloudinaryConfigured } from '../../utilities/cloudinaryEnv'

export const GET = async () => {
  const credentials = getCloudinaryCredentials()

  const status = {
    configured: isCloudinaryConfigured(),
    cloudNameSet: !!credentials?.cloudName,
    apiKeySet: !!credentials?.apiKey,
    apiSecretSet: !!credentials?.apiSecret,
    testUpload: 'Not run yet',
  }

  if (credentials) {
    cloudinary.config({
      cloud_name: credentials.cloudName,
      api_key: credentials.apiKey,
      api_secret: credentials.apiSecret,
    })

    try {
      const pixel = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
      const uploadResult = await cloudinary.uploader.upload(pixel, {
        folder: 'test',
        public_id: `test_pixel_${Date.now()}`,
      })

      status.testUpload = 'Success: ' + uploadResult.secure_url
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : JSON.stringify(err)
      status.testUpload = 'Error: ' + message
    }
  } else {
    status.testUpload =
      'Error: Set CLOUDINARY_URL or CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET on Render.'
  }

  return Response.json(status)
}
