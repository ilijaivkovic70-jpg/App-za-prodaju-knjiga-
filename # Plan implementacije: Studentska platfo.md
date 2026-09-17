# Plan implementacije: Studentska platforma za kupovinu i prodaju materijala

Radni naziv projekta, ime možeš promeniti kasnije. Fokus: Ekonomski fakultet Beograd, proširivo na druge fakultete.

**Stack:** Next.js (TypeScript) + Supabase (baza, auth, storage) + Tailwind CSS + shadcn/ui + Resend (email) + Vercel (hosting)

---

## FAZA 0: Postavka (temelj)

Sve što mora da postoji pre nego što napravimo prvu pravu funkciju platforme.

### 0.1 Inicijalizacija projekta

**Opis:** Pravimo prazan Next.js projekat sa TypeScript i Tailwind podrškom, ovo je skelet na kome gradimo sve ostalo.

**Zadaci:**
- Pokrenuti `npx create-next-app@latest` sa opcijama: TypeScript, Tailwind, App Router
- Podesiti Git repozitorijum i prvi commit
- Instalirati i podesiti shadcn/ui (`npx shadcn@latest init`)
- Napraviti osnovnu strukturu foldera: `app/`, `components/`, `lib/`

**Rezultat:** Projekat se pokreće lokalno komandom `npm run dev`, prazna početna stranica se učitava, shadcn komponente su dostupne.

**Napomena:** Nemoj još da povezuješ bazu ili login, ovaj korak je samo skelet. Ako pokušaš sve odjednom, teško ćeš znati gde je greška kad nešto ne radi.

---

### 0.2 Podešavanje Supabase projekta

**Opis:** Pravimo Supabase projekat koji će nam dati bazu, prijavu korisnika i skladište za slike, sve na jednom mestu.

**Zadaci:**
- Napraviti nalog i novi projekat na supabase.com
- Sačuvati `SUPABASE_URL` i `SUPABASE_ANON_KEY` u `.env.local`
- Instalirati `@supabase/supabase-js` i `@supabase/ssr`
- Napraviti `lib/supabase/client.ts` (za browser) i `lib/supabase/server.ts` (za server komponente)

**Rezultat:** Next.js aplikacija uspešno komunicira sa Supabase projektom (test upit vraća prazan rezultat bez greške).

**Napomena:** Fajl `.env.local` mora biti u `.gitignore`, nikad ga ne kačiš na GitHub. Ključeve ćeš posebno dodati na Vercel u koraku 0.6.

---

### 0.3 Šema baze podataka

**Opis:** Definišemo tabele koje čuvaju korisnike, oglase, fakultete, smerove i predmete, ovo je osnova cele platforme.

**Zadaci:**
- Tabela `fakulteti` (id, naziv), ubaciti "Ekonomski fakultet Beograd"
- Tabela `smerovi` (id, fakultet_id, naziv), ubaciti sve smerove
- Tabela `predmeti` (id, smer_id, godina, naziv)
- Tabela `profiles` (id, user_id, ime, fakultet_id, godina, smer_id, uloga, verifikovan, prosecna_ocena)
- Tabela `oglasi` (id, korisnik_id, tip, predmet_id, godina, smer_id, cena, besplatno, opis, slika_url, status, created_at)
- Tabela `trazi_se` (id, korisnik_id, predmet_id, godina, smer_id, created_at), za "Šta mi treba" i matching
- Tabela `ocene` (id, ocenjeni_id, ocenio_id, ocena, komentar, created_at)
- Uključiti Row Level Security (RLS) na svim tabelama

**Rezultat:** Sve tabele postoje u Supabase, sa jasnim relacijama (foreign keys), RLS je uključen.

**Napomena:** RLS je najčešća zamka početnika. Ako ga zaboraviš da podesiš kako treba, ili svi mogu da vide/menjaju tuđe podatke, ili niko ne može da vidi ni svoje. Testiraj upite iz browsera pre nego što nastaviš dalje.

---

### 0.4 Autentifikacija

