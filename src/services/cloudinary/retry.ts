import { logger } from '../../utilities/logger'

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  retries: number = 3,
  delay: number = 1000
): Promise<T> {
  try {
    return await fn()
  } catch (error: any) {
    // Only retry transient network errors. Avoid retrying auth (401/403) or validation (400) failures.
    const isTransient =
      error.code === 'ETIMEDOUT' ||
      error.code === 'ECONNRESET' ||
      error.http_code >= 500 ||
      error.message?.includes('timeout') ||
      error.message?.includes('socket') ||
      error.message?.includes('Network Error')

    if (retries > 0 && isTransient) {
      logger.warn(
        `Cloudinary connection transient error. Retrying in ${delay}ms... (${retries} retries left). Error: ${
          error.message || error
        }`
      )
      await new Promise((resolve) => setTimeout(resolve, delay))
      return retryWithBackoff(fn, retries - 1, delay * 2)
    }
    throw error
  }
}
