import type { CollectionAfterErrorHook } from 'payload'
import { deleteImage } from '../../lib/cloudinary'
import { logger } from '../../utilities/logger'

export const afterErrorHook: CollectionAfterErrorHook = async ({ req }) => {
  if (typeof window !== 'undefined') {
    return
  }

  const uploadedId = (req as any).cloudinaryUploadedPublicId
  if (uploadedId) {
    logger.warn(
      `[Cleanup] Database operation aborted/failed. Cleaning up orphaned Cloudinary asset: "${uploadedId}"`
    )
    // Clean up the Cloudinary image
    await deleteImage(uploadedId)
    // Clear tracking ID
    delete (req as any).cloudinaryUploadedPublicId
  }
}
