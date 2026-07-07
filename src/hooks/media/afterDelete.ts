import type { CollectionAfterDeleteHook } from 'payload'
import { deleteImage } from '../../lib/cloudinary'

export const afterDeleteHook: CollectionAfterDeleteHook = async ({ doc }) => {
  if (typeof window !== 'undefined') {
    return
  }

  if (doc?.cloudinaryPublicId) {
    // Delete from Cloudinary, errors logged internally
    await deleteImage(doc.cloudinaryPublicId)
  }
}
