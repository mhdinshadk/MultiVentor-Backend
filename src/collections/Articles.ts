import type { CollectionConfig } from 'payload'
import { generateSlug } from '../hooks/generateSlug'
import { calculateReadTime } from '../hooks/calculateReadTime'
import { setPublishedDate } from '../hooks/setPublishedDate'
import { revalidateFrontend } from '../hooks/revalidateFrontend'
import { canReadPublished } from '../access/canReadPublished'
import { isAdminOrAuthor } from '../access/isAdminOrAuthor'
import { isAdminOrOwnAuthor } from '../access/isAdminOrOwnAuthor'

export const Articles: CollectionConfig = {
  slug: 'articles',

  hooks: {
    beforeChange: [
      calculateReadTime,
      setPublishedDate,
    ],
    afterChange: [
      revalidateFrontend,
    ],
  },
  access: {
    read: canReadPublished,

    create: isAdminOrAuthor,

    update: isAdminOrOwnAuthor,

    delete: isAdminOrOwnAuthor,
  },

  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'author', '_status', 'publishedAt'],
  },

versions: {
    drafts: true,
},
  fields: [
    {
      name: 'title',
      label: 'Title',
      type: 'text',
      required: true,
    },

    {
      name: 'slug',
      label: 'Slug',
      type: 'text',
      unique: true,
      required: false,
      admin: {
        description: 'Auto-generated from the title if left blank.',
        position: 'sidebar',
      },
      hooks: {
        beforeValidate: [generateSlug],
      },
    },

    {
      name: 'content',
      label: 'Content',
      type: 'richText',
      required: true,
    },

    {
      name: 'featuredImage',
      label: 'Featured Image',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },

    {
      name: 'author',
      label: 'Author',
      type: 'relationship',
      relationTo: 'authors',
      required: true,
      hasMany: false,
      validate: async (value, { req }) => {
        if (!req.user) return 'You must be logged in'
        if (req.user.role === 'admin') return true
        
        // Find the Author document associated with the logged-in User
        const authorRes = await req.payload.find({
          collection: 'authors',
          where: {
            user: {
              equals: req.user.id,
            },
          },
          limit: 1,
        })
        
        if (!authorRes.docs || authorRes.docs.length === 0) {
          return 'You must have an Author profile to create or edit articles'
        }
        
        const myAuthorId = authorRes.docs[0].id;
        const selectedId = typeof value === 'object' && value !== null ? (value as any).id : value;
        
        if (selectedId !== myAuthorId) {
          return 'You can only assign articles to your own Author profile'
        }
        
        return true
      },
    },

    {
      name: 'categories',
      label: 'Categories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      required: true,
    },

    {
      name: 'publishedAt',
      label: 'Published Date',
      type: 'date',
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },

    {
      name: 'readTime',
      label: 'Read Time (minutes)',
      type: 'number',
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
  ],
}