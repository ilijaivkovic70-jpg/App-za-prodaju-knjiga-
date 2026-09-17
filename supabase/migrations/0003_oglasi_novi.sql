-- 0003_oglasi_novi.sql
-- Priprema za korak 1.2 (kreiranje oglasa): dozvola da ulogovani korisnici
-- dodaju predmet ako ga nema na listi, i Storage bucket za slike oglasa.
-- Pokreni posle 0001_schema.sql i 0002_seed.sql.

-- ============================================================
-- PREDMETI: insert za ulogovane korisnike
-- ============================================================
-- Lista predmeta se organski puni kroz formu za kreiranje oglasa kad
-- korisnik ne pronađe svoj predmet na listi.

drop policy if exists "predmeti_insert_ulogovani" on predmeti;
create policy "predmeti_insert_ulogovani"
  on predmeti for insert
  to authenticated
  with check (true);

-- ============================================================
-- STORAGE: bucket za slike oglasa
-- ============================================================

insert into storage.buckets (id, name, public)
values ('oglasi-slike', 'oglasi-slike', true)
on conflict (id) do nothing;

drop policy if exists "oglasi_slike_select_svi" on storage.objects;
create policy "oglasi_slike_select_svi"
  on storage.objects for select
  using (bucket_id = 'oglasi-slike');

drop policy if exists "oglasi_slike_insert_sopstvene" on storage.objects;
create policy "oglasi_slike_insert_sopstvene"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'oglasi-slike'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "oglasi_slike_delete_sopstvene" on storage.objects;
create policy "oglasi_slike_delete_sopstvene"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'oglasi-slike'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
