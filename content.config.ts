import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { CATEGORIES } from './config';

const slugs = CATEGORIES.map((c) => c.slug) as [string, ...string[]];

const artiklar = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/artiklar' }),
  schema: z.object({
    title: z.string(),
    ingress: z.string(),
    kategori: z.enum(slugs),
    datum: z.coerce.date(),
    skribent: z.string().default('Redaktionen'),
    bild: z.string().optional(), // t.ex. /img/min-bild.jpg
    toppnyhet: z.boolean().default(false),
    utkast: z.boolean().default(false), // true = syns inte på sajten
  }),
});

export const collections = { artiklar };
