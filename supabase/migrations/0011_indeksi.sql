-- 0011_indeksi.sql
-- Indeksi za kolone po kojima se najčešće filtrira/sortira. Bez njih Postgres
-- radi sequential scan cele tabele, što postaje sve sporije kako raste broj
-- korisnika i oglasa.
-- Pokreni posle 0001-0010, u Supabase Dashboard -> SQL Editor.

-- Lista oglasa: "status = aktivan" pa sortiranje po created_at (i obrnuto).
create index if not exists oglasi_status_created_at_idx
  on oglasi (status, created_at desc);

-- Moj profil / javni profil: svi oglasi jednog korisnika.
create index if not exists oglasi_korisnik_id_idx
  on oglasi (korisnik_id);

-- Filteri i matching po predmetu/smeru.
create index if not exists oglasi_predmet_id_idx
  on oglasi (predmet_id);

create index if not exists oglasi_smer_id_idx
  on oglasi (smer_id);

-- Poruke: inbox, nit konverzacije i brojač nepročitanih.
create index if not exists poruke_oglas_id_idx
  on poruke (oglas_id);

create index if not exists poruke_primalac_procitano_idx
  on poruke (primalac_id, procitano);

create index if not exists poruke_posiljalac_id_idx
  on poruke (posiljalac_id);

-- Ocene: prosečna ocena i broj ocena po korisniku.
create index if not exists ocene_ocenjeni_id_idx
  on ocene (ocenjeni_id);

-- "Šta mi treba" i matching notifikacije.
create index if not exists trazi_se_predmet_godina_smer_idx
  on trazi_se (predmet_id, godina, smer_id);

create index if not exists trazi_se_korisnik_id_idx
  on trazi_se (korisnik_id);
