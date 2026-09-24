-- 0014_masinski_smerovi.sql
-- Ispravka smerova Mašinskog fakulteta. Na osnovnim akademskim studijama
-- (3 godine, 180 ESPB, akreditacija 2019) postoje samo dva studijska
-- programa; ostali "moduli" pripadaju master studijama. Izvor:
-- https://www.mas.bg.ac.rs/en/studije/oas/start
-- Pokreni posle 0013.

insert into smerovi (fakultet_id, naziv)
select f.id, s.naziv
from fakulteti f
cross join (
  values
    ('Mašinsko inženjerstvo'),
    ('Informacione tehnologije u mašinstvu')
) as s (naziv)
where f.naziv = 'Mašinski fakultet Beograd'
  and not exists (
    select 1 from smerovi x where x.fakultet_id = f.id and x.naziv = s.naziv
  );

-- Uklanja okvirne smerove iz 0013, ali samo one koje niko još ne koristi.
delete from smerovi s
using fakulteti f
where s.fakultet_id = f.id
  and f.naziv = 'Mašinski fakultet Beograd'
  and s.naziv not in ('Mašinsko inženjerstvo', 'Informacione tehnologije u mašinstvu')
  and not exists (select 1 from oglasi where smer_id = s.id)
  and not exists (select 1 from profiles where smer_id = s.id)
  and not exists (select 1 from predmeti where smer_id = s.id)
  and not exists (select 1 from trazi_se where smer_id = s.id);
