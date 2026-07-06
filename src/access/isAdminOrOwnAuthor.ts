import type { Access } from 'payload'

export const isAdminOrOwnAuthor: Access = async ({ req }) => {
  const user = req.user

  if (!user) return false

  if (user.role === 'admin') return true

  if (user.role === 'author') {
    // Find the Author document associated with the logged-in User
    const authorRes = await req.payload.find({
      collection: 'authors',
      where: {
        user: {
          equals: user.id,
        },
      },
      limit: 1,
    })

    const authorId = authorRes.docs?.[0]?.id

    if (authorId) {
      return {
        author: {
          equals: authorId,
        },
      } as any
    }
  }

  return false
}
