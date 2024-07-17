/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly PUBLIC_TURSO_DATABASE_URL: string;
    readonly PUBLIC_TURSO_AUTH_TOKEN: string;
    readonly GOOGLE_CLIENT_ID: string;
    readonly GOOGLE_CLIENT_SECRET: string;
    // añade otras variables de entorno aquí si es necesario
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
  