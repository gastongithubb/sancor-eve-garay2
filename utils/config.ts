// file: utils/config.ts
import { config as dotenvConfig } from 'dotenv';
import path from 'path';

// Cargar variables de entorno desde .env.local solo en el servidor
if (typeof window === 'undefined') {
  dotenvConfig({ path: path.resolve(process.cwd(), '.env') });
}

const getEnvVariable = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    if (typeof window !== 'undefined') {
      console.error(`Error: ${key} no está definido`);
    } else {
      throw new Error(`${key} no está definido`);
    }
  }
  return value || '';
};

export const config = {
  tursoConnectionUrl: getEnvVariable('TURSO_DATABASE_URL'),
  tursoAuthToken: getEnvVariable('TURSO_AUTH_TOKEN'),
  googleClientId: getEnvVariable('GOOGLE_CLIENT_ID'),
  googleClientSecret: getEnvVariable('GOOGLE_CLIENT_SECRET'),
};

export default config;