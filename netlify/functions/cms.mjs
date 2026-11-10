// =============================================================
//  CMS-API för adminpanelen (/admin/)
//  - Inloggning och roller via Supabase
//  - Artiklar och bilder sparas som filer i GitHub-repot
//    (Netlify bygger om sajten automatiskt efter varje sparning)
//  Miljövariabler: se README, avsnitt 7.
// =============================================================
import { createClient } from '@supabase/supabase-js';
import YAML from 'yaml';
import { CATEGORIES, LAN } from '../../src/config.ts';

export const config = { path: '/api/cms' };

const KATEGORIER = CATEGORIES.map((c) => c.slug);
const LAN_SLUGS = LAN.map((l) => l.slug);
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const env = () => ({
  supaUrl: process.env.SUPABASE_URL,
  anonKey: process.env.SUPABASE_ANON_KEY,
  serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  ghToken: process.env.GITHUB_TOKEN,
  repo: process.env.GITHUB_REPO, // ägare/repo, sätts i Netlify
  branch: process.env.GITHUB_BRANCH || 'main',
  dir: (process.env.ARTICLES_DIR || 'src/content/artiklar').replace(/\/$/, ''),
  imgDir: (process.env.IMAGES_DIR || 'public/img/uploads').replace(/\/$/, ''),
  siteUrl: (process.env.SITE_URL || process.env.URL || '').replace(/\/$/, ''),
  buildHook: process.env.NETLIFY_BUILD_HOOK || '',
});

class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}
const fail = (status, msg) => { throw new HttpError(status, msg); };
const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });

// ---------- Supabase ----------
const adminClient = (e) =>
  createClient(e.supaUrl, e.serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

async function authenticate(req, e) {
  const jwt = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (!jwt) fail(401, 'Du är inte inloggad.');
  const sb = adminClient(e);
  const { data, error } = await sb.auth.getUser(jwt);
  if (error || !data?.user) fail(401, 'Sessionen har gått ut. Logga in igen.');
  const { data: prof, error: pErr } = await sb.from('profiles').select('*').eq('id', data.user.id).maybeSingle();
  if (pErr) fail(500, 'Kunde inte läsa användarprofilen.');
  if (!prof || prof.aktiv === false) fail(403, 'Ditt konto har inte behörighet till redaktionen.');
  return { sb, user: data.user, prof: { ...prof, email: prof.email || data.user.email, lan: prof.lan || [] } };
}

const isAdmin = (p) => p.roll === 'admin';
const canPublish = (p) => isAdmin(p) || p.publicera === true;
function canEdit(p, fm) {
  if (isAdmin(p)) return true;
  if (fm.skapad_av && fm.skapad_av === p.email) return true;
  return !!fm.lan && p.lan.includes(fm.lan);
}

// ---------- GitHub ----------
async function gh(e, path, opts = {}) {
  const res = await fetch(`https://api.github.com/repos/${e.repo}/${path}`, {
    ...opts,
    headers: {
      authorization: `Bearer ${e.ghToken}`,
      accept: 'application/vnd.github+json',
      'x-github-api-version': '2022-11-28',
      'user-agent': 'nyforetagare-cms',
      ...(opts.body ? { 'content-type': 'application/json' } : {}),
    },
  });
  if (res.status === 404) return null;
  const body = await res.json().catch(() => ({}));
  if (res.status === 409 || res.status === 422) fail(409, 'Någon annan har ändrat filen samtidigt. Ladda om och försök igen.');
  if (!res.ok) fail(502, `GitHub svarade ${res.status}: ${body.message || 'okänt fel'}`);
  return body;
}

async function ghGraphql(e, query, variables) {
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: { authorization: `Bearer ${e.ghToken}`, 'content-type': 'application/json', 'user-agent': 'nyforetagare-cms' },
    body: JSON.stringify({ query, variables }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || body.errors) fail(502, 'Kunde inte läsa artiklarna från GitHub.');
  return body.data;
}

const b64 = (s) => Buffer.from(s, 'utf8').toString('base64');
const unb64 = (s) => Buffer.from(s, 'base64').toString('utf8');
const filePath = (e, slug) => `${e.dir}/${slug}.md`;
const encodePath = (p) => p.split('/').map(encodeURIComponent).join('/');

async function getFile(e, path) {
  return gh(e, `contents/${encodePath(path)}?ref=${encodeURIComponent(e.branch)}`);
}
async function putFile(e, path, contentB64, message, sha) {
  return gh(e, `contents/${encodePath(path)}`, {
    method: 'PUT',
    body: JSON.stringify({ message, content: contentB64, branch: e.branch, ...(sha ? { sha } : {}) }),
  });
}

// ---------- Markdown + frontmatter ----------
export function parseMd(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) return { fm: {}, body: text };
  let fm = {};
  try { fm = YAML.parse(m[1]) || {}; } catch { fm = {}; }
  if (fm.datum instanceof Date) fm.datum = fm.datum.toISOString().slice(0, 10);
  if (fm.datum != null) fm.datum = String(fm.datum).slice(0, 10);
  return { fm, body: m[2].replace(/^\r?\n/, '') };
}

