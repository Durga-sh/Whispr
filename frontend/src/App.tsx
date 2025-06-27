import { useEffect, useRef, useState } from 'react';
import './App.css'

function App() {
  const [messages, setMessages] = useState<string[]>([]);
  const [currentRoom, setCurrentRoom] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [messageInput, setMessageInput] = useState<string>('');
  const [roomInput, setRoomInput] = useState<string>('');
  const [isJoined, setIsJoined] = useState<boolean>(false);
  
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080");
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === "joined") {
        setMessages(prev => [...prev, `✅ ${data.message}`]);
        setIsJoined(true);
      } else if (data.type === "message") {
        setMessages(prev => [...prev, `[${data.timestamp}] ${data.username}: ${data.message}`]);
      } else if (data.type === "system") {
        setMessages(prev => [...prev, `🔔 ${data.message}`]);
      }
    };

    ws.onopen = () => {
      console.log("Connected to WebSocket");
    };

    return () => {
      ws.close();
    };
  }, []);

  const joinRoom = () => {
    if (!wsRef.current || !roomInput.trim() || !username.trim()) return;
    
    wsRef.current.send(JSON.stringify({
      type: "join",
      payload: {
        roomId: roomInput.trim(),
        username: username.trim()
      }
    }));
    
    setCurrentRoom(roomInput.trim());
    setRoomInput('');
  };

  const sendMessage = () => {
    if (!wsRef.current || !messageInput.trim() || !isJoined) return;
    
    wsRef.current.send(JSON.stringify({
      type: "chat",
      payload: {
        message: messageInput.trim()
      }
    }));
    
    setMessageInput('');
  };

  const leaveRoom = () => {
    setIsJoined(false);
    setCurrentRoom('');
    setMessages([]);
  };

  if (!isJoined) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
          <h1 className="text-2xl font-bold text-white mb-6 text-center">Join Chat Room</h1>
          
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
            />
            
            <input
              type="text"
              placeholder="Enter room name (e.g., general, random)"
              value={roomInput}
              onChange={(e) => setRoomInput(e.target.value)}
              className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
              onKeyPress={(e) => e.key === 'Enter' && joinRoom()}
            />
            
            <button
              onClick={joinRoom}
              disabled={!username.trim() || !roomInput.trim()}
              className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              Join Room
            </button>
          </div>
          
          <div className="mt-6 text-gray-400 text-sm">
            <p>💡 Popular rooms: general, random, tech, gaming</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 p-4 border-b border-gray-700">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-white font-bold text-lg">#{currentRoom}</h2>
            <p className="text-gray-400 text-sm">Welcome, {username}!</p>
          </div>
          <button
            onClick={leaveRoom}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Leave Room
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((message, index) => (
          <div key={index} className="text-white">
            <div className="bg-gray-800 p-3 rounded-lg">
              {message}
            </div>
          </div>
        ))}
      </div>

      {/* Message Input */}
      <div className="bg-gray-800 p-4 border-t border-gray-700">
        <div className="flex space-x-3">
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder={`Message #${currentRoom}`}
            className="flex-1 p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          />
          <button
            onClick={sendMessage}
            disabled={!messageInput.trim()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;