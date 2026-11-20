// Beskriver vilka texter och bilder som går att ändra i adminpanelen (fliken "Sidtexter").
// Själva texterna ligger i sidtexter.json. Lägg till ett fält här + i JSON-filen för att göra mer redigerbart.
import { CATEGORIES } from '../config';
import { LAN_BAS } from './lan-bas';

export type Falt = {
  key: string;
  label: string;
  typ: 'text' | 'textarea' | 'bild' | 'lank' | 'epost' | 'lista';
  hjalp?: string;
  max?: number;
  falt?: Falt[]; // för listor: fälten i varje rad
};
export type Del = {
  key: string;
  label: string;
  sida?: string; // länk till sidan där texterna syns
  falt?: Falt[];
  poster?: { key: string; label: string }[]; // för kategorier och län: samma fält för varje post
  postFalt?: Falt[];
};

const t = (key: string, label: string, hjalp?: string): Falt => ({ key, label, typ: 'text', hjalp, max: 200 });
const ta = (key: string, label: string, hjalp?: string): Falt => ({ key, label, typ: 'textarea', hjalp, max: 2000 });
const kort = (key: string, label: string): Falt => ({ key, label, typ: 'lista', falt: [t('titel', 'Rubrik'), ta('text', 'Text')] });

export const SIDTEXTER_SCHEMA: Del[] = [
  {
    key: 'allmant', label: 'Allmänt', sida: '/',
    falt: [
      t('slogan', 'Slogan överst på sidan'),
      t('tagline', 'Undertitel (visas i Google och sidfoten)'),
      ta('beskrivning', 'Beskrivning i Google', 'Visas under länken i sökresultat. Håll den under 160 tecken.'),
      { key: 'facebook', label: 'Länk till Facebooksidan', typ: 'lank' },
      { key: 'standardbild', label: 'Standardbild', typ: 'bild', hjalp: 'Används när en artikel saknar bild och när sidan delas i sociala medier.' },
    ],
  },
  {
    key: 'startsida', label: 'Startsidan', sida: '/',
    falt: [
      t('etikett', 'Liten text ovanför rubriken'),
      t('rubrik', 'Rubrik (början)'),
      t('rubrik_markerad', 'Rubrik (det gröna ordet)'),
      ta('ingress', 'Ingress'),
      t('knapp1', 'Knapp 1 (till Om oss)'),
      t('knapp2', 'Knapp 2 (Bli medlem)'),
      t('lokal_etikett', 'Lokalt: liten text'),
      t('lokal_rubrik', 'Lokalt: rubrik'),
      ta('lokal_text', 'Lokalt: text'),
      { key: 'lokal_bild', label: 'Lokalt: bild', typ: 'bild' },
      t('fokus_rubrik', 'Företagare i fokus: rubrik'),
      t('fokus_text', 'Företagare i fokus: text'),
      t('fokus_cta_rubrik', 'Företagare i fokus: rubrik i mörka rutan'),
      ta('fokus_cta_text', 'Företagare i fokus: text i mörka rutan'),
      t('tjanster_etikett', 'Företagstjänster: liten text'),
      t('tjanster_rubrik', 'Företagstjänster: rubrik'),
      ta('tjanster_text', 'Företagstjänster: text'),
      t('uppringd_etikett', 'Bli uppringd: liten text'),
      t('uppringd_rubrik', 'Bli uppringd: rubrik'),
      ta('uppringd_text', 'Bli uppringd: text'),
      t('uppringd_knapp', 'Bli uppringd: knapptext'),
      t('nyhetsbrev_rubrik', 'Nyhetsbrev: rubrik', 'Nyhetsbrevsrutan längst ned på flera sidor.'),
      t('nyhetsbrev_text', 'Nyhetsbrev: text'),
    ],
  },
  {
    key: 'omoss', label: 'Om oss', sida: '/om-oss/',
    falt: [
      t('rubrik', 'Rubrik'),
      ta('ingress', 'Ingress'),
      t('far_rubrik', 'Rubrik: Det här får du'),
      kort('far', 'Det här får du (kort)'),
      t('steg_rubrik', 'Rubrik: Kom igång'),
      kort('steg', 'Kom igång (steg)'),
      t('vision_rubrik', 'Vision: rubrik'),
      ta('vision_text', 'Vision: text'),
      ta('tips_text', 'Tipsa oss: text'),
      t('kontakt_text', 'Kontakta oss: text'),
    ],
  },
  {
    key: 'tjanster', label: 'Våra tjänster', sida: '/tjanster/',
    falt: [
      t('rubrik', 'Rubrik'),
      ta('ingress', 'Ingress'),
      { key: 'lista', label: 'Tjänster', typ: 'lista', falt: [t('titel', 'Namn på tjänsten'), ta('text', 'Beskrivning'), ta('punkter', 'Punkter', 'En punkt per rad.')] },
      ta('offert_text', 'Begär offert: text'),
    ],
  },
  {
    key: 'lokalpartner', label: 'Bli lokal partner', sida: '/lokal-partner/',
    falt: [
      t('rubrik', 'Rubrik'),
      ta('ingress', 'Ingress'),
      kort('gor', 'Det här gör en lokal partner'),
      kort('far', 'Det här får du'),
      ta('villkor', 'Text om villkor'),
    ],
  },
  {
    key: 'investmatch', label: 'InvestMatch', sida: '/kategori/investering/',
    falt: [
      t('etikett', 'Liten text'),
      t('rubrik', 'Rubrik'),
      ta('text', 'Text'),
      t('kapital_rubrik', 'Söker kapital: rubrik'),
      ta('kapital_text', 'Söker kapital: text'),
      t('investera_rubrik', 'Vill investera: rubrik'),
      ta('investera_text', 'Vill investera: text'),
      { key: 'epost', label: 'E-post', typ: 'epost' },
    ],
  },
  {
    key: 'kategorier', label: 'Kategorier', sida: '/artiklar/',
    poster: CATEGORIES.map((c) => ({ key: c.slug, label: c.name })),
    postFalt: [
      t('titel', 'Titel i Google'),
      ta('text', 'Text överst på sidan och i Google'),
    ],
  },
  {
    key: 'lan', label: 'Län och ansvariga', sida: '/lan/',
    poster: LAN_BAS.map((l) => ({ key: l.slug, label: l.name })),
    postFalt: [
      t('ansvarig', 'Ansvarig (namn)', 'Tomt = länet söker lokal partner.'),
      { key: 'epost', label: 'E-post', typ: 'epost', hjalp: 'Tomt = kontakt@nyforetagare.se' },
      t('telefon', 'Telefon'),
      { key: 'facebook', label: 'Länk till länets Facebookgrupp', typ: 'lank' },
    ],
  },
];
