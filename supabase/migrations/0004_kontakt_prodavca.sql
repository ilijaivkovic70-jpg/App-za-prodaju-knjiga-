-- 0004_kontakt_prodavca.sql
-- Priprema za korak 1.4 (detalj oglasa): dugme "Kontaktiraj prodavca" treba
-- email prodavca, koji se ne čuva u profiles nego u auth.users, pa nije
-- direktno dostupan kroz RLS. Funkcija ispod vraća email samo ulogovanim
-- korisnicima i samo za postojeći oglas (ne po proizvoljnom user_id-u),
-- da se onemogući enumeracija email adresa.

create or replace function email_prodavca(oglas_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  prodavac_id uuid;
  prodavac_email text;
begin
  if auth.uid() is null then
    return null;
  end if;

  select korisnik_id into prodavac_id
  from oglasi
  where id = oglas_id;

  if prodavac_id is null then
    return null;
  end if;

  select email into prodavac_email
  from auth.users
  where id = prodavac_id;

  return prodavac_email;
end;
$$;

revoke all on function email_prodavca(uuid) from public;
grant execute on function email_prodavca(uuid) to authenticated;
