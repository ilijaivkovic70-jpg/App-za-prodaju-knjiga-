-- 0010_telefon_profila.sql
-- Opcioni broj telefona u profilu, prikazuje se u opisu javnog profila.
-- Pokreni posle 0001-0009, u Supabase Dashboard -> SQL Editor.

alter table profiles add column if not exists telefon text;
