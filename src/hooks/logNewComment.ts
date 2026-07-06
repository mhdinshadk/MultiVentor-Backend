import type { CollectionAfterChangeHook } from 'payload'

export const logNewComment: CollectionAfterChangeHook = ({ doc, operation }) => {
  if (operation === 'create') {
    console.log(
      `New comment submitted by ${doc.authorName} on article ${doc.article}`,
    )
  }

  return doc
}