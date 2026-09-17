-- 0006_ocene.sql
-- Korak 2.3: sistem ocena i reputacije. Ocena se vezuje za konkretan oglas,
-- kupac ocenjuje prodavca tek pošto je prodavac označio oglas kao "prodato",
-- i prosečna ocena u profiles se automatski preračunava posle svake izmene.

alter table ocene
  add column oglas_id uuid references oglasi (id) on delete cascade;

alter table ocene
  add constraint ocene_jedna_po_oglasu unique (oglas_id, ocenio_id);

alter table ocene
  add constraint ocene_ne_sam_sebe check (ocenjeni_id <> ocenio_id);

-- ============================================================
-- RLS: insert samo ako je oglas prodato, ocenilac nije prodavac,
-- i ocenjeni je zaista prodavac tog oglasa.
-- ============================================================

drop policy if exists "ocene_insert_sopstvene" on ocene;

create policy "ocene_insert_sopstvene"
  on ocene for insert
  with check (
    auth.uid() = ocenio_id
    and exists (
      select 1
      from oglasi
      where oglasi.id = ocene.oglas_id
        and oglasi.status = 'prodato'
        and oglasi.korisnik_id = ocene.ocenjeni_id
        and oglasi.korisnik_id <> auth.uid()
    )
  );

-- ============================================================
-- Automatsko preračunavanje profiles.prosecna_ocena
-- ============================================================

create or replace function azuriraj_prosecnu_ocenu()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  ciljni_id uuid;
begin
  ciljni_id := coalesce(new.ocenjeni_id, old.ocenjeni_id);

  update profiles
  set prosecna_ocena = (
    select avg(ocena)::numeric(3, 2)
    from ocene
    where ocenjeni_id = ciljni_id
  )
  where user_id = ciljni_id;

  return null;
end;
$$;

create trigger ocene_azuriraj_prosek
after insert or update or delete on ocene
for each row
execute function azuriraj_prosecnu_ocenu();
