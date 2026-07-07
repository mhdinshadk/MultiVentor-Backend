import type { CollectionConfig } from 'payload'
import { beforeChangeHook, afterDeleteHook, afterErrorHook } from '../hooks/media'

export const Media: CollectionConfig = {
  slug: 'media',

  hooks: {
    beforeChange: [beforeChangeHook],
    afterDelete: [afterDeleteHook],
    afterError: [afterErrorHook],
    afterRead: [
      ({ doc }) => {
        if (doc.cloudinaryUrl) {
          doc.url = doc.cloudinaryUrl
        }
        return doc
      },
    ],
  },

  access: {
    read: () => true,
    create: ({ req }) => req.user?.role === 'admin' || req.user?.role === 'author',
    update: ({ req }) => req.user?.role === 'admin' || req.user?.role === 'author',
    delete: ({ req }) => req.user?.role === 'admin' || req.user?.role === 'author',
  },

  upload: {
    staticDir: 'media',
    disableLocalStorage: true,
    imageSizes: [
      {
        name: 'thumbnail',
        width: 300,
        height: 300,
        position: 'center',
      },
      {
        name: 'card',
        width: 800,
        height: 600,
        position: 'center',
      },
    ],
    adminThumbnail: 'thumbnail',
  },

  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
    {
      name: 'cloudinaryUrl',
      type: 'text',
      admin: {
        hidden: true,
        readOnly: true,
      },
    },
    {
      name: 'cloudinaryPublicId',
      type: 'text',
      admin: {
        hidden: true,
        readOnly: true,
      },
    },
    {
      name: 'imageFormat',
      type: 'text',
      admin: {
        hidden: true,
        readOnly: true,
      },
    },
  ],
}
