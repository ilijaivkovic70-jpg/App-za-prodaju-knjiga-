-- 0015_pravni_fakultet.sql
-- Nova sekcija: Pravni fakultet Univerziteta u Beogradu. Nema smerova
-- (studijski program je opšti), pa se dodaje samo fakultet.
-- Pokreni posle 0014, a pre 0016.

insert into fakulteti (naziv)
values ('Pravni fakultet Beograd')
on conflict (naziv) do nothing;

-- Ako je ranija verzija ove migracije već dodala smer "Pravo", ukloni ga.
delete from smerovi s
using fakulteti f
where s.fakultet_id = f.id
  and f.naziv = 'Pravni fakultet Beograd'
  and s.naziv = 'Pravo'
  and not exists (select 1 from oglasi where smer_id = s.id)
  and not exists (select 1 from profiles where smer_id = s.id)
  and not exists (select 1 from predmeti where smer_id = s.id)
  and not exists (select 1 from trazi_se where smer_id = s.id);
