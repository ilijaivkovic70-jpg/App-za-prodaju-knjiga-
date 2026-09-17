-- 0005_matching.sql
-- Priprema za korak 2.2 (matching notifikacije i brojač potražnje).
-- Pokreni posle 0001-0004.

-- ============================================================
-- BROJ AKTIVNIH POTRAGA ZA PREDMET
-- ============================================================
-- trazi_se ima RLS koji dozvoljava select samo sopstvenih redova, a brojač
-- "X studenata traži ovaj predmet" treba da bude vidljiv svima na oglasu,
-- bez otkrivanja ko su ti studenti. Zato security definer i vraćamo samo broj.

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
    and smer_id = p_smer_id;
$$;

revoke all on function broj_trazenja(uuid, smallint, uuid) from public;
grant execute on function broj_trazenja(uuid, smallint, uuid) to anon, authenticated;

-- ============================================================
-- PRONALAŽENJE OGLASA KOJI ODGOVARAJU NOVOJ POTRAZI
-- ============================================================
-- Koristi je /api/matching da pronađe prodavce koje treba obavestiti.
-- Email prodavca živi u auth.users, van dohvata RLS-a, zato security definer.

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
    and o.smer_id = p_smer_id
    and o.status = 'aktivan'
    and o.korisnik_id <> p_trazi_korisnik_id;
$$;

revoke all on function pronadji_match_oglase(uuid, smallint, uuid, uuid) from public;
grant execute on function pronadji_match_oglase(uuid, smallint, uuid, uuid) to authenticated;
