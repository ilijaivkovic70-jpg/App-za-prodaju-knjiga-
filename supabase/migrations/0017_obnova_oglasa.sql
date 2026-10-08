-- 0017_obnova_oglasa.sql
-- Omogućava "obnavljanje" oglasa (vraćanje na vrh liste) bez diranja created_at,
-- koji ostaje kao datum prvog postavljanja. Pokreni posle 0016.

alter table oglasi add column if not exists obnovljeno_at timestamptz;

update oglasi set obnovljeno_at = created_at where obnovljeno_at is null;

alter table oglasi alter column obnovljeno_at set default now();
alter table oglasi alter column obnovljeno_at set not null;

create index if not exists oglasi_obnovljeno_at_idx on oglasi (obnovljeno_at desc);