const FIELD_ORDER = ['title', 'ingress', 'kategori', 'lan', 'ort', 'datum', 'skribent', 'bild', 'toppnyhet', 'utkast', 'granskning', 'skapad_av'];
export function toMd(fm, body) {
  const out = {};
  for (const k of FIELD_ORDER) {
    const v = fm[k];
    if (v === undefined || v === null || v === '') continue;
    if ((k === 'toppnyhet' || k === 'granskning') && v === false) continue;
    out[k] = v;
  }
  return `---\n${YAML.stringify(out, { lineWidth: 0 }).trimEnd()}\n---\n\n${(body || '').trim()}\n`;
}

const clean = (v, max = 500) => (typeof v === 'string' ? v.replace(/\r/g, '').trim().slice(0, max) : '');

function validateArticle(a) {
  const fm = {
    title: clean(a.title, 200),
    ingress: clean(a.ingress, 600),
    kategori: clean(a.kategori, 40),
    lan: clean(a.lan, 40) || undefined,
    ort: clean(a.ort, 80) || undefined,
    datum: clean(a.datum, 10),
    skribent: clean(a.skribent, 120) || 'Redaktionen',
    bild: clean(a.bild, 300) || undefined,
    toppnyhet: a.toppnyhet === true,
    utkast: a.utkast !== false,
  };
  if (!fm.title) fail(400, 'Rubrik saknas.');
  if (!fm.ingress) fail(400, 'Ingress saknas.');
  if (!KATEGORIER.includes(fm.kategori)) fail(400, 'Välj en kategori.');
  if (fm.lan && !LAN_SLUGS.includes(fm.lan)) fail(400, 'Okänt län.');
  if (!DATE_RE.test(fm.datum)) fail(400, 'Datum ska vara ÅÅÅÅ-MM-DD.');
  if (fm.bild && !/^\/img\/[\w\-./]+$/.test(fm.bild)) fail(400, 'Ogiltig bildsökväg.');
  const body = typeof a.body === 'string' ? a.body.replace(/\r/g, '').slice(0, 100_000) : '';
  return { fm, body };
}

// ---------- Actions ----------
async function listArticles(e, prof) {
  const [owner, name] = e.repo.split('/');
  const data = await ghGraphql(e,
    `query($owner:String!,$name:String!,$expr:String!){repository(owner:$owner,name:$name){object(expression:$expr){... on Tree{entries{name object{... on Blob{text}}}}}}}`,
    { owner, name, expr: `${e.branch}:${e.dir}` });
  const entries = data?.repository?.object?.entries || [];
  return entries
    .filter((x) => x.name.endsWith('.md') && !x.name.startsWith('_'))
    .map((x) => {
      const { fm } = parseMd(x.object?.text || '');
      return {
        slug: x.name.replace(/\.md$/, ''),
        title: fm.title || x.name, kategori: fm.kategori || '', lan: fm.lan || '', ort: fm.ort || '',
        datum: fm.datum || '', skribent: fm.skribent || '', utkast: fm.utkast === true,
        granskning: fm.granskning === true, toppnyhet: fm.toppnyhet === true,
        skapad_av: fm.skapad_av || '', canEdit: canEdit(prof, fm),
      };
    })
    .sort((a, b) => (b.datum || '').localeCompare(a.datum || ''));
}

async function getArticle(e, prof, slug) {
  if (!SLUG_RE.test(slug || '')) fail(400, 'Ogiltig adress.');
  const f = await getFile(e, filePath(e, slug));
  if (!f) fail(404, 'Artikeln finns inte.');
  const { fm, body } = parseMd(unb64(f.content));
  return { slug, sha: f.sha, ...fm, body, canEdit: canEdit(prof, fm) };
}

