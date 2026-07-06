import type { CollectionConfig } from 'payload'
import { generateSlug } from '../hooks/generateSlug'

export const Categories: CollectionConfig = {
  slug: 'categories',

  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug'],
  },
  access: {
  read: () => true,
},

  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },

    {
      name: 'description',
      type: 'textarea',
      required: false,
      admin: {
        description: 'A brief description of this category for the directory pages.',
      },
    },

    {
      name: 'slug',
      type: 'text',
      unique: true,
      required: false,
      admin: {
        description: 'Auto-generated from the name if left blank.',
        position: 'sidebar',
      },
      hooks: {
        beforeValidate: [generateSlug],
      },
    },

    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: false,
    },
  ],
}