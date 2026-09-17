-- 0002_seed.sql
-- Seed podaci: fakultet i smerovi (moduli).
-- Pokreni posle 0001_schema.sql.
--
-- Lista modula preuzeta sa zvaničnog sajta ekof.bg.ac.rs (stranice
-- "Osnovne studije" i "Studijski programi"), septembar 2026. Ovo su moduli
-- koji se biraju od četvrtog semestra na osnovnim akademskim studijama.

insert into fakulteti (naziv)
values ('Ekonomski fakultet Beograd');

insert into smerovi (fakultet_id, naziv)
select f.id, s.naziv
from fakulteti f
cross join (
  values
    ('Ekonomija i finansije'),
    ('Ekonomska analiza i politika'),
    ('Marketing'),
    ('Menadžment'),
    ('Menadžment u turizmu i hotelijerstvu'),
    ('Međunarodna ekonomija i spoljna trgovina'),
    ('Poslovna analiza i konsalting'),
    ('Poslovna informatika'),
    ('Primenjena statistika i kvantitativna analiza'),
    ('Računovodstvo, revizija i finansijsko upravljanje'),
    ('Trgovinski menadžment i marketing'),
    ('Finansije, bankarstvo i osiguranje')
) as s (naziv)
where f.naziv = 'Ekonomski fakultet Beograd';
