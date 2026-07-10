import type { FieldHook } from 'payload'

const format = (val: string): string =>
  val
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')

export const generateSlug: FieldHook = ({ operation, value, originalDoc, data }) => {
  // 1. Keep manually entered/edited slug by the user
  if (typeof value === 'string' && value.trim().length > 0) {
    if (operation === 'create') {
      return format(value)
    }
    // On update, if the slug in the incoming data differs from the original document,
    // it means the user manually edited the slug field. Keep their manual edit.
    if (operation === 'update' && originalDoc && originalDoc.slug !== value) {
      return format(value)
    }
  }

  // 2. Helper to find the source field value (name, title, or displayName)
  const getSourceValue = (doc: any) => doc?.name || doc?.title || doc?.displayName

  const incomingSource = getSourceValue(data)

  // 3. Generate slug on creation
  if (operation === 'create' && incomingSource) {
    return format(incomingSource)
  }

  // 4. Regenerate slug on update ONLY if the source field (title/name) has changed
  if (operation === 'update' && originalDoc) {
    const originalSource = getSourceValue(originalDoc)
    
    if (incomingSource && incomingSource !== originalSource) {
      return format(incomingSource)
    }
  }

  // 5. Otherwise, retain the existing slug
  return value || originalDoc?.slug || ''
}