**Opis:** Pravimo stranice za registraciju i prijavu, povezane sa Supabase Auth.

**Zadaci:**
- `app/registracija/page.tsx`, forma sa email i lozinka
- `app/prijava/page.tsx`, forma za login
- Middleware za zaštitu ruta koje zahtevaju login (`middleware.ts`)
- Dugme za odjavu (logout) u navigaciji

**Rezultat:** Korisnik može da napravi nalog, uloguje se, izloguje se, i pristupa zaštićenim stranicama samo kad je ulogovan.

**Napomena:** U Next.js App Router-u lako se pomeša sesija između server i client komponenti. Koristi `@supabase/ssr` tačno po njihovoj dokumentaciji, ne mešaj stari `supabase-js` auth pristup sa novim.

---

### 0.5 Osnovni izgled sajta

**Opis:** Pravimo zajednički layout (navigacija, footer) i primenjujemo dizajn sistem, da svaka sledeća stranica izgleda ujednačeno.

**Zadaci:**
- `app/layout.tsx`, globalni layout sa navigacijom
- `components/Navbar.tsx`, `components/Footer.tsx`
- Podesiti boje i font u `tailwind.config.ts` prema dizajn sistemu (vidi sekciju niže)
- Napraviti osnovne shadcn komponente koje će se ponavljati: `Button`, `Card`, `Input`, `Select`

**Rezultat:** Sajt ima konzistentan izgled na svim stranicama, navigacija radi, dizajn sistem je primenjen kroz Tailwind konfiguraciju.

---

### 0.6 Deploy na Vercel

**Opis:** Postavljamo prvu, praznu verziju sajta online, da od početka imamo radni pipeline za svaku sledeću izmenu.

**Zadaci:**
- Povezati GitHub repozitorijum sa Vercel nalogom
- Dodati environment varijable (Supabase URL i key) u Vercel Project Settings
- Pokrenuti prvi deploy i proveriti da sajt radi na produkciji

**Rezultat:** Sajt je dostupan na javnom linku (npr. `tvoj-projekat.vercel.app`), svaki novi push na `main` granu automatski ažurira sajt.

**Napomena:** Najčešća greška je da sve radi lokalno, a na Vercel-u puca, jer environment varijable nisu dodate na Vercel-u posebno. `.env.local` se ne prenosi automatski.

---

## FAZA 1: MVP (srž)

Najmanja verzija koja rešava glavni problem: povezivanje ponude i potražnje umesto Viber grupe.

### 1.1 Onboarding profila

**Opis:** Posle registracije, korisnik bira šta želi da radi (kupuje, prodaje, ili oboje) i popunjava osnovne podatke o sebi.

**Zadaci:**
- `app/onboarding/page.tsx`, koraci: uloga, fakultet, godina, smer
- Čuvanje odgovora u tabelu `profiles`
- Redirect na onboarding ako korisnik nema popunjen profil

**Rezultat:** Svaki novi korisnik ima kompletan profil (uloga, fakultet, godina, smer) pre nego što počne da koristi platformu.

---

### 1.2 Kreiranje oglasa

**Opis:** Prodavac postavlja oglas za knjigu ili materijal, uz sliku, cenu i osnovne podatke.

**Zadaci:**
- `app/oglasi/novi/page.tsx`, forma: tip, predmet, godina, smer, cena (ili besplatno), opis, slika
- Upload slike u Supabase Storage bucket `oglasi-slike`
- Čuvanje oglasa u tabelu `oglasi`, status "aktivan"

**Rezultat:** Ulogovan korisnik može da postavi oglas sa slikom, oglas se pojavljuje u bazi sa svim podacima.

**Napomena:** Ako Storage bucket ostane privatan, slike se neće prikazivati na sajtu. Za javne slike postavi bucket kao public, ili generiši signed URL ako želiš privatnost.

---

### 1.3 Prikaz oglasa

**Opis:** Pravimo glavnu marketplace stranicu gde se vide svi aktivni oglasi.

