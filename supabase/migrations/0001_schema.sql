-- 0001_schema.sql
-- Šema baze za studentsku platformu za kupovinu i prodaju materijala.
-- Pokreni ovaj fajl u Supabase Dashboard -> SQL Editor, pre 0002_seed.sql.

-- ============================================================
-- ENUM TIPOVI
-- ============================================================

create type uloga_tip as enum ('kupac', 'prodavac', 'oba');

create type oglas_tip as enum ('knjiga', 'skripta', 'beleske', 'zbirka', 'ostalo');

create type oglas_status as enum ('aktivan', 'prodato', 'neaktivan');

-- ============================================================
-- FAKULTETI
-- ============================================================

create table fakulteti (
  id uuid primary key default gen_random_uuid(),
  naziv text not null unique
);

alter table fakulteti enable row level security;

create policy "fakulteti_select_svi"
  on fakulteti for select
  using (true);

-- ============================================================
-- SMEROVI
-- ============================================================

create table smerovi (
  id uuid primary key default gen_random_uuid(),
  fakultet_id uuid not null references fakulteti (id) on delete cascade,
  naziv text not null
);

alter table smerovi enable row level security;

create policy "smerovi_select_svi"
  on smerovi for select
  using (true);

-- ============================================================
-- PREDMETI
-- ============================================================

create table predmeti (
  id uuid primary key default gen_random_uuid(),
  smer_id uuid not null references smerovi (id) on delete cascade,
  godina smallint not null check (godina between 1 and 6),
  naziv text not null
);

alter table predmeti enable row level security;

create policy "predmeti_select_svi"
  on predmeti for select
  using (true);

-- ============================================================
-- PROFILES
-- ============================================================

create table profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  ime text not null,
  fakultet_id uuid references fakulteti (id),
  godina smallint check (godina between 1 and 6),
  smer_id uuid references smerovi (id),
  uloga uloga_tip not null default 'oba',
  verifikovan boolean not null default false,
  prosecna_ocena numeric(3, 2)
);

alter table profiles enable row level security;

create policy "profiles_select_svi"
  on profiles for select
  using (true);

create policy "profiles_insert_sopstveni"
  on profiles for insert
  with check (auth.uid() = user_id);

create policy "profiles_update_sopstveni"
  on profiles for update
  using (auth.uid() = user_id);

-- ============================================================
-- OGLASI
-- ============================================================

create table oglasi (
  id uuid primary key default gen_random_uuid(),
  korisnik_id uuid not null references auth.users (id) on delete cascade,
  tip oglas_tip not null,
  predmet_id uuid not null references predmeti (id),
  godina smallint not null check (godina between 1 and 6),
  smer_id uuid not null references smerovi (id),
  cena numeric(10, 2),
  besplatno boolean not null default false,
  opis text,
  slika_url text,
  status oglas_status not null default 'aktivan',
  created_at timestamptz not null default now()
);

alter table oglasi enable row level security;

create policy "oglasi_select_svi"
  on oglasi for select
  using (true);

create policy "oglasi_insert_sopstveni"
  on oglasi for insert
  with check (auth.uid() = korisnik_id);

create policy "oglasi_update_sopstveni"
  on oglasi for update
  using (auth.uid() = korisnik_id);

create policy "oglasi_delete_sopstveni"
  on oglasi for delete
  using (auth.uid() = korisnik_id);

-- ============================================================
-- TRAZI_SE
-- ============================================================

create table trazi_se (
  id uuid primary key default gen_random_uuid(),
  korisnik_id uuid not null references auth.users (id) on delete cascade,
  predmet_id uuid not null references predmeti (id),
  godina smallint not null check (godina between 1 and 6),
  smer_id uuid not null references smerovi (id),
  created_at timestamptz not null default now()
);

alter table trazi_se enable row level security;

create policy "trazi_se_select_sopstveni"
  on trazi_se for select
  using (auth.uid() = korisnik_id);

create policy "trazi_se_insert_sopstveni"
  on trazi_se for insert
  with check (auth.uid() = korisnik_id);

create policy "trazi_se_update_sopstveni"
  on trazi_se for update
  using (auth.uid() = korisnik_id);

create policy "trazi_se_delete_sopstveni"
  on trazi_se for delete
  using (auth.uid() = korisnik_id);

-- ============================================================
-- OCENE
-- ============================================================

create table ocene (
  id uuid primary key default gen_random_uuid(),
  ocenjeni_id uuid not null references auth.users (id) on delete cascade,
  ocenio_id uuid not null references auth.users (id) on delete cascade,
  ocena smallint not null check (ocena between 1 and 5),
  komentar text,
  created_at timestamptz not null default now()
);

alter table ocene enable row level security;

create policy "ocene_select_svi"
  on ocene for select
  using (true);

create policy "ocene_insert_sopstvene"
  on ocene for insert
  with check (auth.uid() = ocenio_id);
