import type { CollectionConfig } from 'payload'
import { logNewComment } from '../hooks/logNewComment'
import { canReadComments } from '../access/canReadComments'
import { isAdmin } from '../access/isAdmin'

export const Comments: CollectionConfig = {
  slug: 'comments',

  admin: {
    useAsTitle: 'authorName',
    defaultColumns: ['authorName', 'article', 'approved'],
  },

  access: {
    read: canReadComments,
    create: () => true, // Anyone can submit a comment
    update: isAdmin,    // Only admin can update comments
    delete: isAdmin,    // Only admin can delete comments
  },

  hooks: {
    afterChange: [logNewComment],
  },

  fields: [
    {
      name: 'article',
      type: 'relationship',
      relationTo: 'articles',
      required: true,
    },
    {
      name: 'authorName',
      type: 'text',
      required: true,
    },
    {
      name: 'authorEmail',
      type: 'email',
      required: true,
    },
    {
      name: 'content',
      type: 'textarea',
      required: true,
    },
    {
      name: 'approved',
      type: 'checkbox',
      defaultValue: false,
      access: {
        create: ({ req }) => req.user?.role === 'admin',
        update: ({ req }) => req.user?.role === 'admin',
      },
      admin: {
        position: 'sidebar',
      },
    },
  ],
}