**Zadaci:**
- `app/oglasi/page.tsx`, učitavanje svih oglasa sa statusom "aktivan"
- `components/OglasCard.tsx`, kartica sa slikom, nazivom predmeta, cenom, godinom, smerom
- Paginacija ili "učitaj još" kad broj oglasa poraste

**Rezultat:** Svi korisnici, ulogovani i neulogovani, mogu da vide listu aktivnih oglasa.

---

### 1.4 Detalj oglasa

**Opis:** Pojedinačna stranica oglasa sa svim informacijama i mogućnošću kontakta prodavca.

**Zadaci:**
- `app/oglasi/[id]/page.tsx`, prikaz svih podataka o oglasu i prodavcu
- Dugme "Kontaktiraj prodavca" (otvara email ili prikazuje kontakt podatak)
- Link ka javnom profilu prodavca

**Rezultat:** Kupac vidi sve detalje oglasa i ima jasan način da kontaktira prodavca.

---

### 1.5 Filteri

**Opis:** Kupac filtrira oglase po godini, smeru, predmetu, tipu materijala i ceni, umesto da skroluje kroz sve.

**Zadaci:**
- `components/FilterBar.tsx`, kontrole za sve filtere
- Filtriranje kroz Supabase upit (`.eq()`, `.gte()`, `.lte()`), ne u browseru
- Čuvanje filtera u URL parametrima (da se link može podeliti)

**Rezultat:** Kupac kombinuje filtere i dobija tačno one oglase koji odgovaraju kriterijumima.

**Napomena:** Ako filtriraš tako što prvo učitaš sve oglase pa ih filtriraš u browseru, sajt će usporavati kako broj oglasa raste. Filtriranje uvek radi na bazi.

---

### 1.6 Pretraga

**Opis:** Dodajemo tekstualnu pretragu po nazivu predmeta ili opisu oglasa.

**Zadaci:**
- Polje za pretragu u `FilterBar.tsx`
- Supabase `ilike` upit po nazivu predmeta i opisu
- Kombinovanje pretrage sa postojećim filterima

**Rezultat:** Kupac ukuca "Statistika" i dobija sve relevantne oglase, bez obzira na filtere.

---

### 1.7 Sekcija besplatno

**Opis:** Posebna kategorija za materijale koje studenti dele besplatno, da se ne mešaju sa plaćenim oglasima.

**Zadaci:**
- `app/besplatno/page.tsx`, prikaz samo oglasa gde je `besplatno = true`
- Vizuelno izdvojen tag "BESPLATNO" na kartici oglasa
- Link ka ovoj sekciji u glavnoj navigaciji

**Rezultat:** Postoji posebna stranica koja prikazuje isključivo besplatne materijale.

---

### 1.8 Moj profil

**Opis:** Korisnik upravlja sopstvenim oglasima, menja ih, briše, ili označava kao prodate.

**Zadaci:**
- `app/moj-profil/page.tsx`, lista oglasa ulogovanog korisnika
- Dugmad za izmenu, brisanje i promenu statusa ("prodato")
- Upit filtriran po `korisnik_id` iz trenutne sesije

**Rezultat:** Korisnik vidi i upravlja samo svojim oglasima, ne tuđim.

**Napomena:** Proveri da upit stvarno filtrira po ID-ju ulogovanog korisnika, a ne da učitava sve oglase pa ih "filtrira" vizuelno, jer to znači da korisnik u pozadini ipak vidi tuđe podatke.

---

## FAZA 2: Proširenja i poliranje

Napredne funkcije koje platformu pretvaraju iz oglasnika u pravi matching sistem.

### 2.1 "Šta mi treba" čarobnjak

**Opis:** Kupac umesto pretrage prolazi kroz kratak wizard (godina, smer, predmet) i dobija tačan spisak materijala.

**Zadaci:**
- `app/sta-mi-treba/page.tsx`, koraci: godina, smer, predmet
- Rezultat se prikazuje kroz istu logiku filtera iz koraka 1.5
- Opciono čuvanje pretrage u tabelu `trazi_se`, za matching u sledećem koraku

