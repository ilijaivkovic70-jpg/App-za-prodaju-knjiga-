-- 0015_pravni_fakultet.sql
-- Nova sekcija: Pravni fakultet Univerziteta u Beogradu.
-- Osnovne akademske studije imaju jedan studijski program (Pravo, 4 godine,
-- 240 ESPB). Nastavne grupe iz 3. i 4. godine nisu ubačene kao smerovi jer
-- im imena nisu potvrđena; dodaju se kasnije istim obrascem.
-- Izvor: https://ius.bg.ac.rs (Osnovne akademske studije)
-- Pokreni posle 0014.

insert into fakulteti (naziv)
values ('Pravni fakultet Beograd')
on conflict (naziv) do nothing;

insert into smerovi (fakultet_id, naziv)
select f.id, 'Pravo'
from fakulteti f
where f.naziv = 'Pravni fakultet Beograd'
  and not exists (
    select 1 from smerovi x where x.fakultet_id = f.id and x.naziv = 'Pravo'
  );
