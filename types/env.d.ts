declare global {
  namespace NodeJS {
    interface ProcessEnv {
      VITE_SUPABASE_URL: string;
      VITE_SUPABASE_ANON_KEY: string;
      SUPABASE_SERVICE_ROLE_KEY: string;
      VITE_API_BASE_URL: string;
      VITE_APP_ENV: "development" | "staging" | "production";
      VITE_DOG_API_BASE_URL: string;
      OPENAI_API_KEY: string;
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {};
