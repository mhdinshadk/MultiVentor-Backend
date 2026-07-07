import { getCloudinaryClient } from './config'
import { logger } from '../../utilities/logger'

export async function deleteImage(publicId: string): Promise<boolean> {
  const cloudinary = getCloudinaryClient()

  try {
    logger.info(`[Cloudinary] Delete started. Public ID: "${publicId}"`)
    const result = await cloudinary.uploader.destroy(publicId)

    logger.info(`[Cloudinary] Delete completed. Result: ${JSON.stringify(result)}`)
    return result.result === 'ok'
  } catch (err: any) {
    // Spec: Deletion errors should never crash the application. Only log them.
    logger.error(
      `[Cloudinary] Failed to delete image "${publicId}" from Cloudinary: ${err.message || err}`
    )
    return false
  }
}
