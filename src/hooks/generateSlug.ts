import type { FieldHook } from 'payload'

export const generateSlug: FieldHook = ({ value, data }) => {
  // Keep manually entered slug
  if (value) return value

  // Find the source field (support name, title, or displayName)
  const source = data?.name || data?.title || data?.displayName

  // If neither exists, return empty
  if (!source) return ''

  // Generate slug
  return source
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
}