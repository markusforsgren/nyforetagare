# Nyföretagare – webbplats

Statisk sajt byggd med Astro, med adminpanel för redaktionen (Supabase-inloggning). Artiklar är Markdown-filer och formulär går via Netlify Forms.

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

## 3. Publicera på Netlify (10 min)

1. app.netlify.com → Add new site → Import an existing project → GitHub → välj `nyforetagare`.
2. Inställningarna läses från `netlify.toml` (build: `npm run build`, mapp: `dist`). Klicka Deploy.
3. Du får en testadress, t.ex. `nyforetagare-xxxx.netlify.app` (byt namn under Site configuration). **Den skickar du till partnern.**
4. Varje gång du pushar till GitHub uppdateras sajten automatiskt.

## 4. Formulären (5 min)

Formulären (Lista ditt företag, Kontakt, Nyhetsbrev) använder Netlify Forms och fungerar direkt efter första publiceringen.

1. Netlify → sajten → **Forms** → klicka Enable form detection om det behövs, och publicera en gång till.
2. Under Forms → Form notifications → lägg till e-postnotis så får du inskick till din mejl.
3. Efter inskick hamnar besökaren på `/tack/`.

Gratisnivån har ett tak på antal inskick per månad. Det räcker i början. Nyhetsbrevet kan flyttas till MailerLite eller Brevo senare.

## 5. Ändra innehåll

**Nästan allt ändras i `src/config.ts`:** kontaktadress, ditt pris, län och lokala redaktörer, företagstjänster, "Företagare i fokus" och partners.

**Ny artikel:**
1. Kopiera `src/content/artiklar/_MALL.md` (vanlig artikel) eller `_INTERVJU.md` (intervju med företagare) och döp om den, t.ex. `cafe-i-falun.md` (blir `/artiklar/cafe-i-falun/`).
2. Fyll i rubrik, ingress, kategori och datum. Sätt `utkast: false`.
3. Lokal artikel: lägg till `lan: dalarna` och `ort: Falun`. Då syns den på `/lan/dalarna/`. Länens namn står i `src/config.ts` under `LAN`.
4. Bilder läggs i `public/img/` och anges som `bild: /img/filnamn.jpg`.
5. `toppnyhet: true` gör artikeln stor överst på startsidan.
6. Commit + push. Netlify publicerar automatiskt.

**Län**
- `/lan/` visar alla 21 län. `/lan/<slug>/` visar länets artiklar, företag och tjänster.
- Lokal redaktör: fyll i `redaktor` på länet i `LAN`.
- Företag: sätt `lan: 'dalarna'` i `FEATURED_COMPANIES`.
- Tjänster: `lan: ['dalarna', 'gavleborg']`, eller `['hela-sverige']` för att visas i alla län.

**Smidigast att uppdatera:** använd GitHub Desktop. Klona repot en gång, lägg nya filer i mappen, skriv en kort beskrivning, klicka Commit och sedan Push.

## 6. Domän (när det är dags)

Netlify → sajten → Domain management → Add a domain → `nyforetagare.se`, och följ instruktionerna för DNS hos domänleverantören.

## 7. Adminpanel för redaktörer (/admin/)

Redaktörer loggar in med **e-post och lösenord** på `/admin/`, skriver artiklar och laddar upp bilder. Ingen behöver GitHub-konto.

Så funkar det: inloggning och roller sköts av **Supabase**. När någon sparar skriver servern (Netlify-funktionen `netlify/functions/cms.mjs`) artikeln som en fil i GitHub-repot med en hemlig nyckel som bara servern har. Netlify publicerar sedan automatiskt.

### Engångsinställning (ca 30 min)

**A. Supabase**
1. supabase.com → New project (region: Stockholm / eu-north-1 om det finns, annars Frankfurt).
2. SQL Editor → klistra in `supabase/setup.sql` → Run (skapar tabellen `profiles`).
3. Authentication → Users → **Add user** → din e-post + lösenord → bocka i *Auto Confirm User*.
4. Kör de sista raderna i `setup.sql` igen med din e-post ifylld, så blir du admin.
5. Authentication → Sign In / Providers → stäng av **Allow new users to sign up** (bara inbjudna kommer in).
6. Authentication → URL Configuration:
   - Site URL: `https://nyforetagare.netlify.app`
   - Redirect URLs: lägg till `https://nyforetagare.netlify.app/admin/`
7. Project Settings → API: kopiera **Project URL**, **anon public key** och **service_role key**.

**B. GitHub-token (servern använder den för att spara filer)**
1. GitHub → Settings → Developer settings → Personal access tokens → **Fine-grained tokens** → Generate new token.
2. Repository access: *Only select repositories* → ditt `nyforetagare`-repo.
3. Permissions → Repository permissions → **Contents: Read and write**.
4. Välj längsta giltighetstid. Skriv upp när den går ut, då måste den förnyas.

**C. Netlify → Site configuration → Environment variables**

| Variabel | Värde |
| --- | --- |
| `SUPABASE_URL` | Project URL från Supabase |
| `SUPABASE_ANON_KEY` | anon public key |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role key (hemlig!) |
| `GITHUB_TOKEN` | tokenen från steg B (hemlig!) |
| `GITHUB_REPO` | `ditt-github-namn/nyforetagare` |
| `GITHUB_BRANCH` | `main` |
| `ARTICLES_DIR` | `src/Content/artiklar` (exakt som mappen heter i repot) |

Gör sedan en ny deploy (Deploys → Trigger deploy) och gå till `/admin/`.

### Roller

| | Admin | Redaktör | Redaktör med "Får publicera" |
| --- | --- | --- | --- |
| Skriva och spara utkast | ✓ | ✓ | ✓ |
| Publicera | ✓ | Skickar för granskning | ✓ |
| Ändra andras artiklar | Alla | I sina län | I sina län |
| Toppnyhet | ✓ | – | – |
| Radera artiklar | ✓ | – | – |
| Bjuda in och hantera användare | ✓ | – | – |

En redaktör med län (t.ex. Dalarna) kan bara skriva artiklar för de länen. Utan län kan hen skriva för alla.

### Bjuda in någon
Användare → Bjud in ny användare. Personen får ett mejl, klickar på länken och väljer lösenord. Ta bort tillgång: bocka ur **Aktiv** och spara.

Supabase inbyggda e-post klarar bara ett fåtal mejl i timmen. Räcker för redaktionen. Vid fler användare: koppla egen SMTP under Authentication → Emails.

### Publicering
- **Spara utkast**: syns inte på sajten.
- **Skicka för granskning**: admin ser den som "Väntar på granskning".
- **Publicera**: syns på sajten efter ca 1 minut.
- Utkast och bilduppladdningar startar ingen ny publicering på Netlify (sparar byggminuter).
- Tjänster, företag i fokus och län ändras fortfarande i `src/config.ts`.

## Struktur

```
src/config.ts              Inställningar och innehåll
src/content/artiklar/      Artiklar (Markdown)
src/pages/                 Sidor (startsida, tjänster, län, om oss …)
src/components/            Återanvända delar (artikelkort, länsväljare …)
src/layouts/Base.astro     Header och footer
src/styles/global.css      Färger och utseende
src/pages/admin/           Adminpanelen
netlify/functions/cms.mjs  Serverdelen för adminpanelen
supabase/setup.sql         Databastabell för användare och roller
public/img/                Bilder och logga
```

## Inte med i den här versionen

Inloggning för företag (företagsprofiler), sök, kommunfilter, forum och betalning. Det byggs i nästa fas.
