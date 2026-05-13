'use client';

import { useState } from 'react';
import { api } from '@/lib/api';

interface Props {
  dark?: boolean;
}

export function NewsletterForm({ dark = false }: Props) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    try {
      await api.subscribeNewsletter(email);
      setStatus('success');
      setMessage('Bültenimize başarıyla abone oldunuz!');
      setEmail('');
    } catch {
      setStatus('error');
      setMessage('Bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  if (status === 'success') {
    return (
      <p className={`text-sm font-medium ${dark ? 'text-green-400' : 'text-green-600'}`}>
        {message}
      </p>
    );
  }

  return (
    <form className="space-y-2" onSubmit={handleSubmit}>
      <div className="flex">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="E-posta adresin"
          required
          className={`flex-1 px-4 py-3 text-sm focus:outline-none ${
            dark
              ? 'bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:border-white'
              : 'border border-gray-200 text-gray-800 placeholder-gray-400 focus:border-black'
          }`}
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className={`px-8 py-3 text-sm font-semibold transition-colors disabled:opacity-60 ${
            dark
              ? 'bg-white text-black hover:bg-gray-100'
              : 'bg-black text-white hover:bg-gray-900'
          }`}
        >
          {status === 'loading' ? '...' : 'ABONE OL'}
        </button>
      </div>
      {status === 'error' && (
        <p className={`text-xs ${dark ? 'text-red-400' : 'text-red-500'}`}>{message}</p>
      )}
    </form>
  );
}