async function saveArticle(e, prof, input) {
  const slug = clean(input.slug, 80);
  if (!SLUG_RE.test(slug)) fail(400, 'Adressen får bara innehålla a–z, 0–9 och bindestreck.');
  const { fm, body } = validateArticle(input);
  const path = filePath(e, slug);
  const existing = await getFile(e, path);

  if (input.isNew && existing) fail(409, 'Det finns redan en artikel med den adressen. Välj en annan.');
  if (!input.isNew && !existing) fail(404, 'Artikeln finns inte längre.');

  let old = {};
  if (existing) {
    old = parseMd(unb64(existing.content)).fm;
    if (!canEdit(prof, old)) fail(403, 'Du har inte behörighet att ändra den här artikeln.');
    if (input.sha && input.sha !== existing.sha) fail(409, 'Artikeln har ändrats av någon annan. Ladda om och försök igen.');
  }

  // Län-begränsning för redaktörer
  if (!isAdmin(prof) && prof.lan.length > 0 && !(fm.lan && prof.lan.includes(fm.lan))) {
    fail(403, `Du kan bara skriva för: ${prof.lan.join(', ')}.`);
  }
  // Toppnyhet bara för admin
  if (!isAdmin(prof)) fm.toppnyhet = old.toppnyhet === true;
  // Publicering
  fm.granskning = false;
  if (!fm.utkast && !canPublish(prof)) {
    fm.utkast = true;
    fm.granskning = true; // skickad för granskning
  }
  if (input.granskning === true && fm.utkast) fm.granskning = true;
  fm.skapad_av = old.skapad_av || prof.email;

  const verb = existing ? 'Uppdatera' : 'Ny';
  const state = fm.utkast ? (fm.granskning ? 'granskning' : 'utkast') : 'publicerad';
  // Utkast som aldrig varit publicerade syns inte på sajten -> ingen ombyggnad behövs
  const wasPublished = existing && old.utkast !== true;
  const skip = fm.utkast && !wasPublished ? ' [skip netlify]' : '';
  const res = await putFile(e, path, b64(toMd(fm, body)), `${verb} artikel: ${fm.title} (${state}, ${prof.namn || prof.email})${skip}`, existing?.sha);
  return { slug, sha: res?.content?.sha, state };
}

async function deleteArticle(e, prof, slug) {
  if (!isAdmin(prof)) fail(403, 'Bara administratörer kan radera artiklar.');
  if (!SLUG_RE.test(slug || '')) fail(400, 'Ogiltig adress.');
  const f = await getFile(e, filePath(e, slug));
  if (!f) fail(404, 'Artikeln finns inte.');
  await gh(e, `contents/${encodePath(filePath(e, slug))}`, {
    method: 'DELETE',
    body: JSON.stringify({ message: `Radera artikel: ${slug} (${prof.namn || prof.email})`, sha: f.sha, branch: e.branch }),
  });
  return { ok: true };
}

