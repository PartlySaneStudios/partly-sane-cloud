declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL: string
      HYPIXEL_API_KEY: String
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {}