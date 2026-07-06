import type { CollectionConfig } from 'payload'
import { generateSlug } from '../hooks/generateSlug'

export const Authors: CollectionConfig = {
  slug: 'authors',

  admin: {
    useAsTitle: 'displayName',
    defaultColumns: ['displayName', 'slug', 'user'],
  },
  access: {
    read: () => true,
    create: ({ req }) => req.user?.role === 'admin' || req.user?.role === 'author',
    update: ({ req }) => req.user?.role === 'admin' || req.user?.role === 'author',
    delete: ({ req }) => req.user?.role === 'admin',
  },

  fields: [
    {
      name: 'displayName',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      required: false,
      admin: {
        description: 'Auto-generated from the display name if left blank.',
        position: 'sidebar',
      },
      hooks: {
        beforeValidate: [generateSlug],
      },
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      unique: true,
    },
    {
      name: 'bio',
      type: 'richText',
      required: true,
    },
    {
      name: 'avatar',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'socialLinks',
      type: 'array',
      fields: [
        {
          name: 'platform',
          type: 'text',
          required: true,
        },
        {
          name: 'url',
          type: 'text',
          required: true,
        },
      ],
    },
  ],
}