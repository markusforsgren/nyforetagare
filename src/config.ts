// =============================================================
//  ALLT DU BEHÖVER ÄNDRA FINNS HÄR
// =============================================================

export const SITE = {
  name: 'Nyföretagare',
  tagline: 'Sveriges nätverk för småföretagare',
  description:
    'Nyheter, reportage, inspiration och tjänster för dig som vill starta, driver eller vill utveckla företag.',
  email: 'kontakt@nyforetagare.se',
  company: 'Today Media Group AB',
  orgnr: '559373-5227',
  facebook: 'https://www.facebook.com/nyforetagare.se/',
};

// Formulären hanteras av Netlify Forms. Inskick syns i Netlify under
// projektet -> Forms. Se README.

// Kategorier. "slug" blir adressen: /kategori/<slug>
// Ändra aldrig en befintlig slug – då försvinner artiklarna från kategorin. Namnet går bra att ändra.
// En kategori syns i menyn först när minst en publicerad artikel ligger i den.
export const CATEGORIES = [
  // Starta
  { slug: 'affarsideer', name: 'Affärsidéer' },
  { slug: 'affarsplan', name: 'Affärsplan och budget' },
  { slug: 'foretagsformer', name: 'Företagsformer och registrering' },
  { slug: 'komma-igang', name: 'Checklistor för att komma igång' },
  { slug: 'kapital', name: 'Finansiering och kapital' },
  // Driva
  { slug: 'ekonomi', name: 'Ekonomi, skatt och bokföring' },
  { slug: 'marknadsforing', name: 'Marknadsföring och försäljning' },
  { slug: 'juridik', name: 'Juridik och avtal' },
  { slug: 'personal', name: 'Personal och arbetsgivarfrågor' },
  { slug: 'digitala-verktyg', name: 'Digitala verktyg och AI' },
  // Utveckla
  { slug: 'affarsutveckling', name: 'Affärsutveckling och strategi' },
  { slug: 'lonsamhet', name: 'Lönsamhet och prissättning' },
  // Kunskap
  { slug: 'foretagsnyheter', name: 'Företagsnyheter' },
  { slug: 'reportage', name: 'Reportage' },
  { slug: 'inspiration', name: 'Inspiration och företagsberättelser' },
  { slug: 'guider', name: 'Guider' },
  { slug: 'tips-verktyg', name: 'Tips och verktyg' },
  // Nätverk
  { slug: 'natverk', name: 'Nätverk och samarbeten' },
  { slug: 'event', name: 'Event och webbinarier' },
] as const;

// Huvudmenyn. "kategorier" visas bara om de har artiklar. "lankar" visas alltid.
export const MENU: { label: string; href: string; kategorier: string[]; lankar: { href: string; label: string }[] }[] = [
  { label: 'Starta', href: '/starta/', kategorier: ['affarsideer', 'affarsplan', 'foretagsformer', 'kapital', 'komma-igang'], lankar: [] },
  { label: 'Driva', href: '/driva/', kategorier: ['ekonomi', 'marknadsforing', 'juridik', 'personal', 'digitala-verktyg'], lankar: [{ href: '/foretagstjanster/', label: 'Företagstjänster' }] },
  { label: 'Utveckla', href: '/utveckla/', kategorier: ['affarsutveckling', 'lonsamhet', 'kapital'], lankar: [] },
  { label: 'Kunskap', href: '/artiklar/', kategorier: ['foretagsnyheter', 'reportage', 'inspiration', 'guider', 'tips-verktyg'], lankar: [{ href: '/artiklar/', label: 'Alla artiklar' }] },
  { label: 'Nätverk', href: '/community/', kategorier: ['natverk', 'event'], lankar: [{ href: '/community/', label: 'Community' }, { href: '/foretag/', label: 'Företagskatalog' }] },
];

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

// Kategorier i tjänstekatalogen. Företag som erbjuder tjänster till andra företag väljer en av dessa.
export const TJANST_KATEGORIER = [
  'Hemsida & webb',
  'Redovisning',
  'Marknadsföring',
  'Juridik',
  'Försäkring',
  'Bank & finansiering',
  'Tryck & profil',
  'IT & teknik',
  'Rekrytering & HR',
  'Coaching & utbildning',
  'Övrigt',
] as const;

// Företagstjänster som visas på startsidan, /foretagstjanster och länssidorna.
// "utvald: true" lyfts fram först.
// "lan": lista med län-slugs, eller ['hela-sverige'] för leverantörer som tar uppdrag överallt.
export type Service = {
  name: string; category: string; area: string; text: string;
  price: string; link: string; utvald: boolean; lan: string[];
  cta?: string; logo?: string;
};
export const SERVICES: Service[] = [
  {
    name: 'M Webbutveckling',
    category: 'Hemsida & webb',
    area: 'Hela Sverige',
    lan: ['hela-sverige'],
    text: 'Startpaket för nystartade: hemsida, domän och synlighet på Google till fast pris.',
    price: '', // fyll i t.ex. 'Från 4 900 kr' så visas det på kortet
    link: 'https://mwebbutveckling.se',
    utvald: true,
  },
];

// Manuella företag (används bara om inga företagsprofiler finns i databasen).
// Företag skapar numera egna profiler på /foretag/konto/.
export const FEATURED_COMPANIES: { name: string; meta: string; lan: string; text: string; link: string }[] = [];

