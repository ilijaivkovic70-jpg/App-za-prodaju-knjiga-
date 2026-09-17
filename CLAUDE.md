# CLAUDE.md

Ovaj fajl daje kontekst za rad na projektu. Pročitaj ga pre nego što počneš bilo šta da praviš u ovom repozitorijumu.

## O projektu

Studentska platforma za kupovinu i prodaju polovnih udžbenika i materijala (skripte, beleške, zbirke). Rešava problem što se ovakva prodaja trenutno odvija neorganizovano u Viber grupama, gde se oglasi gube i teško je pronaći konkretnu stvar.

Cilj: povezati ponudu i potražnju kroz filtere, pretragu i matching, umesto beskonačnog skrolovanja poruka.

Fokus grupa: studenti Ekonomskog fakulteta u Beogradu, uz plan širenja na druge fakultete posle validacije.

Ključni koncepti u domenu:
- Oglas: knjiga, skripta, beleške, zbirka zadataka ili ostalo, vezan za konkretan predmet, godinu i smer
- Besplatno: posebna kategorija oglasa bez cene
- Matching: aktivno povezivanje prodavca sa studentima koji traže baš njegov predmet
- Reputacija: ocene posle transakcije, gradi poverenje između studenata koji se ne poznaju

## Tech stack

- Next.js (App Router, TypeScript)
- Supabase: Postgres baza, Auth, Storage
- Tailwind CSS
- shadcn/ui za UI komponente
- Resend za email obaveštenja
- Vercel za hosting i deploy

Ne koristimo posebnu integraciju plaćanja, kontakt i dogovor idu direktno između kupca i prodavca van platforme.

## Konvencije koda

- Server komponente su podrazumevane, `"use client"` samo kad je stvarno potrebno (forme, interaktivnost)
- Supabase klijent: `lib/supabase/server.ts` u server komponentama i API rutama, `lib/supabase/client.ts` u client komponentama, ne mešati
- Filtriranje i pretraga uvek idu kroz Supabase upit (`.eq()`, `.ilike()`, itd), nikad učitavanje svega pa filtriranje u JavaScript-u
- API rute (`app/api/...`) pravimo samo tamo gde treba dodatna logika (npr. matching, slanje email a), obična čitanja i upisi idu direktno kroz Supabase klijent iz komponente
- Svaki upit nad korisnikovim podacima (npr. "moji oglasi") mora da filtrira po `korisnik_id` iz trenutne sesije, ne da učitava sve pa filtrira na frontu

## Struktura baze podataka

- `fakulteti` (id, naziv)
- `smerovi` (id, fakultet_id, naziv)
- `predmeti` (id, smer_id, godina, naziv)
- `profiles` (id, user_id, ime, fakultet_id, godina, smer_id, uloga, verifikovan, prosecna_ocena)
- `oglasi` (id, korisnik_id, tip, predmet_id, godina, smer_id, cena, besplatno, opis, slika_url, status, created_at)
- `trazi_se` (id, korisnik_id, predmet_id, godina, smer_id, created_at), koristi se za "Šta mi treba" i matching
- `ocene` (id, ocenjeni_id, ocenio_id, ocena, komentar, created_at)

RLS (Row Level Security) je uključen na svim tabelama. Pri pisanju policy pravila uvek proveriti `auth.uid()` i testirati upit iz browsera, ne samo iz Supabase admin panela.

## Mapa stranica i ruta

Stranice:
- `/` , početna
- `/registracija` , `/prijava`
- `/onboarding` , popuna profila posle registracije (uloga, fakultet, godina, smer)
- `/oglasi` , marketplace, lista oglasa sa filterima i pretragom
- `/oglasi/[id]` , detalj oglasa
- `/oglasi/novi` , kreiranje oglasa
- `/besplatno` , besplatni materijali
- `/sta-mi-treba` , čarobnjak za pronalaženje materijala po godini/smeru/predmetu
- `/moj-profil` , upravljanje sopstvenim oglasima
- `/profil/[id]` , javni profil prodavca sa ocenama

API rute:
- `POST /api/matching` , poredi nove unose u `trazi_se` sa postojećim oglasima i šalje email preko Resend
- `POST /api/ocene` , dodavanje ocene (ako logika prevazilazi običan insert)

## Dizajn sistem

Boje:
- Primarna: `#4F46E5` (indigo), dugmad i linkovi
- Besplatno / uspeh: `#22C55E` (zelena)
- Upozorenje: `#F59E0B` (žuta)
- Tekst: `#111827`
- Pozadina: `#FFFFFF`, sekcije `#F9FAFB`

Tipografija: Inter font. h1 32px bold, h2 24px bold, h3 20px semibold, tekst 16px regular, sitan tekst 14px.

Kartice: `rounded-xl`, `shadow-sm` (hover `shadow-md`). Dugmad: `rounded-lg`.

Animacije: fade in za liste, blagi scale (1.02) na hover preko kartice oglasa, skeleton loader dok se podaci učitavaju.

## Faze razvoja

- Faza 0 (temelj): skelet projekta, Supabase, autentifikacija, osnovni layout, deploy
- Faza 1 (MVP): kreiranje i prikaz oglasa, filteri, pretraga, besplatna sekcija, moj profil
- Faza 2 (proširenja): "Šta mi treba", matching notifikacije, ocene, javni profil, poliranje UI, analitika

Trenutna faza i detaljan raspored koraka: `plan-implementacije-studentska-platforma.md`. Ne preskakati fazu 0 ni raditi Fazu 2 pre nego što je Faza 1 gotova.

## Poznate zamke

- RLS policy može da blokira legitimne upite ili da pusti tuđe podatke, uvek testirati iz browsera, ne samo iz admin panela
- Environment varijable rade lokalno, ali ne rade na Vercel-u dok se ručno ne dodaju u Project Settings
- Supabase Storage bucket mora biti public da bi se slike prikazale, ili koristiti signed URL za privatan bucket
- Resend free tier ima dnevni limit slanja, ne testirati matching notifikacije masovno na pravim korisnicima
- Email confirmation mora biti uključen u Supabase Auth da bi se izbegli dupli nalozi sa istim email om

## Komande

- `npm run dev` , lokalni development server
- `npm run build` , produkcioni build
- `npm run lint` , provera koda
