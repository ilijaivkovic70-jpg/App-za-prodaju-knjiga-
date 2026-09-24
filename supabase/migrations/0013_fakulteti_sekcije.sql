-- 0013_fakulteti_sekcije.sql
-- Svaki fakultet je posebna sekcija na istoj platformi: oglasi dobijaju
-- fakultet_id, a korisnik vidi samo oglase izabranog fakulteta.
-- Pokreni posle 0001-0012, u Supabase Dashboard -> SQL Editor.

-- ============================================================
-- OGLASI.FAKULTET_ID
-- ============================================================

alter table oglasi add column if not exists fakultet_id uuid references fakulteti (id);

-- Backfill: prvo preko smera, pa preko profila prodavca, na kraju Ekonomski
-- (do sada je platforma postojala samo za njega).
update oglasi o
set fakultet_id = s.fakultet_id
from smerovi s
where o.smer_id = s.id
  and o.fakultet_id is null;

update oglasi o
set fakultet_id = p.fakultet_id
from profiles p
where p.user_id = o.korisnik_id
  and p.fakultet_id is not null
  and o.fakultet_id is null;

update oglasi
set fakultet_id = (select id from fakulteti where naziv = 'Ekonomski fakultet Beograd')
where fakultet_id is null;

alter table oglasi alter column fakultet_id set not null;

create index if not exists oglasi_fakultet_status_created_at_idx
  on oglasi (fakultet_id, status, created_at desc);

-- ============================================================
-- MAŠINSKI FAKULTET (nova sekcija)
-- ============================================================
-- Lista modula je okvirna, proveri je sa zvaničnim sajtom mas.bg.ac.rs
-- pre puštanja u produkciju.

insert into fakulteti (naziv)
values ('Mašinski fakultet Beograd')
on conflict (naziv) do nothing;

insert into smerovi (fakultet_id, naziv)
select f.id, s.naziv
from fakulteti f
cross join (
  values
    ('Energetika i procesna tehnika'),
    ('Proizvodno mašinstvo'),
    ('Mehanizacija i konstruisanje'),
    ('Motori i motorna vozila'),
    ('Vazduhoplovstvo'),
    ('Mehatronika'),
    ('Upravljanje sistemima'),
    ('Industrijsko inženjerstvo'),
    ('Inženjerstvo zaštite životne sredine')
) as s (naziv)
where f.naziv = 'Mašinski fakultet Beograd'
  and not exists (
    select 1 from smerovi x where x.fakultet_id = f.id and x.naziv = s.naziv
  );
