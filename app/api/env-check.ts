import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({
    NEXT_PUBLIC_TURSO_DATABASE_URL: process.env.NEXT_PUBLIC_TURSO_DATABASE_URL || 'No configurado',
    NEXT_PUBLIC_TURSO_AUTH_TOKEN: process.env.NEXT_PUBLIC_TURSO_AUTH_TOKEN ? 'Configurado (oculto)' : 'No configurado',
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'No configurado',
    NEXT_PUBLIC_GOOGLE_CLIENT_SECRET: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET ? 'Configurado (oculto)' : 'No configurado',
  });
}