-- 0016_fakulteti_bez_smerova.sql
-- Podrška za fakultete bez smerova (npr. Pravni): predmeti se vezuju direktno
-- za fakultet, a smer u potrazi i matchingu postaje opcion.
-- Pokreni posle 0015.

-- ============================================================
-- PREDMETI.FAKULTET_ID
-- ============================================================

alter table predmeti add column if not exists fakultet_id uuid references fakulteti (id);

update predmeti p
set fakultet_id = s.fakultet_id
from smerovi s
where p.smer_id = s.id and p.fakultet_id is null;

-- Predmeti bez smera (slobodan unos): fakultet oglasa koji ih koristi.
update predmeti p
set fakultet_id = o.fakultet_id
from oglasi o
where o.predmet_id = p.id and p.fakultet_id is null;

update predmeti
set fakultet_id = (select id from fakulteti where naziv = 'Ekonomski fakultet Beograd')
where fakultet_id is null;

alter table predmeti alter column fakultet_id set not null;

create index if not exists predmeti_fakultet_id_idx on predmeti (fakultet_id);

-- ============================================================
-- SMER U POTRAZI I MATCHINGU JE OPCION
-- ============================================================

alter table trazi_se alter column smer_id drop not null;

create or replace function broj_trazenja(
  p_predmet_id uuid,
  p_godina smallint,
  p_smer_id uuid
)
returns bigint
language sql
security definer
set search_path = public
as $$
  select count(*)
  from trazi_se
  where predmet_id = p_predmet_id
    and godina = p_godina
    and smer_id is not distinct from p_smer_id;
$$;

create or replace function pronadji_match_oglase(
  p_predmet_id uuid,
  p_godina smallint,
  p_smer_id uuid,
  p_trazi_korisnik_id uuid
)
returns table (
  oglas_id uuid,
  prodavac_id uuid,
  prodavac_email text,
  predmet_naziv text
)
language sql
security definer
set search_path = public
as $$
  select o.id, o.korisnik_id, u.email, p.naziv
  from oglasi o
  join auth.users u on u.id = o.korisnik_id
  join predmeti p on p.id = o.predmet_id
  where o.predmet_id = p_predmet_id
    and o.godina = p_godina
    and o.smer_id is not distinct from p_smer_id
    and o.status = 'aktivan'
    and o.korisnik_id <> p_trazi_korisnik_id;
$$;
