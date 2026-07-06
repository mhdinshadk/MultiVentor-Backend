import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: true,
  access: {
    read: ({ req }) => {
      if (req.user?.role === 'admin') return true
      if (req.user) {
        return {
          id: {
            equals: req.user.id,
          },
        }
      }
      return false
    },
    create: ({ req }) => {
      // Allow admins to create users. Public registration is allowed but they cannot set high-privilege roles due to field access.
      return req.user?.role === 'admin'
    },
    update: ({ req }) => {
      if (req.user?.role === 'admin') return true
      if (req.user) {
        return {
          id: {
            equals: req.user.id,
          },
        }
      }
      return false
    },
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    {
      name: 'role',
      type: 'select',
      defaultValue: 'reader',
      required: true,
      access: {
        create: ({ req }) => req.user?.role === 'admin',
        update: ({ req }) => req.user?.role === 'admin',
      },
      options: [
        {
          label: 'Admin',
          value: 'admin',
        },
        {
          label: 'Author',
          value: 'author',
        },
        {
          label: 'Reader',
          value: 'reader',
        },
      ],
    },
  ],
}
