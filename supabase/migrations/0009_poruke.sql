-- 0009_poruke.sql
-- Chat u aplikaciji: kupac i prodavac se dogovaraju direktno kroz platformu,
-- bez prelaska na mail ili drugu aplikaciju.
-- Pokreni posle 0001-0008, u Supabase Dashboard -> SQL Editor.

create table poruke (
  id uuid primary key default gen_random_uuid(),
  oglas_id uuid not null references oglasi (id) on delete cascade,
  posiljalac_id uuid not null references auth.users (id) on delete cascade,
  primalac_id uuid not null references auth.users (id) on delete cascade,
  sadrzaj text not null,
  procitano boolean not null default false,
  created_at timestamptz not null default now()
);

alter table poruke enable row level security;

create policy "poruke_select_ucesnici"
  on poruke for select
  using (auth.uid() = posiljalac_id or auth.uid() = primalac_id);

create policy "poruke_insert_sopstvene"
  on poruke for insert
  with check (auth.uid() = posiljalac_id and posiljalac_id <> primalac_id);

create policy "poruke_update_primalac"
  on poruke for update
  using (auth.uid() = primalac_id)
  with check (auth.uid() = primalac_id);

-- Realtime: nove poruke stižu uživo bez ručnog osvežavanja stranice.
alter publication supabase_realtime add table poruke;

-- ============================================================
-- PREGLED KONVERZACIJA (za /poruke inbox)
-- ============================================================
-- Grupiše poruke po (oglas, sagovornik) i vraća poslednju poruku i broj
-- nepročitanih. RLS nad `poruke` se i dalje primenjuje (obična funkcija,
-- ne security definer), pa svako vidi samo svoje konverzacije.

create or replace function moje_konverzacije()
returns table (
  oglas_id uuid,
  sagovornik_id uuid,
  poslednja_poruka text,
  poslednje_vreme timestamptz,
  nije_procitano bigint
)
language sql
stable
set search_path = public
as $$
  with moje as (
    select
      p.oglas_id,
      case when p.posiljalac_id = auth.uid() then p.primalac_id else p.posiljalac_id end as sagovornik_id,
      p.sadrzaj,
      p.created_at,
      p.procitano,
      p.primalac_id
    from poruke p
    where p.posiljalac_id = auth.uid() or p.primalac_id = auth.uid()
  ),
  poslednje as (
    select distinct on (oglas_id, sagovornik_id)
      oglas_id, sagovornik_id, sadrzaj as poslednja_poruka, created_at as poslednje_vreme
    from moje
    order by oglas_id, sagovornik_id, created_at desc
  ),
  nepr as (
    select oglas_id, sagovornik_id, count(*) as nije_procitano
    from moje
    where procitano = false and primalac_id = auth.uid()
    group by oglas_id, sagovornik_id
  )
  select pl.oglas_id, pl.sagovornik_id, pl.poslednja_poruka, pl.poslednje_vreme,
         coalesce(n.nije_procitano, 0) as nije_procitano
  from poslednje pl
  left join nepr n on n.oglas_id = pl.oglas_id and n.sagovornik_id = pl.sagovornik_id
  order by pl.poslednje_vreme desc;
$$;

grant execute on function moje_konverzacije() to authenticated;
