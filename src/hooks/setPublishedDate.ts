import type { CollectionBeforeChangeHook } from 'payload'

export const setPublishedDate: CollectionBeforeChangeHook = ({
  data,
  originalDoc,
}) => {
  const isPublishing =
    data?._status === 'published' &&
    originalDoc?._status !== 'published'

  if (isPublishing) {
    data.publishedAt = new Date()
  }

  return data
}