**Rezultat:** Kupac za par klikova dobija listu tačno onih materijala koji mu trebaju.

---

### 2.2 Matching notifikacije

**Opis:** Prodavac dobija email kad se pojavi kupac koji traži baš njegov predmet.

**Zadaci:**
- API ruta `app/api/matching/route.ts`, poredi nove unose u `trazi_se` sa postojećim oglasima
- Slanje emaila preko Resend kad se pronađe poklapanje
- Prikaz brojača "X studenata trenutno traži ovaj predmet" na oglasu

**Rezultat:** Prodavac dobija obaveštenje kad postoji potencijalni kupac za njegov oglas, bez potrebe za real time sistemom.

**Napomena:** Testiraj ovo sa svojim email adresama pre puštanja uživo, Resend free tier ima dnevni limit slanja, i lako se potroši ako testiraš neoprezno na pravim korisnicima.

---

### 2.3 Sistem ocena i reputacije

**Opis:** Posle dogovorene kupovine, kupac ocenjuje prodavca, čime se gradi poverenje na platformi.

**Zadaci:**
- `components/OcenaForma.tsx`, forma za ocenu (1 do 5) i komentar
- Čuvanje u tabelu `ocene`, povezano sa oglasom i prodavcem
- Automatski izračunata prosečna ocena u `profiles.prosecna_ocena`

**Rezultat:** Svaki prodavac ima vidljivu prosečnu ocenu i broj ocena na svom profilu.

---

### 2.4 Javni profil prodavca

**Opis:** Stranica koja prikazuje istoriju i reputaciju jednog prodavca, da kupac stekne poverenje pre kontakta.

**Zadaci:**
- `app/profil/[id]/page.tsx`, prikaz imena, fakulteta, ocene, broja realizovanih prodaja
- Lista aktivnih oglasa tog prodavca
- Bedž "Verifikovan student" (ručna ili email domen provera)

**Rezultat:** Kupac pre kontakta može da vidi ko je prodavac i kakvo je njegovo dosadašnje iskustvo na platformi.

---

### 2.5 Poliranje UI/UX

**Opis:** Sitni detalji koji sajt čine prijatnijim za korišćenje, posebno važno kad platforma krene da se deli van uskog kruga.

**Zadaci:**
- Loading stanja (skeleton kartice) dok se oglasi učitavaju
- Prazna stanja ("Nema oglasa za ovaj predmet, budi prvi koji će postaviti")
- Animacije iz dizajn sistema (hover, fade in)
- Responsive provera na mobilnom (najveći deo saobraćaja će biti sa telefona)

**Rezultat:** Sajt deluje uglađeno i predvidivo u svim situacijama, ne samo kad sve radi savršeno.

---

### 2.6 Osnovna analitika

**Opis:** Pratimo koliko ljudi koristi platformu i koje su najtraženije kategorije, da znaš da li ima smisla širiti na druge fakultete.

**Zadaci:**
- Dodati Vercel Analytics
- Meta tagovi za deljenje linka (Open Graph slika i opis)
- Jednostavan admin pregled: broj korisnika, broj oglasa, broj prodatih

**Rezultat:** Imaš merljive podatke za odluku o daljem širenju platforme.

---

## Definicija gotovog po fazama

| Faza | Definicija gotovog |
|---|---|
| Faza 0 | Sajt je online na Vercel-u, korisnik se registruje i loguje, dizajn i layout postoje, baza je spremna |
| Faza 1 | Korisnik postavlja oglas, drugi ga pronalaze kroz filtere i pretragu, kontaktiraju prodavca, upravljaju svojim oglasima |
| Faza 2 | Platforma aktivno spaja kupce i prodavce kroz matching, gradi poverenje kroz ocene, i vizuelno je spremna za širu upotrebu |

---

## Mapa stranica i ruta

