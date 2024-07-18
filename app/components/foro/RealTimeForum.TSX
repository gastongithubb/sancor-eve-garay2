// app > components > Foro > RealTimeForum.tsx
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
  const [username, setUsername] = useState('Anónimo');
  const [isConnected, setIsConnected] = useState(false);
  const websocket = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    websocket.current = new WebSocket('ws://localhost:8080');

    websocket.current.onopen = () => {
      console.log('Conexión WebSocket establecida');
      setIsConnected(true);
    };

    websocket.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setMessages((prevMessages) => [...prevMessages, message]);
    };

    websocket.current.onerror = (error) => {
      console.error('Error en la conexión WebSocket:', error);
    };

    websocket.current.onclose = () => {
      console.log('Conexión WebSocket cerrada');
      setIsConnected(false);
    };

    return () => {
      if (websocket.current) {
        websocket.current.close();
      }
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && isConnected) {
      const message = {
        user: username,
        content: newMessage,
        timestamp: new Date().toISOString(),
      };

      websocket.current?.send(JSON.stringify(message));
      setNewMessage('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-6 text-teal-600">Foro de Salud y Bienestar</h1>
      <div className="mb-4 flex items-center">
        <label className="mr-2 text-gray-700">Usuario:</label>
        <select
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="p-2 border rounded bg-white text-gray-700"
        >
          <option value="Anónimo">Anónimo</option>
          <option value="Evelin Garay">Evelin Garay</option>
        </select>
      </div>
      <div className="bg-gray-50 p-4 h-96 overflow-y-auto mb-4 rounded-lg border border-gray-200">
        {messages.map((msg, index) => (
          <div key={msg.id || index} className="mb-3 p-2 bg-white rounded shadow">
            <span className={`font-bold ${msg.user === 'Evelin Garay' ? 'text-teal-600' : 'text-blue-600'}`}>
              {msg.user}:
            </span>
            <span className="ml-2 text-gray-700">{msg.content}</span>
            <span className="text-xs text-gray-500 ml-2 float-right">
              {new Date(msg.timestamp).toLocaleTimeString()}
            </span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className="flex">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Escribe tu mensaje..."
          className="flex-grow p-2 border rounded-l focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        <button
          type="submit"
          className={`p-2 rounded-r text-white transition-colors duration-200 ${
            isConnected ? 'bg-teal-500 hover:bg-teal-600' : 'bg-gray-400'
          }`}
          disabled={!isConnected}
        >
          Enviar
        </button>
      </form>
      <p className="mt-2 text-sm text-gray-600">
        Estado: {isConnected ? 
          <span className="text-green-500">Conectado</span> : 
          <span className="text-red-500">Desconectado</span>
        }
      </p>
    </div>
  );
};

export default RealTimeForum;