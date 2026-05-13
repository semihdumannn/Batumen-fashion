import { revalidateTag, revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

// Backend (Laravel admin panel) bu endpoint'i çağırarak cache'i temizler.
// Örnek: POST /api/revalidate?tag=products&secret=REVALIDATE_SECRET
//
// Desteklenen tag'ler: products, product-{slug}, categories, brands, homepage
// Desteklenen path'ler: /products, /products/{slug}, /categories/{slug}

const SECRET = process.env.REVALIDATE_SECRET;

export async function POST(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const secret = searchParams.get('secret');

  if (!secret || secret !== SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const tag = searchParams.get('tag');
  const path = searchParams.get('path');
  const slug = searchParams.get('slug');

  const revalidated: string[] = [];

  if (tag) {
    revalidateTag(tag, { expire: 0 });
    revalidated.push(`tag:${tag}`);
  }

  if (slug) {
    revalidateTag(`product-${slug}`, { expire: 0 });
    revalidatePath(`/products/${slug}`, 'page');
    revalidated.push(`product-${slug}`, `/products/${slug}`);
  }

  if (path) {
    revalidatePath(path, 'page');
    revalidated.push(`path:${path}`);
  }

  if (revalidated.length === 0) {
    return NextResponse.json({ error: 'tag, slug veya path parametresi gerekli' }, { status: 400 });
  }

  return NextResponse.json({ revalidated, timestamp: new Date().toISOString() });
}

// GET: hangi tag'lerin mevcut olduğunu belgeler
export async function GET() {
  return NextResponse.json({
    usage: 'POST /api/revalidate?secret=SECRET&tag=TAG veya &slug=SLUG veya &path=PATH',
    available_tags: ['products', 'product-{slug}', 'categories', 'brands', 'homepage', 'reviews-{slug}'],
    example_hooks: {
      product_updated: 'POST /api/revalidate?secret=...&slug=tshirt-siyah',
      all_products: 'POST /api/revalidate?secret=...&tag=products',
      categories: 'POST /api/revalidate?secret=...&tag=categories',
    },
  });
}