async function uploadImage(e, prof, input) {
  const m = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$/.exec(input.dataUrl || '');
  if (!m) fail(400, 'Bilden måste vara JPG, PNG eller WebP.');
  const bytes = Math.floor((m[2].length * 3) / 4);
  if (bytes > MAX_IMAGE_BYTES) fail(400, 'Bilden är för stor (max 5 MB).');
  const ext = m[1] === 'jpeg' ? 'jpg' : m[1];
  const base = clean(input.slug, 60).replace(/[^a-z0-9-]/g, '') || 'bild';
  const path = `${e.imgDir}/${base}-${Date.now()}.${ext}`;
  await putFile(e, path, m[2], `Ny bild: ${path} (${prof.namn || prof.email}) [skip netlify]`);
  return { path: '/' + path.replace(/^public\//, '') };
}

// ---------- Användare (admin) ----------
function cleanProfile(input) {
  const roll = input.roll === 'admin' ? 'admin' : 'redaktor';
  const lan = Array.isArray(input.lan) ? input.lan.filter((l) => LAN_SLUGS.includes(l)) : [];
  return { namn: clean(input.namn, 120), roll, lan, publicera: input.publicera === true };
}

async function listUsers(sb) {
  const { data, error } = await sb.from('profiles').select('id,email,namn,roll,lan,publicera,aktiv,created_at').order('created_at');
  if (error) fail(500, 'Kunde inte hämta användare.');
  return data;
}

async function inviteUser(e, sb, input) {
  const email = clean(input.email, 200).toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) fail(400, 'Ogiltig e-postadress.');
  const p = cleanProfile(input);
  const { data, error } = await sb.auth.admin.inviteUserByEmail(email, { redirectTo: `${e.siteUrl}/admin/` });
  if (error) fail(400, `Kunde inte bjuda in: ${error.message}`);
  const { error: iErr } = await sb.from('profiles').upsert({ id: data.user.id, email, ...p, aktiv: true });
  if (iErr) fail(500, 'Inbjudan skickades men profilen kunde inte sparas.');
  return { ok: true };
}

async function updateUser(sb, me, input) {
  if (!input.id) fail(400, 'Användare saknas.');
  const p = cleanProfile(input);
  const aktiv = input.aktiv !== false;
  if (input.id === me.id && (p.roll !== 'admin' || !aktiv)) fail(400, 'Du kan inte ta bort din egen admin-behörighet.');
  const { error } = await sb.from('profiles').update({ ...p, aktiv }).eq('id', input.id);
  if (error) fail(500, 'Kunde inte spara användaren.');
  return { ok: true };
}

// ---------- Företag ----------
const COMPANY_FIELDS = 'id,slug,namn,bransch,orgnr,lan,ort,kort,beskrivning,tjanster,tjanstekategori,webbplats,epost,telefon,logo_url,status,avslag_orsak,utvald,created_at,updated_at,owner_id';

async function triggerBuild(e, reason) {
  if (!e.buildHook) { console.warn('NETLIFY_BUILD_HOOK saknas – sajten byggs inte om automatiskt.'); return false; }
  const res = await fetch(`${e.buildHook}?trigger_title=${encodeURIComponent(reason)}`, { method: 'POST', body: '{}' }).catch(() => null);
  return !!res?.ok;
}

async function listCompanies(sb) {
  const { data, error } = await sb.from('companies').select(COMPANY_FIELDS).order('created_at', { ascending: false });
  if (error) fail(500, 'Kunde inte hämta företag.');
  // Lägg till kontots e-post så admin vet vem som registrerat
  const ids = data.map((c) => c.owner_id);
  const emails = {};
  if (ids.length) {
    const { data: users } = await sb.auth.admin.listUsers({ perPage: 1000 });
    for (const u of users?.users || []) emails[u.id] = u.email;
  }
  return data.map(({ owner_id, ...c }) => ({ ...c, konto: emails[owner_id] || '' }));
}

async function updateCompany(e, sb, input) {
  if (!input.id) fail(400, 'Företag saknas.');
  const patch = {};
  if (['pending', 'approved', 'rejected'].includes(input.status)) patch.status = input.status;
  if (typeof input.utvald === 'boolean') patch.utvald = input.utvald;
  if (patch.status === 'rejected') patch.avslag_orsak = clean(input.avslag_orsak, 300) || null;
  if (patch.status === 'approved') patch.avslag_orsak = null;
  if (!Object.keys(patch).length) fail(400, 'Inget att ändra.');
  const { data: before } = await sb.from('companies').select('status,utvald,namn').eq('id', input.id).maybeSingle();
  if (!before) fail(404, 'Företaget finns inte.');
  const { error } = await sb.from('companies').update(patch).eq('id', input.id);
  if (error) fail(500, 'Kunde inte spara företaget.');
  // Bygg om om något som syns publikt ändrats
  const visibleChange = before.status === 'approved' || patch.status === 'approved';
  const rebuilt = visibleChange ? await triggerBuild(e, `Företag: ${before.namn} (${patch.status || 'utvald'})`) : false;
  return { ok: true, rebuilt };
}

// Ett godkänt företag har sparat ändringar -> bygg om sajten
async function companyChanged(req, e) {
  const jwt = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (!jwt) fail(401, 'Du är inte inloggad.');
  const sb = adminClient(e);
  const { data, error } = await sb.auth.getUser(jwt);
  if (error || !data?.user) fail(401, 'Sessionen har gått ut.');
  const { data: c } = await sb.from('companies').select('namn,status,updated_at').eq('owner_id', data.user.id).maybeSingle();
  if (!c || c.status !== 'approved') return { rebuilt: false };
  // Bara precis efter en sparning (skydd mot upprepade anrop)
  if (Date.now() - new Date(c.updated_at).getTime() > 2 * 60 * 1000) return { rebuilt: false };
  return { rebuilt: await triggerBuild(e, `Företag uppdaterat: ${c.namn}`) };
}

// ---------- Radera eget konto (GDPR) ----------
async function deleteAccount(req, e, input) {
  const jwt = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (!jwt) fail(401, 'Du är inte inloggad.');
  if (input.confirm !== 'RADERA') fail(400, 'Skriv RADERA för att bekräfta.');
  const sb = adminClient(e);
  const { data, error } = await sb.auth.getUser(jwt);
  if (error || !data?.user) fail(401, 'Sessionen har gått ut. Logga in igen.');
  const uid = data.user.id;
  const { data: prof } = await sb.from('profiles').select('roll').eq('id', uid).maybeSingle();
  if (prof?.roll === 'admin') fail(403, 'Ett admin-konto kan inte raderas här. Be en annan admin ta bort behörigheten först.');
  const { data: company } = await sb.from('companies').select('status,namn').eq('owner_id', uid).maybeSingle();
  // Ta bort loggor i användarens mapp
  const { data: files } = await sb.storage.from('logos').list(uid, { limit: 1000 });
  if (files?.length) await sb.storage.from('logos').remove(files.map((f) => `${uid}/${f.name}`));
  // Radera användaren – profil, företag, inlägg, kommentarer och meddelanden raderas automatiskt (on delete cascade)
  const { error: dErr } = await sb.auth.admin.deleteUser(uid);
  if (dErr) fail(500, 'Kunde inte radera kontot. Kontakta oss så hjälper vi dig.');
  if (company?.status === 'approved') await triggerBuild(e, `Konto raderat: ${company.namn}`);
  return { ok: true };
}

// ---------- Handler ----------
export default async (req) => {
  const e = env();
  try {
    if (req.method === 'GET') {
      // Publika uppgifter som inloggningssidan behöver
      if (!e.supaUrl || !e.anonKey) fail(500, 'SUPABASE_URL / SUPABASE_ANON_KEY saknas i Netlify.');
      return json({ supabaseUrl: e.supaUrl, supabaseAnonKey: e.anonKey });
    }
    if (req.method !== 'POST') fail(405, 'Metoden stöds inte.');
    for (const k of ['supaUrl', 'serviceKey', 'ghToken', 'repo']) if (!e[k]) fail(500, `Miljövariabel saknas: ${k}`);

    const input = await req.json().catch(() => ({}));
    if (input.action === 'companyChanged') return json(await companyChanged(req, e));
    if (input.action === 'deleteAccount') return json(await deleteAccount(req, e, input));
    const { sb, user, prof } = await authenticate(req, e);

    switch (input.action) {
      case 'me': return json({ id: user.id, email: prof.email, namn: prof.namn, roll: prof.roll, lan: prof.lan, publicera: canPublish(prof) });
      case 'list': return json(await listArticles(e, prof));
      case 'get': return json(await getArticle(e, prof, input.slug));
      case 'save': return json(await saveArticle(e, prof, input.article || {}));
      case 'delete': return json(await deleteArticle(e, prof, input.slug));
      case 'upload': return json(await uploadImage(e, prof, input));
      case 'users':
        if (!isAdmin(prof)) fail(403, 'Bara administratörer.');
        return json(await listUsers(sb));
      case 'invite':
        if (!isAdmin(prof)) fail(403, 'Bara administratörer.');
        return json(await inviteUser(e, sb, input.user || {}));
      case 'updateUser':
        if (!isAdmin(prof)) fail(403, 'Bara administratörer.');
        return json(await updateUser(sb, user, input.user || {}));
      case 'companies':
        if (!isAdmin(prof)) fail(403, 'Bara administratörer.');
        return json(await listCompanies(sb));
      case 'updateCompany':
        if (!isAdmin(prof)) fail(403, 'Bara administratörer.');
        return json(await updateCompany(e, sb, input.company || {}));
      default: fail(400, 'Okänd åtgärd.');
    }
  } catch (err) {
    if (err instanceof HttpError) return json({ error: err.message }, err.status);
    console.error(err);
    return json({ error: 'Något gick fel på servern.' }, 500);
  }
};
