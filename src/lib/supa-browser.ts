// Delad Supabase-klient för sidor som körs i webbläsaren (community, chatt)
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let clientPromise: Promise<SupabaseClient | null> | null = null;

export function getSupabase(): Promise<SupabaseClient | null> {
  if (!clientPromise) {
    clientPromise = (async () => {
      const r = await fetch('/api/cms');
      if (!r.ok) return null;
      const c = await r.json();
      return createClient(c.supabaseUrl, c.supabaseAnonKey, {
        auth: { flowType: 'implicit', detectSessionInUrl: true, persistSession: true },
      });
    })().catch(() => null);
  }
  return clientPromise;
}

export type Member = {
  user_id: string;
  namn: string;
  slug: string | null;
  logo_url: string | null;
  lan: string | null;
  bransch: string | null;
  typ: 'foretag' | 'redaktion';
};

/** Hämtar medlemmar (namn, logga, länk) för en lista användar-id:n */
export async function getMembers(sb: SupabaseClient, ids: string[]): Promise<Map<string, Member>> {
  const uniq = [...new Set(ids)].filter(Boolean);
  const map = new Map<string, Member>();
  if (!uniq.length) return map;
  const { data } = await sb.from('members').select('*').in('user_id', uniq);
  for (const m of (data || []) as Member[]) map.set(m.user_id, m);
  return map;
}

export const esc = (s: unknown) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

/** Text -> säker HTML med radbrytningar och klickbara länkar */
export function richText(s: string) {
  return esc(s)
    .replace(/(https?:\/\/[^\s<]+[^\s<.,!?)])/g, '<a href="$1" rel="nofollow noopener ugc" target="_blank">$1</a>')
    .replace(/\n/g, '<br>');
}

export function timeAgo(iso: string) {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return 'nyss';
  if (s < 3600) return `${Math.floor(s / 60)} min sedan`;
  if (s < 86400) return `${Math.floor(s / 3600)} tim sedan`;
  if (s < 7 * 86400) { const d = Math.floor(s / 86400); return d === 1 ? 'igår' : `${d} dagar sedan`; }
  return new Date(iso).toLocaleDateString('sv-SE', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function avatar(m: Member | undefined, size = 40) {
  const name = m?.namn || 'Medlem';
  const initials = name.split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  return m?.logo_url
    ? `<img class="av" src="${esc(m.logo_url)}" alt="" width="${size}" height="${size}" style="width:${size}px;height:${size}px" />`
    : `<span class="av av-ph" style="width:${size}px;height:${size}px" aria-hidden="true">${esc(initials)}</span>`;
}

export function memberName(m: Member | undefined) {
  if (!m) return '<span>Tidigare medlem</span>';
  return m.slug ? `<a href="/foretag/${esc(m.slug)}/" class="mname">${esc(m.namn)}</a>` : `<span class="mname">${esc(m.namn)}</span>`;
}
