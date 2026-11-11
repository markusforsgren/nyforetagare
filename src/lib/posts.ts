import { getCollection, type CollectionEntry } from 'astro:content';
import { CATEGORIES, MENU } from '../config';

/** Alla publicerade artiklar, nyast först. */
export async function getPosts() {
  const posts = await getCollection('artiklar', ({ data }) => !data.utkast);
  return posts.sort((a, b) => b.data.datum.valueOf() - a.data.datum.valueOf());
}

export const formatDate = (d: Date) =>
  d.toLocaleDateString('sv-SE', { day: 'numeric', month: 'long', year: 'numeric' });

type Post = CollectionEntry<'artiklar'>;

/** Ligger artikeln i kategorin (som huvudkategori eller extra kategori)? */
export const inCategory = (p: Post, slug: string) =>
  p.data.kategori === slug || p.data.fler_kategorier.includes(slug as never);

/** Kategorier som har minst en publicerad artikel. */
export async function usedCategories() {
  const posts = await getPosts();
  return CATEGORIES.filter((c) => posts.some((p) => inCategory(p, c.slug)));
}

/** Menyn med bara de kategorier som har innehåll. */
export async function getMenu() {
  const used = new Set((await usedCategories()).map((c) => c.slug));
  return MENU.map((g) => {
    const kats = g.kategorier.filter((s) => used.has(s)).map((s) => {
      const c = CATEGORIES.find((x) => x.slug === s)!;
      return { href: `/kategori/${c.slug}/`, label: c.name };
    });
    return { ...g, items: [...g.lankar, ...kats] };
  });
}
