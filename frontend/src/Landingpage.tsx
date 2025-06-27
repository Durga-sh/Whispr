import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function LandingPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const users: { [key: string]: string } = JSON.parse(localStorage.getItem('users') || '{}');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    if (isLogin) {
      if (users[username] === password) {
        localStorage.setItem('currentUser', username);
        navigate('/chat');
      } else {
        setError('Invalid username or password');
      }
    } else {
      if (users[username]) {
        setError('Username already exists');
      } else {
        users[username] = password;
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('currentUser', username);
        navigate('/chat');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">Login to Chat</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
            />
          </div>
          
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
            />
          </div>
          
          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}
          
          <button
            type="submit"
            className="w-full p-3 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:bg-gray-700 disabled:cursor-not-allowed"
            disabled={!username.trim() || !password.trim()}
          >
            Login
          </button>
        </form>
        
        <div className="mt-4 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-400 hover:text-blue-300 text-sm"
          >
            {isLogin ? 'Need an account? Sign Up' : 'Already have an account? Login'}
          </button>
        </div>
        
        <div className="mt-6 text-gray-400 text-sm text-center">
          <p>💬 Join our vibrant chat community!</p>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;