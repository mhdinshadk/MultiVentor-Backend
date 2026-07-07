export interface CloudinaryUploadResult {
  secure_url: string
  public_id: string
  width: number
  height: number
  bytes: number
  format: string
  resource_type: string
  original_filename: string
  created_at: string
}

export interface CloudinaryCredentials {
  cloudName: string
  apiKey: string
  apiSecret: string
}
