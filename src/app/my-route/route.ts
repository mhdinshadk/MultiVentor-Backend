import { v2 as cloudinary } from 'cloudinary'
import { getCredentials } from '../../services/cloudinary/config'

export const GET = async () => {
  try {
    const creds = getCredentials()

    // Configure Cloudinary for the test request
    cloudinary.config({
      cloud_name: creds.cloudName,
      api_key: creds.apiKey,
      api_secret: creds.apiSecret,
    })

    // Try uploading a 1x1 transparent pixel base64 image
    const pixel = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
    const uploadResult = await cloudinary.uploader.upload(pixel, {
      folder: 'test',
      public_id: 'test_pixel_route',
    })

    return Response.json({
      status: 'success',
      url: uploadResult.secure_url,
      cloudName: creds.cloudName,
    })
  } catch (err: any) {
    return Response.json({
      status: 'error',
      message: err.message || err,
    })
  }
}
