import { getCollection } from 'astro:content';

/** Alla publicerade artiklar, nyast först. */
export async function getPosts() {
  const posts = await getCollection('artiklar', ({ data }) => !data.utkast);
  return posts.sort((a, b) => b.data.datum.valueOf() - a.data.datum.valueOf());
}

export const formatDate = (d: Date) =>
  d.toLocaleDateString('sv-SE', { day: 'numeric', month: 'long', year: 'numeric' });
