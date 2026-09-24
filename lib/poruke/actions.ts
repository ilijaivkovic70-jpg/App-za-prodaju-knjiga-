"use server";

import { redirect } from "next/navigation";
import { after } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { posaljiPush } from "@/lib/push/posalji";

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
  const odgovorNaId = String(formData.get("odgovor_na_id") ?? "").trim() || null;

  if (!oglasId || !primalacId) {
    return { error: "Nedostaju podaci o konverzaciji." };
  }
  if (!sadrzaj) {
    return { error: "Upiši poruku." };
  }
  if (primalacId === user.id) {
    return { error: "Ne možeš poslati poruku samom sebi." };
  }

  if (odgovorNaId) {
    // RLS vraća samo poruke u kojima učestvujem; mora biti ista konverzacija.
    const { data: original } = await supabase
      .from("poruke")
      .select("id")
      .eq("id", odgovorNaId)
      .eq("oglas_id", oglasId)
      .or(`posiljalac_id.eq.${primalacId},primalac_id.eq.${primalacId}`)
      .maybeSingle();
    if (!original) {
      return { error: "Poruka na koju odgovaraš ne postoji." };
    }
  }

  const { error } = await supabase.from("poruke").insert({
    oglas_id: oglasId,
    posiljalac_id: user.id,
    primalac_id: primalacId,
    sadrzaj,
    odgovor_na_id: odgovorNaId,
  });

  if (error) {
    return { error: "Došlo je do greške pri slanju poruke." };
  }

  after(async () => {
    const { data: profil } = await supabase
      .from("profiles")
      .select("ime")
      .eq("user_id", user.id)
      .maybeSingle();
    await posaljiPush(supabase, primalacId, {
      title: profil?.ime ?? "Nova poruka",
      body: sadrzaj.length > 140 ? `${sadrzaj.slice(0, 137)}...` : sadrzaj,
      url: `/poruke/${oglasId}/${user.id}`,
      tag: `poruke-${oglasId}-${user.id}`,
    });
  });

  revalidatePath(`/poruke/${oglasId}/${primalacId}`);
  revalidatePath("/poruke");
  return { success: true };
}
