// Hämtar godkända företag från Supabase när sajten byggs.
// Saknas SUPABASE_URL/SUPABASE_ANON_KEY (t.ex. lokalt) blir listan tom.
import { lanName, type Service } from '../config';

export type Company = {
  id: string;
  owner_id: string;
  slug: string;
  namn: string;
  bransch: string | null;
  lan: string | null;
  ort: string | null;
  kort: string | null;
  beskrivning: string | null;
  tjanster: string[];
  tjanstekategori: string | null;
  webbplats: string | null;
  epost: string | null;
  telefon: string | null;
  logo_url: string | null;
  utvald: boolean;
  updated_at: string;
};

const FIELDS = 'id,owner_id,slug,namn,bransch,lan,ort,kort,beskrivning,tjanster,tjanstekategori,webbplats,epost,telefon,logo_url,utvald,updated_at';

let cache: Promise<Company[]> | null = null;

export function getCompanies(): Promise<Company[]> {
  if (!cache) cache = load();
  return cache;
}

async function load(): Promise<Company[]> {
  const url = process.env.SUPABASE_URL || import.meta.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY || import.meta.env.SUPABASE_ANON_KEY;
  if (!url || !key) {
    console.warn('[företag] SUPABASE_URL/SUPABASE_ANON_KEY saknas – inga företagsprofiler hämtas.');
    return [];
  }
  const headers: Record<string, string> = { apikey: key };
  if (key.split('.').length === 3) headers.authorization = `Bearer ${key}`; // äldre JWT-nycklar
  const res = await fetch(`${url.replace(/\/$/, '')}/rest/v1/companies?status=eq.approved&select=${FIELDS}&order=namn.asc`, { headers });
  if (!res.ok) {
    // Hellre ett misslyckat bygge (sajten behåller förra versionen) än en sajt utan företag
    throw new Error(`[företag] Kunde inte hämta företag från Supabase: ${res.status} ${await res.text()}`);
  }
  const rows = (await res.json()) as Company[];
  return rows.filter((c) => c.slug && /^[a-z0-9-]+$/.test(c.slug));
}

/** Plats som text, t.ex. "Falun, Dalarna" */
export const placeOf = (c: Pick<Company, 'ort' | 'lan'>) => [c.ort, lanName(c.lan ?? undefined)].filter(Boolean).join(', ');

/** Företag som erbjuder tjänster, i samma form som tjänsterna i config.ts */
export const asService = (c: Company): Service => ({
  name: c.namn,
  category: c.tjanstekategori || 'Tjänster',
  area: placeOf(c),
  text: c.kort || '',
  price: '',
  link: `/foretag/${c.slug}/`,
  cta: 'Visa företaget',
  utvald: false,
  lan: c.lan ? [c.lan] : [],
  logo: c.logo_url || undefined,
});
