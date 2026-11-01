// =============================================================
//  ALLT DU BEHÖVER ÄNDRA FINNS HÄR
// =============================================================

export const SITE = {
  name: 'Nyföretagare',
  tagline: 'Vi lyfter Sveriges företagare!',
  description:
    'Nyheter, reportage, inspiration och tjänster för dig som vill starta, driver eller vill utveckla företag.',
  email: 'hej@nyforetagare.se', // TODO: rätt kontaktadress
  facebook: 'https://www.facebook.com/nyforetagare.se/',
};

// Formulär skickas via Formspree (gratis). Skapa formulär på formspree.io
// och klistra in deras adresser här. Se README.
export const FORMS = {
  listaForetag: 'https://formspree.io/f/DITT_ID_1', // TODO
  nyhetsbrev: 'https://formspree.io/f/DITT_ID_2', // TODO
  kontakt: 'https://formspree.io/f/DITT_ID_3', // TODO
};

// Kategorier. "slug" blir adressen: /kategori/<slug>
export const CATEGORIES = [
  { slug: 'foretagsnyheter', name: 'Företagsnyheter' },
  { slug: 'reportage', name: 'Reportage' },
  { slug: 'inspiration', name: 'Inspiration' },
  { slug: 'affarsideer', name: 'Affärsidéer' },
  { slug: 'kapital', name: 'Kapital & investerare' },
  { slug: 'natverk', name: 'Nätverk' },
] as const;

export type CategorySlug = (typeof CATEGORIES)[number]['slug'];

export const categoryName = (slug: string) =>
  CATEGORIES.find((c) => c.slug === slug)?.name ?? slug;

// Företagstjänster som visas på startsidan och /foretagstjanster.
// "utvald: true" lyfts fram först.
export const SERVICES = [
  {
    name: 'M Webbutveckling',
    category: 'Hemsida & webb',
    area: 'Dalarna och Gävleborg',
    text: 'Startpaket för nystartade: hemsida, domän och synlighet på Google till fast pris.',
    price: 'Från [PRIS] kr', // TODO
    link: 'https://mwebbutveckling.se',
    utvald: true,
  },
  {
    name: '[Redovisningsbyrå]',
    category: 'Redovisning',
    area: '[Ort]',
    text: '[Kort beskrivning av erbjudandet.]',
    price: '',
    link: '',
    utvald: false,
  },
  {
    name: '[Marknadsbyrå]',
    category: 'Marknadsföring',
    area: '[Ort]',
    text: '[Kort beskrivning av erbjudandet.]',
    price: '',
    link: '',
    utvald: false,
  },
];

// Företag som visas under "Företagare i fokus"
export const FEATURED_COMPANIES = [
  { name: '[Företagsnamn]', meta: 'Café · Falun', text: '[En mening om vad företaget gör.]', link: '' },
  { name: '[Företagsnamn]', meta: 'Bygg · Borlänge', text: '[En mening om vad företaget gör.]', link: '' },
  { name: '[Företagsnamn]', meta: 'E-handel · Gävle', text: '[En mening om vad företaget gör.]', link: '' },
];

export const PARTNERS = ['En Företagares Vardag', 'Arvikamagasinet'];
