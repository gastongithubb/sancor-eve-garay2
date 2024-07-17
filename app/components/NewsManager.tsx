'use client';

import { useState, useEffect } from 'react';

interface NewsItem {
  id: number;
  url: string;
  title: string;
  publishDate: string;
  estado: number;
}

const NewsManager = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [newNews, setNewNews] = useState({ url: '', title: '', publishDate: '' });

  useEffect(() => {
    fetch('/api/news')
      .then(res => res.json())
      .then(data => setNews(data))
      .catch(error => console.error('Error al cargar las novedades:', error));
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewNews(prev => ({ ...prev, [name]: value }));
  };

  const handleAddNews = () => {
    fetch('/api/news', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newNews),
    })
      .then(res => res.json())
      .then(data => {
        setNews(prev => [...prev, data]);
        setNewNews({ url: '', title: '', publishDate: '' });
      })
      .catch(error => console.error('Error al agregar novedad:', error));
  };

  const handleDeleteNews = (id: number) => {
    fetch(`/api/news/${id}`, {
      method: 'DELETE',
    })
      .then(() => {
        setNews(prev => prev.filter(newsItem => newsItem.id !== id));
      })
      .catch(error => console.error('Error al eliminar novedad:', error));
  };

  const handleToggleEstado = (id: number) => {
    fetch(`/api/news/${id}`, {
      method: 'PATCH',
    })
      .then(() => {
        setNews(prev =>
          prev.map(newsItem =>
            newsItem.id === id ? { ...newsItem, estado: newsItem.estado === 1 ? 0 : 1 } : newsItem
          )
        );
      })
      .catch(error => console.error('Error al actualizar estado de novedad:', error));
  };

  return (
    <div>
      <h1>Gestor de Novedades</h1>
      <div>
        <h2>Agregar Novedad</h2>
        <input
          type="text"
          name="url"
          placeholder="URL"
          value={newNews.url}
          onChange={handleInputChange}
        />
        <input
          type="text"
          name="title"
          placeholder="Título"
          value={newNews.title}
          onChange={handleInputChange}
        />
        <input
          type="text"
          name="publishDate"
          placeholder="Fecha de Publicación"
          value={newNews.publishDate}
          onChange={handleInputChange}
        />
        <button onClick={handleAddNews}>Agregar</button>
      </div>
      <div>
        <h2>Lista de Novedades</h2>
        {news.map(newsItem => (
          <div key={newsItem.id}>
            <h3>{newsItem.title}</h3>
            <p>{newsItem.url}</p>
            <p>{newsItem.publishDate}</p>
            <p>{newsItem.estado === 1 ? 'Vigente' : 'No vigente'}</p>
            <button onClick={() => handleToggleEstado(newsItem.id)}>
              {newsItem.estado === 1 ? 'Marcar como No vigente' : 'Marcar como Vigente'}
            </button>
            <button onClick={() => handleDeleteNews(newsItem.id)}>Eliminar</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewsManager;
