import type { CollectionAfterChangeHook } from 'payload'

export const revalidateFrontend: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  req,
}) => {
  // Only trigger revalidation if the status is published or was published
  const isPublished = doc._status === 'published'
  const wasPublished = previousDoc?._status === 'published'

  if (isPublished || wasPublished) {
    const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000'
    const secret = process.env.REVALIDATION_SECRET || 'revalidate-secret'

    try {
      // Revalidate the article path
      const url = `${frontendUrl}/api/revalidate?secret=${secret}&path=/articles/${doc.slug}`
      console.log(`Revalidating path: ${url}`)
      await fetch(url)

      // Revalidate the home path
      const homeUrl = `${frontendUrl}/api/revalidate?secret=${secret}&path=/`
      await fetch(homeUrl)

      // Revalidate browse articles path
      const browseUrl = `${frontendUrl}/api/revalidate?secret=${secret}&path=/articles`
      await fetch(browseUrl)

      // Revalidate categories path
      const categoriesUrl = `${frontendUrl}/api/revalidate?secret=${secret}&path=/categories`
      await fetch(categoriesUrl)
      
      // If author is populated or exists
      if (doc.author) {
        let authorRes;
        if (typeof doc.author === 'object' && doc.author.slug) {
          authorRes = doc.author;
        } else {
          // Fetch author
          authorRes = await req.payload.findByID({
            collection: 'authors',
            id: typeof doc.author === 'object' ? doc.author.id : doc.author,
          })
        }
        if (authorRes?.slug) {
          const authorUrl = `${frontendUrl}/api/revalidate?secret=${secret}&path=/authors/${authorRes.slug}`
          await fetch(authorUrl)
        }
      }
    } catch (err) {
      console.error('Failed to trigger frontend revalidation:', err)
    }
  }

  return doc
}
