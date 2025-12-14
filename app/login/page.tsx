'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';
import { post } from '@/utils/http';

interface LoginResponse {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: 'ADMIN' | 'USER';
  };
  error?: string;
}


export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const data = await post<LoginResponse>('/api/auth/login', { email, password });

      if (!data.token) throw new Error(data.error || 'Login failed');

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Redirect based on role
      if (data.user.role === 'ADMIN') router.push('/dashboard/admin');
      else router.push('/dashboard/user');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-pink-50 flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-pink-700">Login</h2>

          {error && <p className="text-red-600 mb-4">{error}</p>}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 mb-4 border rounded"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 mb-4 border rounded"
            required
          />

          <button type="submit" className="w-full bg-pink-600 text-white p-2 rounded hover:opacity-90">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
