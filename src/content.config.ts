import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { CATEGORIES, LAN } from './config';

const kategorier = CATEGORIES.map((c) => c.slug) as [string, ...string[]];
const lan = LAN.map((l) => l.slug) as [string, ...string[]];

const artiklar = defineCollection({
  // Hittar artiklar i både src/content/artiklar och src/Content/artiklar.
  // Adressen blir filnamnet: cafe-i-falun.md -> /artiklar/cafe-i-falun/
  loader: glob({
    pattern: '[cC]ontent/artiklar/**/*.md',
    base: './src',
    generateId: ({ entry }) => entry.split('/').pop()!.replace(/\.md$/, ''),
  }),
  schema: z.object({
    title: z.string(),
    ingress: z.string(),
    kategori: z.enum(kategorier),
    fler_kategorier: z.array(z.enum(kategorier)).default([]), // artikeln syns även i dessa kategorier
    lan: z.enum(lan).optional(), // t.ex. dalarna. Utelämna för artiklar som gäller hela Sverige.
    ort: z.string().optional(), // t.ex. Falun
    datum: z.coerce.date(),
    skribent: z.string().default('Redaktionen'),
    bild: z.string().optional(), // t.ex. /img/min-bild.jpg
    toppnyhet: z.boolean().default(false),
    utkast: z.boolean().default(false), // true = syns inte på sajten
  }),
});

export const collections = { artiklar };
