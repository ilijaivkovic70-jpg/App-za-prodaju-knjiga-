-- 0007_pojednostavljenje_oglasa.sql
-- Pojednostavljenje forme za oglase: slobodan naziv umesto obavezne veze na
-- predmet, smer i predmet postaju opcioni, dodat tip "komplet" za prodaju
-- više knjiga u jednom oglasu.
-- Pokreni posle 0001-0006, u Supabase Dashboard -> SQL Editor.

-- ============================================================
-- NOVA KOLONA: naziv (slobodan tekst)
-- ============================================================

alter table oglasi add column if not exists naziv text;

-- Backfill postojećih oglasa nazivom povezanog predmeta.
update oglasi o
set naziv = p.naziv
from predmeti p
where o.predmet_id = p.id
  and o.naziv is null;

-- Sigurnosna mreža za redak slučaj da backfill ne pokrije red.
update oglasi set naziv = 'Materijal' where naziv is null;

alter table oglasi alter column naziv set not null;

-- ============================================================
-- SMER I PREDMET POSTAJU OPCIONI
-- ============================================================

alter table oglasi alter column predmet_id drop not null;
alter table oglasi alter column smer_id drop not null;

-- ============================================================
-- NOVI TIP: komplet (komplet knjiga)
-- ============================================================

alter type oglas_tip add value if not exists 'komplet';