**Stranice:**
- `/` , početna
- `/registracija` , `/prijava` , prijava korisnika
- `/onboarding` , popuna profila posle registracije
- `/oglasi` , marketplace, lista svih oglasa sa filterima i pretragom
- `/oglasi/[id]` , detalj oglasa
- `/oglasi/novi` , kreiranje oglasa
- `/besplatno` , besplatni materijali
- `/sta-mi-treba` , čarobnjak za pronalaženje materijala
- `/moj-profil` , upravljanje sopstvenim oglasima
- `/profil/[id]` , javni profil prodavca

**API rute:**
- `POST /api/oglasi` , kreiranje oglasa (ili direktno kroz Supabase client)
- `GET /api/oglasi` , lista oglasa sa filterima (ili direktno kroz Supabase client)
- `POST /api/matching` , poređenje novih upita sa postojećim oglasima i slanje emaila
- `POST /api/ocene` , dodavanje ocene

Napomena: kod Supabase pristupa, većina GET/POST operacija ide direktno kroz Supabase klijent iz komponente, prave API rute prave se samo tamo gde treba dodatna logika (kao kod matchinga).

---

## Dizajn sistem

**Boje:**
- Primarna: indigo `#4F46E5` (dugmad, linkovi, akcenti)
- Uspeh / besplatno: zelena `#22C55E` (tag "BESPLATNO")
- Upozorenje: žuta `#F59E0B` (npr. "poslednji primerak")
- Tekst: skoro crna `#111827`
- Pozadina: bela `#FFFFFF`, sekcije `#F9FAFB`

**Tipografija:**
- Font: Inter (dolazi uz Next.js podrazumevano)
- Naslov (h1): 32px, bold
- Podnaslov (h2): 24px, bold
- Sekcija (h3): 20px, semibold
- Tekst: 16px, regular
- Sitan tekst: 14px, regular

**Senke i oblici:**
- Kartice: `rounded-xl`, `shadow-sm`, na hover `shadow-md`
- Dugmad: `rounded-lg`

**Animacije:**
- Fade in kartica pri učitavanju liste
- Blagi scale (1.02) na hover preko kartice oglasa
- Skeleton loader umesto praznog ekrana dok se podaci učitavaju

---

## Česte greške i rešenja

| Problem | Rešenje |
|---|---|
| RLS blokira upite iako je korisnik ulogovan | Proveri da li policy koristi `auth.uid()` ispravno i da li sesija stvarno postoji na tom mestu (server vs client) |
| Env varijable rade lokalno, ne rade na Vercel-u | Dodaj iste varijable u Vercel Project Settings, Environment Variables, pa ponovo deploy |
| Slike se ne prikazuju posle uploada | Proveri da li je Storage bucket public, ili generiši signed URL za privatni bucket |
| Filteri rade sporo kad oglasa ima puno | Filtriranje uvek radi kroz Supabase upit, nikad učitavanjem svega pa filtriranjem u browseru |
| Email obaveštenja ne stižu | Proveri Resend API key i status domena, imaj u vidu dnevni limit na free planu |
| Korisnik u "Moj profil" vidi tuđe oglase | Proveri da upit filtrira po `korisnik_id` iz sesije, ne po celoj tabeli |
| Dupli nalozi sa istim email om | Uključi email confirmation u Supabase Auth podešavanjima |

---

## Napomene o zavisnostima

- Sve u Fazi 1 zavisi od završene Faze 0, posebno baze (0.3) i login sistema (0.4)
- 1.2 (kreiranje oglasa) mora biti gotovo pre 1.3 i 1.4, bez podataka nema šta da se prikaže
- 1.5 i 1.6 (filteri i pretraga) zavise od 1.3, mora postojati lista oglasa da bi se filtrirala
- 2.1 ("Šta mi treba") zavisi od 1.5, koristi istu filter logiku
- 2.2 (matching notifikacije) zavisi od 2.1 i od Resend podešavanja iz Faze 0
- 2.3 (ocene) zavisi od 1.4, mora postojati kontakt sa prodavcem da bi kupovina uopšte mogla da se dogodi
- 2.4 (javni profil) zavisi od 2.3, prikazuje podatke koje 2.3 generiše