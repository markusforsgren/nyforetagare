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

// Formulären hanteras av Netlify Forms. Inskick syns i Netlify under
// projektet -> Forms. Se README.

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

// Län. "slug" blir adressen: /lan/<slug>
// "redaktor" = lokal partner som driver länet (lämna tomt om ingen).
export const LAN = [
  { slug: 'blekinge', name: 'Blekinge', full: 'Blekinge län', redaktor: '' },
  { slug: 'dalarna', name: 'Dalarna', full: 'Dalarnas län', redaktor: 'Markus Forsgren' },
  { slug: 'gotland', name: 'Gotland', full: 'Gotlands län', redaktor: '' },
  { slug: 'gavleborg', name: 'Gävleborg', full: 'Gävleborgs län', redaktor: '' },
  { slug: 'halland', name: 'Halland', full: 'Hallands län', redaktor: '' },
  { slug: 'jamtland', name: 'Jämtland', full: 'Jämtlands län', redaktor: '' },
  { slug: 'jonkoping', name: 'Jönköping', full: 'Jönköpings län', redaktor: '' },
  { slug: 'kalmar', name: 'Kalmar', full: 'Kalmar län', redaktor: '' },
  { slug: 'kronoberg', name: 'Kronoberg', full: 'Kronobergs län', redaktor: '' },
  { slug: 'norrbotten', name: 'Norrbotten', full: 'Norrbottens län', redaktor: '' },
  { slug: 'skane', name: 'Skåne', full: 'Skåne län', redaktor: '' },
  { slug: 'stockholm', name: 'Stockholm', full: 'Stockholms län', redaktor: '' },
  { slug: 'sodermanland', name: 'Södermanland', full: 'Södermanlands län', redaktor: '' },
  { slug: 'uppsala', name: 'Uppsala', full: 'Uppsala län', redaktor: '' },
  { slug: 'varmland', name: 'Värmland', full: 'Värmlands län', redaktor: '' },
  { slug: 'vasterbotten', name: 'Västerbotten', full: 'Västerbottens län', redaktor: '' },
  { slug: 'vasternorrland', name: 'Västernorrland', full: 'Västernorrlands län', redaktor: '' },
  { slug: 'vastmanland', name: 'Västmanland', full: 'Västmanlands län', redaktor: '' },
  { slug: 'vastra-gotaland', name: 'Västra Götaland', full: 'Västra Götalands län', redaktor: '' },
  { slug: 'orebro', name: 'Örebro', full: 'Örebro län', redaktor: '' },
  { slug: 'ostergotland', name: 'Östergötland', full: 'Östergötlands län', redaktor: '' },
] as const;

export const lanName = (slug?: string) => LAN.find((l) => l.slug === slug)?.name ?? '';

// Företagstjänster som visas på startsidan, /foretagstjanster och länssidorna.
// "utvald: true" lyfts fram först.
// "lan": lista med län-slugs, eller ['hela-sverige'] för leverantörer som tar uppdrag överallt.
export const SERVICES: {
  name: string; category: string; area: string; text: string;
  price: string; link: string; utvald: boolean; lan: string[];
}[] = [
  {
    name: 'M Webbutveckling',
    category: 'Hemsida & webb',
    area: 'Hela Sverige',
    lan: ['hela-sverige'],
    text: 'Startpaket för nystartade: hemsida, domän och synlighet på Google till fast pris.',
    price: 'Från [PRIS] kr', // TODO
    link: 'https://mwebbutveckling.se',
    utvald: true,
  },
  {
    name: '[Redovisningsbyrå]',
    category: 'Redovisning',
    area: '[Ort]',
    lan: ['dalarna'],
    text: '[Kort beskrivning av erbjudandet.]',
    price: '',
    link: '',
    utvald: false,
  },
  {
    name: '[Marknadsbyrå]',
    category: 'Marknadsföring',
    area: '[Ort]',
    lan: ['gavleborg'],
    text: '[Kort beskrivning av erbjudandet.]',
    price: '',
    link: '',
    utvald: false,
  },
];

// Företag som visas under "Företagare i fokus" (startsidan) och på sitt läns sida.
// "link" kan peka på en intervju, t.ex. /artiklar/cafe-i-falun/
export const FEATURED_COMPANIES = [
  { name: '[Företagsnamn]', meta: 'Café · Falun', lan: 'dalarna', text: '[En mening om vad företaget gör.]', link: '' },
  { name: '[Företagsnamn]', meta: 'Bygg · Borlänge', lan: 'dalarna', text: '[En mening om vad företaget gör.]', link: '' },
  { name: '[Företagsnamn]', meta: 'E-handel · Gävle', lan: 'gavleborg', text: '[En mening om vad företaget gör.]', link: '' },
];

export const PARTNERS = ['En Företagares Vardag', 'Arvikamagasinet'];
