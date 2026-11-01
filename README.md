# Nyföretagare – webbplats

Statisk sajt byggd med Astro. Ingen databas och inget att underhålla. Artiklar är Markdown-filer och formulär går via Formspree.

## 1. Kör sajten på din dator (15 min)

1. Installera Node.js (LTS) från nodejs.org om du inte har det.
2. Packa upp mappen och öppna en terminal i den:
   ```
   npm install
   npm run dev
   ```
3. Öppna http://localhost:4321. Ändringar syns direkt när du sparar.

## 2. Lägg upp koden på GitHub (15 min)

Gör det på **ditt eget** konto och gör repot **privat**.

1. github.com → New repository → namn `nyforetagare` → Private → Create.
2. I terminalen, i projektmappen:
   ```
   git init
   git add .
   git commit -m "Första versionen"
   git branch -M main
   git remote add origin https://github.com/DITT-NAMN/nyforetagare.git
   git push -u origin main
   ```
   (Eller använd GitHub Desktop och välj "Add existing repository".)

## 3. Publicera på Vercel (10 min)

1. vercel.com → logga in med ditt GitHub-konto (gratisnivån Hobby räcker).
2. Add New → Project → välj `nyforetagare` → Deploy. Vercel känner igen Astro själv.
3. Du får en testadress, t.ex. `nyforetagare-xxxx.vercel.app`. **Den skickar du till partnern.**
4. Varje gång du pushar till GitHub uppdateras sajten automatiskt.

## 4. Koppla formulären (15 min)

1. formspree.io → skapa konto → skapa tre formulär: *Lista företag*, *Nyhetsbrev*, *Kontakt*.
2. Kopiera respektive adress (`https://formspree.io/f/xxxxxxx`).
3. Klistra in dem i `src/config.ts` under `FORMS`.
4. Pusha. Klart. Inskick kommer till din e-post.

Gratisnivån har ett tak på antal inskick per månad. Det räcker i början. Nyhetsbrevet kan flyttas till MailerLite eller Brevo senare.

## 5. Ändra innehåll

**Nästan allt ändras i `src/config.ts`:** kontaktadress, ditt pris, företagstjänster, "Företagare i fokus" och partners.

**Ny artikel:**
1. Kopiera `src/content/artiklar/_MALL.md` och döp om den, t.ex. `cafe-i-falun.md` (blir `/artiklar/cafe-i-falun/`).
2. Fyll i rubrik, ingress, kategori och datum. Sätt `utkast: false`.
3. Bilder läggs i `public/img/` och anges som `bild: /img/filnamn.jpg`.
4. `toppnyhet: true` gör artikeln stor överst på startsidan.
5. Pusha.

Tips: Det går att skapa och redigera filer direkt på github.com (knappen "Add file" eller pennan). Vercel publicerar automatiskt efteråt.

## 6. Domän (när det är dags)

Vercel → projektet → Settings → Domains → lägg till `nyforetagare.se` och följ instruktionerna för DNS hos domänleverantören.

## Struktur

```
src/config.ts              Inställningar och innehåll
src/content/artiklar/      Artiklar (Markdown)
src/pages/                 Sidor (startsida, tjänster, om oss …)
src/layouts/Base.astro     Header och footer
src/styles/global.css      Färger och utseende
public/img/                Bilder och logga
```

## Inte med i den här versionen

Inloggning, företagsprofiler i databas, sök, kommunfilter, forum och betalning. Det byggs i nästa fas.
