import type { CollectionBeforeChangeHook } from 'payload'
import { validateImageFile, uploadImageStream, deleteImage } from '../../lib/cloudinary'

export const beforeChangeHook: CollectionBeforeChangeHook = async ({
  data,
  req,
  operation,
  originalDoc,
}) => {
  // Guard browser context
  if (typeof window !== 'undefined') {
    return data
  }

  const file = (req.file || (req.files && req.files.file)) as any

  if (file) {
    // 1. Validate image (size, type, buffer integrity)
    validateImageFile(file)

    // 2. Determine target folder (defaults to blog/media)
    const folder = 'blog/media'

    // 3. Generate unique Public ID (Timestamp + Random String)
    const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`

    // 4. If updating, clean up the old asset from Cloudinary
    if (operation === 'update' && originalDoc?.cloudinaryPublicId) {
      // Async deletion without blocking
      deleteImage(originalDoc.cloudinaryPublicId)
    }

    const buffer = file.buffer || file.data

    // 5. Upload buffer stream to Cloudinary
    const uploadResult = await uploadImageStream(buffer, folder, uniqueId)

    // 6. Save tracking ID to request context to clean up if DB write fails
    ;(req as any).cloudinaryUploadedPublicId = uploadResult.public_id

    // 7. Write metadata fields to data payload
    data.url = uploadResult.secure_url
    data.cloudinaryUrl = uploadResult.secure_url
    data.cloudinaryPublicId = uploadResult.public_id
    data.imageFormat = uploadResult.format
  }

  return data
}
