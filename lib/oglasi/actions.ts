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
  "komplet",
  "ostalo",
] as const;

const MAX_SLIKA_BAJTOVA = 5 * 1024 * 1024;

export async function kreirajOglas(formData: FormData): Promise<OglasRezultat> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/prijava");
  }

  const tip = String(formData.get("tip") ?? "");
  const naziv = String(formData.get("naziv") ?? "").trim();
  const smerId = String(formData.get("smer_id") ?? "").trim();
  const godinaRaw = String(formData.get("godina") ?? "");
  const godina = Number(godinaRaw);
  const predmetId = String(formData.get("predmet_id") ?? "").trim();
  const besplatno = formData.get("besplatno") === "on";
  const cenaRaw = String(formData.get("cena") ?? "").trim();
  const opis = String(formData.get("opis") ?? "").trim();
  const slika = formData.get("slika");

  if (!DOZVOLJENI_TIPOVI.includes(tip as (typeof DOZVOLJENI_TIPOVI)[number])) {
    return { error: "Izaberi tip materijala." };
  }
  if (!naziv) {
    return { error: "Upiši naziv oglasa." };
  }
  if (!godinaRaw || Number.isNaN(godina) || godina < 1 || godina > 6) {
    return { error: "Izaberi godinu." };
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
    naziv,
    predmet_id: predmetId || null,
    godina,
    smer_id: smerId || null,
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

export async function azurirajOglas(formData: FormData): Promise<OglasRezultat> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/prijava");
  }

  const oglasId = String(formData.get("oglas_id") ?? "");
  const naziv = String(formData.get("naziv") ?? "").trim();
  const besplatno = formData.get("besplatno") === "on";
  const cenaRaw = String(formData.get("cena") ?? "").trim();
  const opis = String(formData.get("opis") ?? "").trim();
  const slika = formData.get("slika");

  if (!oglasId) {
    return { error: "Nedostaje oglas." };
  }
  if (!naziv) {
    return { error: "Upiši naziv oglasa." };
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

  const izmene: Record<string, unknown> = {
    naziv,
    besplatno,
    cena,
    opis: opis || null,
  };

  if (imaSliku) {
    const slikaFajl = slika as File;
    const ekstenzija = slikaFajl.name.split(".").pop()?.toLowerCase() || "jpg";
    const putanja = `${user.id}/${crypto.randomUUID()}.${ekstenzija}`;

    const { error: uploadGreska } = await supabase.storage
      .from("oglasi-slike")
      .upload(putanja, slikaFajl, { contentType: slikaFajl.type });

    if (uploadGreska) {
      return { error: "Došlo je do greške pri otpremanju slike." };
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("oglasi-slike").getPublicUrl(putanja);
    izmene.slika_url = publicUrl;
  }

  const { error: oglasGreska } = await supabase
    .from("oglasi")
    .update(izmene)
    .eq("id", oglasId)
    .eq("korisnik_id", user.id);

  if (oglasGreska) {
    return { error: "Došlo je do greške pri čuvanju izmena." };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

export async function promeniStatusOglasa(formData: FormData): Promise<OglasRezultat> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/prijava");
  }

  const oglasId = String(formData.get("oglas_id") ?? "");
  const status = String(formData.get("status") ?? "");

  if (!oglasId || !["aktivan", "prodato", "neaktivan"].includes(status)) {
    return { error: "Nevažeći zahtev." };
  }

  const { error } = await supabase
    .from("oglasi")
    .update({ status })
    .eq("id", oglasId)
    .eq("korisnik_id", user.id);

  if (error) {
    return { error: "Došlo je do greške pri promeni statusa." };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

export async function obrisiOglas(formData: FormData): Promise<OglasRezultat> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/prijava");
  }

  const oglasId = String(formData.get("oglas_id") ?? "");
  if (!oglasId) {
    return { error: "Nedostaje oglas." };
  }

  const { data: oglas } = await supabase
    .from("oglasi")
    .select("slika_url")
    .eq("id", oglasId)
    .eq("korisnik_id", user.id)
    .maybeSingle();

  const { error } = await supabase
    .from("oglasi")
    .delete()
    .eq("id", oglasId)
    .eq("korisnik_id", user.id);

  if (error) {
    return { error: "Došlo je do greške pri brisanju oglasa." };
  }

  if (oglas?.slika_url) {
    const putanja = oglas.slika_url.split("/oglasi-slike/")[1];
    if (putanja) {
      await supabase.storage.from("oglasi-slike").remove([putanja]);
    }
  }

  revalidatePath("/", "layout");
  return { success: true };
}
