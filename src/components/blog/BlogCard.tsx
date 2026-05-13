import Image from 'next/image';
import Link from 'next/link';
import type { BlogPost } from '@/types';

interface Props {
  post: BlogPost;
  variant?: 'default' | 'compact';
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function BlogCard({ post, variant = 'default' }: Props) {
  if (variant === 'compact') {
    return (
      <Link href={`/blog/${post.slug}`} className="group flex gap-4">
        {post.cover_image && (
          <div className="relative w-20 h-20 bg-gray-50 shrink-0 overflow-hidden">
            <Image
              src={post.cover_image}
              alt={post.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="80px"
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-gray-500 mb-1">{formatDate(post.published_at)}</p>
          <h3 className="text-xs font-medium text-gray-900 group-hover:underline underline-offset-2 line-clamp-2 leading-snug">
            {post.title}
          </h3>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/blog/${post.slug}`} className="group block">
      <div className="relative aspect-[16/9] bg-gray-50 overflow-hidden mb-4">
        {post.cover_image ? (
          <Image
            src={post.cover_image}
            alt={post.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-gray-700 text-xs tracking-widest">GÖRSEL YOK</span>
          </div>
        )}
      </div>

      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {post.tags.slice(0, 2).map((tag) => (
            <span key={tag} className="text-[9px] tracking-widest text-gray-500 border border-gray-200 px-2 py-0.5">
              {tag.toUpperCase()}
            </span>
          ))}
        </div>
      )}

      <h3 className="text-sm font-semibold text-gray-900 group-hover:underline underline-offset-2 leading-snug mb-2">
        {post.title}
      </h3>

      {post.excerpt && (
        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-3">{post.excerpt}</p>
      )}

      <div className="flex items-center gap-3 text-[10px] text-gray-400">
        <span>{formatDate(post.published_at)}</span>
        {post.reading_time && (
          <>
            <span>·</span>
            <span>{post.reading_time} dk okuma</span>
          </>
        )}
      </div>
    </Link>
  );
}
