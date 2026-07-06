import type { Access } from 'payload'

export const isAdminOrAuthor: Access = ({ req }) => {
  const user = req.user

  if (!user) return false

  return user.role === 'admin' || user.role === 'author'
}