// import type { CollectionConfig } from 'payload'

// export const Media: CollectionConfig = {
//   slug: 'media',

//   upload: {
//     staticDir: 'media',

//     imageSizes: [
//       {
//         name: 'thumbnail',
//         width: 300,
//         height: 300,
//         position: 'centre',
//       },
//       {
//         name: 'card',
//         width: 800,
//         height: 600,
//         position: 'centre',
//       },
//     ],

//     adminThumbnail: 'thumbnail',
//   },

//   fields: [
//     {
//       name: 'alt',
//       label: 'Alternative Text',
//       type: 'text',
//       required: true,
//     },
//   ],
// }

import type { CollectionConfig } from "payload";
import { uploadToCloudinary } from "../hooks/uploadToCloudinary";

export const Media: CollectionConfig = {
  slug: "media",

  hooks: {
    beforeChange: [uploadToCloudinary],
    afterRead: [
      ({ doc }) => {
        if (doc.cloudinaryUrl) {
          doc.url = doc.cloudinaryUrl;
        }
        return doc;
      },
    ],
  },

  access: {
    read: () => true, // Allow everyone to read media
    create: ({ req }) => req.user?.role === 'admin' || req.user?.role === 'author',
    update: ({ req }) => req.user?.role === 'admin' || req.user?.role === 'author',
    delete: ({ req }) => req.user?.role === 'admin' || req.user?.role === 'author',
  },

  upload: {
    staticDir: "media",

    imageSizes: [
      {
        name: "thumbnail",
        width: 300,
        height: 300,
        position: "center",
      },
      {
        name: "card",
        width: 800,
        height: 600,
        position: "center",
      },
    ],

    adminThumbnail: "thumbnail",
  },

  fields: [
    {
      name: "alt",
      type: "text",
      required: true,
    },
    {
      name: "cloudinaryUrl",
      type: "text",
      admin: {
        readOnly: true,
        position: "sidebar",
      },
    },
  ],
};