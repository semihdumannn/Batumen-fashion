'use client';

import { useState } from 'react';
import useSWR, { mutate } from 'swr';
import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/store/useAuthStore';
import { useToastStore } from '@/store/useToastStore';
import { api } from '@/lib/api';
import type { Review } from '@/types';

interface Props {
  slug: string;
  averageRating?: number;
  reviewsCount?: number;
}

const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  title: z.string().optional(),
  body: z.string().min(20, 'Yorum en az 20 karakter olmalıdır'),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

function StarRating({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }, (_, i) => (
        i < Math.round(value)
          ? <StarIcon key={i} className="w-4 h-4 text-[#E8001A]" />
          : <StarOutlineIcon key={i} className="w-4 h-4 text-gray-300" />
      ))}
    </div>
  );
}

function StarSelector({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }, (_, i) => i + 1).map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="p-0.5"
          aria-label={`${star} yıldız`}
        >
          {star <= (hovered || value) ? (
            <StarIcon className="w-6 h-6 text-[#E8001A]" />
          ) : (
            <StarOutlineIcon className="w-6 h-6 text-gray-300 hover:text-gray-400 transition-colors" />
          )}
        </button>
      ))}
    </div>
  );
}

function ReviewForm({ slug, onClose }: { slug: string; onClose: () => void }) {
  const toast = useToastStore();
  const swrKey = `/products/${slug}/reviews`;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 0 },
  });

  const rating = watch('rating');

  const onSubmit = async (data: ReviewFormData) => {
    try {
      await api.createReview(slug, data);
      toast.success('Yorumunuz gönderildi, onay bekleniyor');
      mutate(swrKey);
      onClose();
    } catch {
      toast.error('Yorum gönderilemedi');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-[#F8F7F5] border border-gray-200 p-6 space-y-4">
      <h3 className="text-sm font-bold tracking-wide text-gray-900">YORUM YAZ</h3>

      <div>
        <p className="text-xs text-gray-500 mb-2">Puanınız</p>
        <StarSelector
          value={rating}
          onChange={(v) => setValue('rating', v, { shouldValidate: true })}
        />
        {errors.rating && <p className="text-xs text-red-500 mt-1">Lütfen puan verin</p>}
      </div>

      <div>
        <label className="block text-xs font-semibold tracking-widest text-gray-900 mb-2">
          BAŞLIK (İSTEĞE BAĞLI)
        </label>
        <input
          {...register('title')}
          className="w-full px-4 py-2.5 border border-gray-200 text-sm bg-white focus:outline-none focus:border-[#0A0A0A] transition-colors"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold tracking-widest text-gray-900 mb-2">
          YORUM
        </label>
        <textarea
          {...register('body')}
          rows={4}
          className="w-full px-4 py-2.5 border border-gray-200 text-sm bg-white focus:outline-none focus:border-[#0A0A0A] transition-colors resize-none"
        />
        {errors.body && <p className="text-xs text-red-500 mt-1">{errors.body.message}</p>}
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-gray-900 text-white px-8 py-3 text-xs font-bold tracking-widest hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          {isSubmitting ? 'GÖNDERİLİYOR...' : 'GÖNDER'}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-3 text-xs text-gray-500 hover:text-gray-900 transition-colors"
        >
          İptal
        </button>
      </div>
    </form>
  );
}

export function ProductReviews({ slug, averageRating, reviewsCount }: Props) {
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const swrKey = `/products/${slug}/reviews?page=${page}`;
  const { data, isLoading } = useSWR(
    swrKey,
    () => api.getProductReviews(slug, { page }),
    { revalidateOnFocus: false }
  );

  const reviews = data?.data ?? [];
  const meta = data?.meta;

  return (
    <section className="py-16 border-t border-gray-200">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-gray-900">
            MÜŞTERİ YORUMLARI
          </h2>
          {(reviewsCount ?? 0) > 0 && (
            <div className="flex items-center gap-2 mt-2">
              <StarRating value={averageRating ?? 0} />
              <span className="text-sm text-gray-500">
                {averageRating?.toFixed(1)} / 5 ({reviewsCount} yorum)
              </span>
            </div>
          )}
        </div>

        {isAuthenticated && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="text-xs font-bold tracking-widest border border-[#0A0A0A] px-6 py-3 hover:bg-gray-900 hover:text-white transition-colors"
          >
            YORUM YAZ
          </button>
        )}

        {!isAuthenticated && (
          <a
            href="/login"
            className="text-xs text-gray-500 underline underline-offset-4 hover:text-gray-900 transition-colors"
          >
            Yorum yazmak için giriş yapın
          </a>
        )}
      </div>

      {showForm && (
        <div className="mb-8">
          <ReviewForm slug={slug} onClose={() => setShowForm(false)} />
        </div>
      )}

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="spinner" />
        </div>
      )}

      {!isLoading && reviews.length === 0 && (
        <p className="text-sm text-gray-500 py-8">
          Bu ürün için henüz yorum yapılmamış. İlk yorumu sen yaz!
        </p>
      )}

      <div className="space-y-6">
        {reviews.map((review: Review) => (
          <div key={review.id} className="pb-6 border-b border-gray-100 last:border-0">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gray-900 text-white flex items-center justify-center text-xs font-bold">
                  {review.user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-900">{review.user.name}</p>
                  {review.is_verified_purchase && (
                    <p className="text-[9px] text-green-600 tracking-wider">DOĞRULANMIŞ ALIM</p>
                  )}
                </div>
              </div>
              <p className="text-[10px] text-gray-400 shrink-0">
                {new Date(review.created_at).toLocaleDateString('tr-TR')}
              </p>
            </div>
            <StarRating value={review.rating} />
            {review.title && (
              <p className="text-sm font-semibold text-gray-900 mt-2">{review.title}</p>
            )}
            <p className="text-sm text-gray-600 mt-1 leading-relaxed">{review.body}</p>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {meta && meta.last_page > 1 && (
        <div className="flex items-center gap-2 mt-8">
          {Array.from({ length: meta.last_page }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-9 h-9 flex items-center justify-center text-xs font-medium border transition-colors ${p === page ? 'bg-gray-900 text-white border-[#0A0A0A]' : 'border-gray-200 text-gray-900 hover:border-[#0A0A0A]'}`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
