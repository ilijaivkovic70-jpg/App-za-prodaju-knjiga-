"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type PorukaRezultat = { error: string } | { success: true };

export async function posaljiPoruku(formData: FormData): Promise<PorukaRezultat> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/prijava");
  }

  const oglasId = String(formData.get("oglas_id") ?? "").trim();
  const primalacId = String(formData.get("primalac_id") ?? "").trim();
  const sadrzaj = String(formData.get("sadrzaj") ?? "").trim();

  if (!oglasId || !primalacId) {
    return { error: "Nedostaju podaci o konverzaciji." };
  }
  if (!sadrzaj) {
    return { error: "Upiši poruku." };
  }
  if (primalacId === user.id) {
    return { error: "Ne možeš poslati poruku samom sebi." };
  }

  const { error } = await supabase.from("poruke").insert({
    oglas_id: oglasId,
    posiljalac_id: user.id,
    primalac_id: primalacId,
    sadrzaj,
  });

  if (error) {
    return { error: "Došlo je do greške pri slanju poruke." };
  }

  revalidatePath(`/poruke/${oglasId}/${primalacId}`);
  revalidatePath("/poruke");
  return { success: true };
}
