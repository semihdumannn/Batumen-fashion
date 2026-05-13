'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import { useToastStore } from '@/store/useToastStore';
import type { BlogComment } from '@/types';

interface Props {
  slug: string;
}

export function BlogComments({ slug }: Props) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const toast = useToastStore();
  const [body, setBody] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: comments, mutate } = useSWR<BlogComment[]>(
    `blog-comments:${slug}`,
    () => api.getBlogComments(slug),
    { revalidateOnFocus: false }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;
    if (!isAuthenticated) { window.location.href = '/login'; return; }
    setIsSubmitting(true);
    try {
      await api.createBlogComment(slug, body.trim());
      setBody('');
      toast.success('Yorumunuz gönderildi. Moderasyon sonrası yayınlanacak.');
      mutate();
    } catch {
      toast.error('Yorum gönderilemedi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-12 pt-8 border-t border-gray-200">
      <h3 className="text-lg font-bold text-gray-900 mb-6">
        Yorumlar {comments && comments.length > 0 && `(${comments.length})`}
      </h3>

      {comments && comments.length > 0 && (
        <div className="space-y-4 mb-8">
          {comments.map((c) => (
            <div key={c.id} className="border border-gray-100 p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-semibold text-gray-800">{c.author.name}</span>
                <span className="text-xs text-gray-400">
                  {new Date(c.created_at).toLocaleDateString('tr-TR')}
                </span>
              </div>
              <p className="text-sm text-gray-600">{c.body}</p>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          maxLength={1000}
          rows={4}
          placeholder={isAuthenticated ? 'Yorumunuzu yazın...' : 'Yorum yapmak için giriş yapın'}
          disabled={!isAuthenticated}
          className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-black resize-none disabled:bg-gray-50 disabled:text-gray-400"
        />
        {isAuthenticated ? (
          <button
            type="submit"
            disabled={isSubmitting || !body.trim()}
            className="bg-black text-white px-6 py-2.5 text-xs font-bold tracking-widest hover:bg-gray-800 transition-colors disabled:opacity-40"
          >
            {isSubmitting ? 'GÖNDERİLİYOR...' : 'YORUM GÖNDER'}
          </button>
        ) : (
          <a href="/login" className="inline-block text-xs text-black underline underline-offset-4">
            Yorum yapmak için giriş yap →
          </a>
        )}
      </form>
    </div>
  );
}
