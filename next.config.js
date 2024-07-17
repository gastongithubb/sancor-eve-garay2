/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
      PUBLIC_TURSO_DATABASE_URL: process.env.PUBLIC_TURSO_DATABASE_URL,
      PUBLIC_TURSO_AUTH_TOKEN: process.env.PUBLIC_TURSO_AUTH_TOKEN,
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    },
  }
  
  module.exports = nextConfig