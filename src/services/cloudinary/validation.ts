import { CloudinaryValidationError } from '../../utilities/errors'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
]

export function validateImageFile(file: any): void {
  if (!file) {
    throw new CloudinaryValidationError('No file was uploaded.')
  }

  // Validate buffer existence
  const buffer = file.buffer || file.data
  if (!buffer) {
    throw new CloudinaryValidationError('Uploaded file buffer could not be processed.')
  }

  // Validate size
  if (file.size > MAX_FILE_SIZE) {
    throw new CloudinaryValidationError('File size exceeds the 10 MB upload limit.')
  }

  // Validate MIME type
  const mimeType = file.mimetype || file.mimeType || ''
  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    throw new CloudinaryValidationError(
      'Unsupported file type. Only JPG, JPEG, PNG, WEBP, GIF, and SVG images are allowed.'
    )
  }
}
