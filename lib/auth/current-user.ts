import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

/**
 * `supabase.auth.getUser()` zove Supabase Auth server preko mreže (ne čita
 * samo kolačić), pa je skupo pozivati ga više puta u istom renderu — a
 * layout, navbar i sama stranica su ranije svaki zvali posebno. `cache()`
 * dedupe-uje pozive u okviru istog request-a, tako da mreža radi samo jednom.
 */
export const trenutniKorisnik = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});
