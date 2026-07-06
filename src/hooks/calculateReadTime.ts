import type { CollectionBeforeChangeHook } from 'payload'

const WORDS_PER_MINUTE = 200

const extractText = (node: unknown): string => {
  if (!node || typeof node !== 'object') return ''

  const current = node as {
    text?: string
    children?: unknown[]
  }

  let text = current.text ?? ''

  if (Array.isArray(current.children)) {
    for (const child of current.children) {
      text += ' ' + extractText(child)
    }
  }

  return text
}

export const calculateReadTime: CollectionBeforeChangeHook = ({ data }) => {
  if (!data?.content) return data

  const text = extractText(data.content)

  const words = text
    .trim()
    .split(/\s+/)
    .filter(Boolean).length

  data.readTime = Math.max(
    1,
    Math.ceil(words / WORDS_PER_MINUTE),
  )

  return data
}