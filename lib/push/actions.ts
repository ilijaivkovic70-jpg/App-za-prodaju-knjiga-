"use server";

import { createClient } from "@/lib/supabase/server";

type PretplataJSON = { endpoint: string; keys: { p256dh: string; auth: string } };

export async function sacuvajPretplatu(pretplata: PretplataJSON) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Nisi prijavljen." };

  if (!pretplata?.endpoint || !pretplata.keys?.p256dh || !pretplata.keys?.auth) {
    return { error: "Neispravna pretplata." };
  }

  // Isti uređaj može promeniti vlasnika (druga prijava), pa upsert po endpointu.
  const { error } = await supabase.from("push_pretplate").upsert(
    {
      korisnik_id: user.id,
      endpoint: pretplata.endpoint,
      p256dh: pretplata.keys.p256dh,
      auth: pretplata.keys.auth,
    },
    { onConflict: "endpoint" }
  );
  if (error) return { error: "Čuvanje obaveštenja nije uspelo." };
  return { success: true as const };
}

export async function ukloniPretplatu(endpoint: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Nisi prijavljen." };

  await supabase
    .from("push_pretplate")
    .delete()
    .eq("korisnik_id", user.id)
    .eq("endpoint", endpoint);
  return { success: true as const };
}
