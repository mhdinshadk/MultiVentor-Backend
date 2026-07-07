const isProd = process.env.NODE_ENV === 'production'

export const logger = {
  info: (message: string, ...args: any[]) => {
    if (!isProd) {
      console.log(`[INFO] ${message}`, ...args)
    }
  },
  warn: (message: string, ...args: any[]) => {
    if (!isProd) {
      console.warn(`[WARN] ${message}`, ...args)
    }
  },
  error: (message: string, ...args: any[]) => {
    console.error(`[ERROR] ${message}`, ...args)
  },
  debug: (message: string, ...args: any[]) => {
    if (!isProd) {
      console.debug(`[DEBUG] ${message}`, ...args)
    }
  },
}
