const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

export interface StaticPageData {
  title: string;
  slug: string;
  content: string;
  meta_title?: string | null;
  meta_description?: string | null;
  updated_at: string;
}

export async function fetchStaticPage(slug: string): Promise<StaticPageData | null> {
  try {
    const res = await fetch(`${API_URL}/pages/${slug}`, {
      next: { revalidate: 3600 }, // cache 1 saat
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data ?? null;
  } catch {
    return null;
  }
}
