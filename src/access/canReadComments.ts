import type { Access } from 'payload'

export const canReadComments: Access = ({ req }) => {
  if (req.user?.role === 'admin') {
    return true
  }

  return {
    approved: {
      equals: true,
    },
  } as any
}
