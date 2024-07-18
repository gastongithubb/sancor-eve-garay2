'use client'

import React, { useState, useEffect, useRef } from 'react';

interface Message {
  id: string;
  user: string;
  content: string;
  timestamp: string;
}

const RealTimeForum: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [username, setUsername] = useState('');
  const websocket = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Inicializar la conexión WebSocket
    websocket.current = new WebSocket('ws://tu-servidor-websocket.com');

    websocket.current.onopen = () => {
      console.log('Conexión WebSocket establecida');
    };

    websocket.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setMessages((prevMessages) => [...prevMessages, message]);
    };

    websocket.current.onerror = (error) => {
      console.error('Error en la conexión WebSocket:', error);
    };

    return () => {
      if (websocket.current) {
        websocket.current.close();
      }
    };
  }, []);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && username.trim()) {
      const message = {
        user: username,
        content: newMessage,
        timestamp: new Date().toISOString(),
      };

      if (websocket.current?.readyState === WebSocket.OPEN) {
        websocket.current.send(JSON.stringify(message));
      }

      setNewMessage('');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Foro en Tiempo Real</h1>
      <div className="mb-4">
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Tu nombre de usuario"
          className="w-full p-2 border rounded"
        />
      </div>
      <div className="bg-gray-100 p-4 h-96 overflow-y-auto mb-4 rounded">
        {messages.map((msg) => (
          <div key={msg.id} className="mb-2">
            <span className="font-bold">{msg.user}: </span>
            <span>{msg.content}</span>
            <span className="text-xs text-gray-500 ml-2">
              {new Date(msg.timestamp).toLocaleTimeString()}
            </span>
          </div>
        ))}
      </div>
      <form onSubmit={handleSendMessage} className="flex">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Escribe tu mensaje..."
          className="flex-grow p-2 border rounded-l"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white p-2 rounded-r"
        >
          Enviar
        </button>
      </form>
    </div>
  );
};

export default RealTimeForum;