import { v2 as cloudinary } from 'cloudinary'
import { logger } from '../../utilities/logger'
import { CloudinaryError } from '../../utilities/errors'
import { CloudinaryCredentials } from './types'

function cleanEnvValue(value: string | undefined): string | undefined {
  if (!value) return undefined
  return value.trim().replace(/^['"]|['"]$/g, '')
}

function parseCloudinaryUrl(url: string): CloudinaryCredentials | null {
  const cleanedUrl = cleanEnvValue(url) || ''
  const match = cleanedUrl.match(/^cloudinary:\/\/([^:]+):([^@]+)@([^/?]+)/)
  if (!match) return null
  const [, apiKey, apiSecret, cloudName] = match
  return { cloudName, apiKey, apiSecret }
}

export function getCredentials(): CloudinaryCredentials {
  const cloudinaryUrl = cleanEnvValue(process.env.CLOUDINARY_URL)
  if (cloudinaryUrl) {
    const parsed = parseCloudinaryUrl(cloudinaryUrl)
    if (parsed) return parsed
  }

  const cloudName = cleanEnvValue(process.env.CLOUDINARY_CLOUD_NAME)
  const apiKey = cleanEnvValue(process.env.CLOUDINARY_API_KEY)
  const apiSecret = cleanEnvValue(process.env.CLOUDINARY_API_SECRET)

  const PLACEHOLDERS = ['your_cloud_name_here', 'your_api_key_here', 'your_api_secret_here', 'cms-blog']

  if (
    !cloudName ||
    !apiKey ||
    !apiSecret ||
    PLACEHOLDERS.includes(cloudName) ||
    PLACEHOLDERS.includes(apiKey) ||
    PLACEHOLDERS.includes(apiSecret)
  ) {
    throw new CloudinaryError(
      'Cloudinary credentials are not configured. Please check your environment variables in the Render dashboard.',
      500
    )
  }

  return { cloudName, apiKey, apiSecret }
}

let isConfigured = false

export function getCloudinaryClient() {
  if (!isConfigured) {
    const creds = getCredentials()
    cloudinary.config({
      cloud_name: creds.cloudName,
      api_key: creds.apiKey,
      api_secret: creds.apiSecret,
    })
    isConfigured = true
    logger.info('Cloudinary SDK Singleton Client Initialized.')
  }
  return cloudinary
}
