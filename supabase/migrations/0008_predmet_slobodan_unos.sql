-- 0008_predmet_slobodan_unos.sql
-- Omogućava dodavanje novog predmeta iz forme za oglas i kada smer nije
-- izabran (smer je opcion od migracije 0007).
-- Pokreni posle 0001-0007, u Supabase Dashboard -> SQL Editor.

alter table predmeti alter column smer_id drop not null;
