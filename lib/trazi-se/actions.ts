"use server";

import { createClient } from "@/lib/supabase/server";

export async function sacuvajPotragu(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const smerId = String(formData.get("smer_id") ?? "");
  const godinaRaw = String(formData.get("godina") ?? "");
  const godina = Number(godinaRaw);
  const predmetId = String(formData.get("predmet_id") ?? "");

  if (!smerId || !predmetId || !godinaRaw || Number.isNaN(godina)) return;

  await supabase.from("trazi_se").insert({
    korisnik_id: user.id,
    predmet_id: predmetId,
    godina,
    smer_id: smerId,
  });
}
