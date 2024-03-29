declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL: string
      HYPIXEL_API_KEY: string
      SSL_CERT: string
      SSL_KEY: string
      CLEAR_CACHE_KEY: string
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export { }