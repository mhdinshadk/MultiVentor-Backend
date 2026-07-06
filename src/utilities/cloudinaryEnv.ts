type CloudinaryCredentials = {
  cloudName: string
  apiKey: string
  apiSecret: string
}

const PLACEHOLDER_VALUES = new Set([
  'your_cloud_name_here',
  'your_api_key_here',
  'your_api_secret_here',
])

function isPlaceholder(value: string | undefined): boolean {
  if (!value) return true
  return PLACEHOLDER_VALUES.has(value) || value.includes('your_api_secret')
}

function parseCloudinaryUrl(url: string): CloudinaryCredentials | null {
  // cloudinary://<api_key>:<api_secret>@<cloud_name>
  const match = url.match(/^cloudinary:\/\/([^:]+):([^@]+)@([^/?]+)/)
  if (!match) return null

  const [, apiKey, apiSecret, cloudName] = match
  if (isPlaceholder(apiKey) || isPlaceholder(apiSecret) || isPlaceholder(cloudName)) {
    return null
  }

  return { cloudName, apiKey, apiSecret }
}

export function getCloudinaryCredentials(): CloudinaryCredentials | null {
  const cloudinaryUrl = process.env.CLOUDINARY_URL
  if (cloudinaryUrl && !isPlaceholder(cloudinaryUrl)) {
    const parsed = parseCloudinaryUrl(cloudinaryUrl)
    if (parsed) return parsed
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET

  if (
    isPlaceholder(cloudName) ||
    isPlaceholder(apiKey) ||
    isPlaceholder(apiSecret)
  ) {
    return null
  }

  return { cloudName: cloudName!, apiKey: apiKey!, apiSecret: apiSecret! }
}

export function isCloudinaryConfigured(): boolean {
  return getCloudinaryCredentials() !== null
}
