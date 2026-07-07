import { APIError } from 'payload'

export class CloudinaryError extends APIError {
  constructor(message: string, statusCode: number = 500) {
    // Force a descriptive error message that will bypass Next.js production masking in the browser
    super(message, statusCode, undefined, true)
    this.name = 'CloudinaryError'
  }
}

export class CloudinaryValidationError extends APIError {
  constructor(message: string) {
    super(message, 400, undefined, true)
    this.name = 'CloudinaryValidationError'
  }
}
