import { cache } from "react";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export const FAKULTET_KOLACIC = "fakultet_id";

export type Fakultet = { id: string; naziv: string };

export const dohvatiFakultete = cache(async (): Promise<Fakultet[]> => {
  const supabase = await createClient();
  const { data } = await supabase.from("fakulteti").select("id, naziv").order("naziv");
  return data ?? [];
});

/**
 * Fakultet čija je sekcija trenutno otvorena. Izbor živi u kolačiću; ako ga
 * nema (ili više ne postoji) koristi se prvi fakultet, tj. Ekonomski.
 */
export const trenutniFakultet = cache(async (): Promise<Fakultet | null> => {
  const [fakulteti, cookieStore] = await Promise.all([dohvatiFakultete(), cookies()]);
  const izabran = cookieStore.get(FAKULTET_KOLACIC)?.value;
  return fakulteti.find((f) => f.id === izabran) ?? fakulteti[0] ?? null;
});
