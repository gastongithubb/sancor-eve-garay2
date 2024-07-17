import { NextApiRequest, NextApiResponse } from 'next';
import { getNews, addNews } from '../../../utils/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const news = await getNews();
      res.status(200).json(news);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener las novedades' });
    }
  } else if (req.method === 'POST') {
    try {
      const newNews = req.body;
      await addNews(newNews);
      res.status(201).json({ message: 'Novedad agregada exitosamente' });
    } catch (error) {
      res.status(500).json({ error: 'Error al agregar la novedad' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
