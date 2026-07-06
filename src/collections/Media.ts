import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',

  hooks: {
    afterRead: [
      ({ doc }) => {
        // Backward compatibility for records created before the Cloudinary plugin
        if (!doc.url && doc.cloudinaryUrl) {
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
  ],
}
