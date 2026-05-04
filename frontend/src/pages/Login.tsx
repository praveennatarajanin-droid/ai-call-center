import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { phone, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.user.role);
      navigate('/admin');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-black">
      <form onSubmit={handleLogin} className="bg-white/5 p-8 rounded-2xl border border-white/10 w-96 flex flex-col gap-4">
        <h2 className="text-2xl font-bold text-white text-center mb-4">Admin Login</h2>
        {error && <div className="bg-red-500/20 text-red-400 p-3 rounded-lg text-sm text-center">{error}</div>}
        <div>
          <label className="text-xs text-slate-400 uppercase tracking-widest font-bold block mb-2">Admin ID (Phone)</label>
          <input 
            type="text" 
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary"
            placeholder="admin"
          />
        </div>
        <div>
          <label className="text-xs text-slate-400 uppercase tracking-widest font-bold block mb-2">Password</label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary"
            placeholder="••••••••"
          />
        </div>
        <button type="submit" className="w-full bg-primary text-black font-bold py-3 rounded-xl mt-4 hover:bg-yellow-400 transition-colors">
          Authenticate
        </button>
      </form>
    </div>
  );
}
