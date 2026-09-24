-- 0012_poruke_reakcije_push.sql
-- Odgovor na poruku (reply), emoji reakcije i web push obaveštenja.
-- Pokreni posle 0001-0011, u Supabase Dashboard -> SQL Editor.

-- ============================================================
-- REPLY
-- ============================================================
alter table poruke
  add column odgovor_na_id uuid references poruke (id) on delete set null;

-- ============================================================
-- REAKCIJE
-- ============================================================
create table poruke_reakcije (
  id uuid primary key default gen_random_uuid(),
  poruka_id uuid not null references poruke (id) on delete cascade,
  korisnik_id uuid not null references auth.users (id) on delete cascade,
  emoji text not null check (char_length(emoji) between 1 and 16),
  created_at timestamptz not null default now(),
  unique (poruka_id, korisnik_id, emoji)
);

create index poruke_reakcije_poruka_idx on poruke_reakcije (poruka_id);

alter table poruke_reakcije enable row level security;

-- Reakcije vide samo učesnici konverzacije (RLS nad `poruke` se primenjuje u podupitu).
create policy "reakcije_select_ucesnici"
  on poruke_reakcije for select
  using (exists (select 1 from poruke p where p.id = poruka_id));

create policy "reakcije_insert_sopstvene"
  on poruke_reakcije for insert
  with check (
    auth.uid() = korisnik_id
    and exists (select 1 from poruke p where p.id = poruka_id)
  );

create policy "reakcije_delete_sopstvene"
  on poruke_reakcije for delete
  using (auth.uid() = korisnik_id);

alter table poruke_reakcije replica identity full;
alter publication supabase_realtime add table poruke_reakcije;

-- ============================================================
-- PUSH PRETPLATE
-- ============================================================
create table push_pretplate (
  id uuid primary key default gen_random_uuid(),
  korisnik_id uuid not null references auth.users (id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);

create index push_pretplate_korisnik_idx on push_pretplate (korisnik_id);

alter table push_pretplate enable row level security;

create policy "push_select_sopstvene"
  on push_pretplate for select using (auth.uid() = korisnik_id);
create policy "push_insert_sopstvene"
  on push_pretplate for insert with check (auth.uid() = korisnik_id);
create policy "push_update_sopstvene"
  on push_pretplate for update
  using (auth.uid() = korisnik_id) with check (auth.uid() = korisnik_id);
create policy "push_delete_sopstvene"
  on push_pretplate for delete using (auth.uid() = korisnik_id);

-- Pošiljalac mora da pročita pretplate primaoca da bi poslao push, a RLS to
-- blokira. Funkcija vraća pretplate samo korisniku kome je pozivalac poslao
-- poruku (nema drugog načina da se dođe do tuđeg endpointa).
create or replace function pretplate_primaoca(p_primalac_id uuid)
returns table (endpoint text, p256dh text, auth text)
language sql
stable
security definer
set search_path = public
as $$
  select s.endpoint, s.p256dh, s.auth
  from push_pretplate s
  where s.korisnik_id = p_primalac_id
    and exists (
      select 1 from poruke p
      where p.posiljalac_id = auth.uid() and p.primalac_id = p_primalac_id
    );
$$;

-- Čišćenje isteklih pretplata (push servis vratio 404/410), pod istim uslovom.
create or replace function ukloni_nevazecu_pretplatu(p_endpoint text)
returns void
language sql
security definer
set search_path = public
as $$
  delete from push_pretplate s
  where s.endpoint = p_endpoint
    and exists (
      select 1 from poruke p
      where p.posiljalac_id = auth.uid() and p.primalac_id = s.korisnik_id
    );
$$;

grant execute on function pretplate_primaoca(uuid) to authenticated;
grant execute on function ukloni_nevazecu_pretplatu(text) to authenticated;
