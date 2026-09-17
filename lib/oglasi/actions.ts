"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type OglasRezultat = { error: string } | { success: true };

const DOZVOLJENI_TIPOVI = [
  "knjiga",
  "skripta",
  "beleske",
  "zbirka",
  "ostalo",
] as const;

const MAX_SLIKA_BAJTOVA = 5 * 1024 * 1024;
const NOVI_PREDMET_VREDNOST = "__novi__";

export async function kreirajOglas(formData: FormData): Promise<OglasRezultat> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/prijava");
  }

  const tip = String(formData.get("tip") ?? "");
  const smerId = String(formData.get("smer_id") ?? "");
  const godinaRaw = String(formData.get("godina") ?? "");
  const godina = Number(godinaRaw);
  const predmetId = String(formData.get("predmet_id") ?? "");
  const noviPredmetNaziv = String(formData.get("novi_predmet_naziv") ?? "").trim();
  const besplatno = formData.get("besplatno") === "on";
  const cenaRaw = String(formData.get("cena") ?? "").trim();
  const opis = String(formData.get("opis") ?? "").trim();
  const slika = formData.get("slika");

  if (!DOZVOLJENI_TIPOVI.includes(tip as (typeof DOZVOLJENI_TIPOVI)[number])) {
    return { error: "Izaberi tip materijala." };
  }
  if (!smerId) {
    return { error: "Izaberi smer." };
  }
  if (!godinaRaw || Number.isNaN(godina) || godina < 1 || godina > 6) {
    return { error: "Izaberi godinu." };
  }
  if (!predmetId) {
    return { error: "Izaberi predmet." };
  }
  if (predmetId === NOVI_PREDMET_VREDNOST && !noviPredmetNaziv) {
    return { error: "Upiši naziv predmeta." };
  }
  if (!besplatno && !cenaRaw) {
    return { error: "Upiši cenu ili označi da je besplatno." };
  }
  const cena = besplatno ? null : Number(cenaRaw.replace(",", "."));
  if (!besplatno && (Number.isNaN(cena as number) || (cena as number) <= 0)) {
    return { error: "Cena mora biti pozitivan broj." };
  }
  const imaSliku = slika instanceof File && slika.size > 0;
  if (imaSliku) {
    if (!(slika as File).type.startsWith("image/")) {
      return { error: "Fajl mora biti slika." };
    }
    if ((slika as File).size > MAX_SLIKA_BAJTOVA) {
      return { error: "Slika ne sme biti veća od 5MB." };
    }
  }

  let konacniPredmetId = predmetId;

  if (predmetId === NOVI_PREDMET_VREDNOST) {
    const { data: noviPredmet, error: predmetGreska } = await supabase
      .from("predmeti")
      .insert({ smer_id: smerId, godina, naziv: noviPredmetNaziv })
      .select("id")
      .single();

    if (predmetGreska || !noviPredmet) {
      return { error: "Došlo je do greške pri dodavanju predmeta." };
    }
    konacniPredmetId = noviPredmet.id;
  }

  let slikaUrl: string | null = null;
  let putanja: string | null = null;

  if (imaSliku) {
    const slikaFajl = slika as File;
    const ekstenzija = slikaFajl.name.split(".").pop()?.toLowerCase() || "jpg";
    putanja = `${user.id}/${crypto.randomUUID()}.${ekstenzija}`;

    const { error: uploadGreska } = await supabase.storage
      .from("oglasi-slike")
      .upload(putanja, slikaFajl, { contentType: slikaFajl.type });

    if (uploadGreska) {
      return { error: "Došlo je do greške pri otpremanju slike." };
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("oglasi-slike").getPublicUrl(putanja);
    slikaUrl = publicUrl;
  }

  const { error: oglasGreska } = await supabase.from("oglasi").insert({
    korisnik_id: user.id,
    tip,
    predmet_id: konacniPredmetId,
    godina,
    smer_id: smerId,
    cena,
    besplatno,
    opis: opis || null,
    slika_url: slikaUrl,
    status: "aktivan",
  });

  if (oglasGreska) {
    if (putanja) {
      await supabase.storage.from("oglasi-slike").remove([putanja]);
    }
    return { error: "Došlo je do greške pri čuvanju oglasa." };
  }

  revalidatePath("/", "layout");
  return { success: true };
}
