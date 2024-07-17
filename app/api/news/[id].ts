import { NextApiRequest, NextApiResponse } from 'next';
import { deleteNews, toggleEstadoNoticia } from '../../../utils/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === 'DELETE') {
    try {
      await deleteNews(Number(id));
      res.status(200).json({ message: 'Novedad eliminada exitosamente' });
    } catch (error) {
      res.status(500).json({ error: 'Error al eliminar la novedad' });
    }
  } else if (req.method === 'PATCH') {
    try {
      await toggleEstadoNoticia(Number(id));
      res.status(200).json({ message: 'Estado de la novedad actualizado exitosamente' });
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar el estado de la novedad' });
    }
  } else {
    res.setHeader('Allow', ['DELETE', 'PATCH']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
