/// <reference types="vite/client" />

declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_TURSO_DATABASE_URL
    NEXT_PUBLIC_TURSO_AUTH_TOKEN
    NEXT_PUBLIC_GOOGLE_CLIENT_ID
    NEXT_PUBLIC_GOOGLE_CLIENT_SECRET
    // añade otras variables de entorno aquí si es necesario
  }
}
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
  