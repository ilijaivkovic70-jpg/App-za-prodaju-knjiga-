-- 0018_oglas_slike.sql
-- Više slika po oglasu. `oglasi.slika_url` ostaje naslovna slika
-- (koristi se u karticama i listama), a `oglas_slike` čuva ceo
-- redosled slika za prikaz na stranici detalja oglasa.

create table oglas_slike (
  id uuid primary key default gen_random_uuid(),
  oglas_id uuid not null references oglasi (id) on delete cascade,
  url text not null,
  redosled smallint not null default 0,
  created_at timestamptz not null default now()
);

create index oglas_slike_oglas_id_idx on oglas_slike (oglas_id, redosled);

alter table oglas_slike enable row level security;

create policy "oglas_slike_select_svi"
  on oglas_slike for select
  using (true);

create policy "oglas_slike_insert_sopstvene"
  on oglas_slike for insert
  to authenticated
  with check (
    exists (
      select 1 from oglasi
      where oglasi.id = oglas_slike.oglas_id
        and oglasi.korisnik_id = auth.uid()
    )
  );

create policy "oglas_slike_delete_sopstvene"
  on oglas_slike for delete
  to authenticated
  using (
    exists (
      select 1 from oglasi
      where oglasi.id = oglas_slike.oglas_id
        and oglasi.korisnik_id = auth.uid()
    )
  );
