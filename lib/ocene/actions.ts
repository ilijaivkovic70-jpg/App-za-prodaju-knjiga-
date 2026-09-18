"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type OcenaRezultat = { error: string } | { success: true };

export async function sacuvajOcenu(formData: FormData): Promise<OcenaRezultat> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/prijava");
  }

  const oglasId = String(formData.get("oglas_id") ?? "");
  const ocenaRaw = String(formData.get("ocena") ?? "");
  const ocena = Number(ocenaRaw);
  const komentar = String(formData.get("komentar") ?? "").trim();

  if (!oglasId) {
    return { error: "Nedostaje oglas." };
  }
  if (!ocenaRaw || Number.isNaN(ocena) || ocena < 1 || ocena > 5) {
    return { error: "Izaberi ocenu od 1 do 5." };
  }

  const { data: oglas } = await supabase
    .from("oglasi")
    .select("korisnik_id, status")
    .eq("id", oglasId)
    .maybeSingle();

  if (!oglas) {
    return { error: "Oglas ne postoji." };
  }
  if (oglas.status !== "prodato") {
    return { error: "Ovaj oglas još nije označen kao prodat." };
  }
  if (oglas.korisnik_id === user.id) {
    return { error: "Ne možeš oceniti sopstveni oglas." };
  }

  const { error } = await supabase.from("ocene").insert({
    oglas_id: oglasId,
    ocenjeni_id: oglas.korisnik_id,
    ocenio_id: user.id,
    ocena,
    komentar: komentar || null,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "Već si ocenio ovaj oglas." };
    }
    return { error: "Došlo je do greške pri čuvanju ocene." };
  }

  revalidatePath(`/oglasi/${oglasId}`);
  revalidatePath(`/profil/${oglas.korisnik_id}`);
  return { success: true };
}
