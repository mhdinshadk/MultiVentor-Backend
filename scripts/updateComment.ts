import { getPayload } from 'payload'
import config from '../src/payload.config.js'

async function updateComment() {
  try {
    const payload = await getPayload({ config })
    const articles = await payload.find({ collection: 'articles', limit: 1 })
    const articleId = articles.docs[0].id
    
    const comments = await payload.find({ collection: 'comments', limit: 1 })
    const commentId = comments.docs[0].id

    await payload.update({
      collection: 'comments',
      id: commentId,
      data: { article: articleId as any, approved: true }
    })
    
    console.log(`Updated comment ${commentId} to point to article ${articleId}`)
    process.exit(0)
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}

updateComment()
