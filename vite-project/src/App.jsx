import React, { useState, useEffect, useRef } from 'react';

function App() {
  const [socket, setSocket] = useState(null);
  const [currentRoom, setCurrentRoom] = useState('');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8080');

    ws.onopen = () => {
      console.log('✅ Connected to WebSocket server');
    };

    ws.onmessage = (event) => {
      try {
        const parsedMessage = JSON.parse(event.data);
        if (parsedMessage.type === 'chat') {
          setMessages(prev => [...prev, parsedMessage.payload.message]);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onclose = () => {
      console.log('❌ Disconnected from WebSocket server');
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    setSocket(ws);

    return () => {
      ws.close();
      console.log('🔒 WebSocket connection closed');
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleJoinRoom = () => {
    if (socket && currentRoom.trim()) {
      socket.send(JSON.stringify({ type: 'join', payload: { roomId: currentRoom } }));
      console.log(`🎯 Joined room: ${currentRoom}`);
    }
  };

  const handleSendMessage = () => {
    if (socket && newMessage.trim() && currentRoom.trim()) {
      socket.send(JSON.stringify({
        type: 'chat',
        payload: { roomId: currentRoom, message: newMessage }
      }));
      setNewMessage('');
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '50px auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ textAlign: 'center' }}>WebSocket Chat 🚀</h1>

      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="roomId">Room ID:</label>
        <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
          <input
            type="text"
            id="roomId"
            value={currentRoom}
            onChange={(e) => setCurrentRoom(e.target.value)}
            placeholder="Enter Room ID"
            style={{ flex: 1, padding: '8px' }}
          />
          <button
            onClick={handleJoinRoom}
            disabled={!currentRoom.trim()}
            style={{ padding: '8px 12px' }}
          >
            Join Room
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>Messages:</h2>
        <div
          style={{
            height: '300px',
            overflowY: 'auto',
            border: '1px solid #ccc',
            borderRadius: '5px',
            padding: '10px',
            backgroundColor: '#f9f9f9'
          }}
        >
          {messages.length > 0 ? (
            messages.map((msg, index) => (
              <div key={index} style={{ marginBottom: '8px' }}>{msg}</div>
            ))
          ) : (
            <div style={{ color: '#777' }}>No messages yet...</div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message"
          style={{ flex: 1, padding: '8px' }}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
        />
        <button
          onClick={handleSendMessage}
          disabled={!newMessage.trim()}
          style={{ padding: '8px 12px' }}
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default App;
