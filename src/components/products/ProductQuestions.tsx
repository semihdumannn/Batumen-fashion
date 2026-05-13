'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import { useToastStore } from '@/store/useToastStore';
import type { ProductQuestion } from '@/types';

interface Props {
  slug: string;
}

export function ProductQuestions({ slug }: Props) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const toast = useToastStore();
  const [newQuestion, setNewQuestion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expanded, setExpanded] = useState<number[]>([]);

  const { data: questions, mutate } = useSWR<ProductQuestion[]>(
    `questions:${slug}`,
    () => api.getProductQuestions(slug),
    { revalidateOnFocus: false }
  );

  const toggleExpand = (id: number) => {
    setExpanded((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;
    if (!isAuthenticated) { window.location.href = '/login'; return; }
    setIsSubmitting(true);
    try {
      await api.createQuestion(slug, newQuestion.trim());
      setNewQuestion('');
      toast.success('Sorunuz gönderildi. Moderasyon sonrası yayınlanacak.');
      mutate();
    } catch {
      toast.error('Soru gönderilemedi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h3 className="text-base font-bold text-gray-900 mb-6">Soru & Cevap</h3>

      {questions && questions.length > 0 ? (
        <div className="space-y-3 mb-8">
          {questions.map((q) => (
            <div key={q.id} className="border border-gray-200">
              <button
                onClick={() => toggleExpand(q.id)}
                className="w-full flex items-start justify-between p-4 text-left gap-3"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">S: {q.body}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{q.author.name} · {new Date(q.created_at).toLocaleDateString('tr-TR')}</p>
                </div>
                {q.answers.length > 0 && (
                  expanded.includes(q.id)
                    ? <ChevronUpIcon className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                    : <ChevronDownIcon className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                )}
              </button>
              {q.answers.length > 0 && expanded.includes(q.id) && (
                <div className="px-4 pb-4 space-y-2 border-t border-gray-100">
                  {q.answers.map((a) => (
                    <div key={a.id} className="mt-3">
                      <p className="text-xs font-semibold text-gray-500 mb-1">
                        {a.is_admin ? 'BATUMEN' : 'Kullanıcı'} ·{' '}
                        {new Date(a.created_at).toLocaleDateString('tr-TR')}
                      </p>
                      <p className="text-sm text-gray-700">{a.body}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : questions !== undefined ? (
        <p className="text-sm text-gray-400 mb-8">Bu ürün için henüz soru sorulmamış.</p>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          value={newQuestion}
          onChange={(e) => setNewQuestion(e.target.value)}
          maxLength={500}
          rows={3}
          placeholder="Ürün hakkında bir soru sormak ister misiniz?"
          className="w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-black resize-none"
        />
        <button
          type="submit"
          disabled={isSubmitting || !newQuestion.trim()}
          className="bg-black text-white px-6 py-2.5 text-xs font-semibold tracking-wide hover:bg-gray-800 transition-colors disabled:opacity-40"
        >
          {isSubmitting ? 'GÖNDERİLİYOR...' : 'SORU GÖNDER'}
        </button>
      </form>
    </div>
  );
}
