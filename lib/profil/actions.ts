"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type OnboardingRezultat = { error: string } | undefined;

const DOZVOLJENE_ULOGE = ["kupac", "prodavac", "oba"] as const;

export async function sacuvajProfil(
  formData: FormData
): Promise<OnboardingRezultat> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/prijava");
  }

  const ime = String(formData.get("ime") ?? "").trim();
  const uloga = String(formData.get("uloga") ?? "");
  const fakultetId = String(formData.get("fakultet_id") ?? "");
  const smerId = String(formData.get("smer_id") ?? "");
  const godinaRaw = String(formData.get("godina") ?? "");
  const godina = Number(godinaRaw);

  if (!ime) {
    return { error: "Ime je obavezno." };
  }
  if (!DOZVOLJENE_ULOGE.includes(uloga as (typeof DOZVOLJENE_ULOGE)[number])) {
    return { error: "Izaberi ulogu." };
  }
  if (!fakultetId) {
    return { error: "Izaberi fakultet." };
  }
  if (!godinaRaw || Number.isNaN(godina) || godina < 1 || godina > 6) {
    return { error: "Izaberi godinu studija." };
  }

  const { error } = await supabase.from("profiles").insert({
    user_id: user.id,
    ime,
    uloga,
    fakultet_id: fakultetId,
    smer_id: smerId || null,
    godina,
  });

  if (error) {
    return { error: "Došlo je do greške pri čuvanju profila. Pokušajte ponovo." };
  }

  revalidatePath("/", "layout");
  redirect("/");
}
