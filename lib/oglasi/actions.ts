"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { trenutniFakultet } from "@/lib/fakultet/trenutni";

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
const MAX_SLIKA_BROJ = 6;
const NOVI_PREDMET_VREDNOST = "__novi__";

function validirajSlike(slike: File[]): string | null {
  if (slike.length > MAX_SLIKA_BROJ) {
    return `Možeš dodati najviše ${MAX_SLIKA_BROJ} slika.`;
  }
  for (const slika of slike) {
    if (!slika.type.startsWith("image/")) {
      return "Fajl mora biti slika.";
    }
    if (slika.size > MAX_SLIKA_BAJTOVA) {
      return "Slika ne sme biti veća od 5MB.";
    }
  }
  return null;
}

async function otpremiSlike(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  slike: File[]
): Promise<{ urls: string[]; putanje: string[] } | { error: string }> {
  const urls: string[] = [];
  const putanje: string[] = [];

  for (const slikaFajl of slike) {
    const ekstenzija = slikaFajl.name.split(".").pop()?.toLowerCase() || "jpg";
    const putanja = `${userId}/${crypto.randomUUID()}.${ekstenzija}`;

    const { error: uploadGreska } = await supabase.storage
      .from("oglasi-slike")
      .upload(putanja, slikaFajl, { contentType: slikaFajl.type });

    if (uploadGreska) {
      if (putanje.length > 0) {
        await supabase.storage.from("oglasi-slike").remove(putanje);
      }
      return { error: "Došlo je do greške pri otpremanju slike." };
    }

    putanje.push(putanja);
    const {
      data: { publicUrl },
    } = supabase.storage.from("oglasi-slike").getPublicUrl(putanja);
    urls.push(publicUrl);
  }

  return { urls, putanje };
}

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
  const noviPredmetNaziv = String(formData.get("novi_predmet_naziv") ?? "").trim();
  const besplatno = formData.get("besplatno") === "on";
  const cenaRaw = String(formData.get("cena") ?? "").trim();
  const opis = String(formData.get("opis") ?? "").trim();
  const slike = formData
    .getAll("slike")
    .filter((slika): slika is File => slika instanceof File && slika.size > 0);

  if (!DOZVOLJENI_TIPOVI.includes(tip as (typeof DOZVOLJENI_TIPOVI)[number])) {
    return { error: "Izaberi tip materijala." };
  }
  if (!naziv) {
    return { error: "Upiši naziv oglasa." };
  }
  if (!godinaRaw || Number.isNaN(godina) || godina < 1 || godina > 6) {
    return { error: "Izaberi godinu." };
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
  const slikeGreska = validirajSlike(slike);
  if (slikeGreska) {
    return { error: slikeGreska };
  }

  const fakultet = await trenutniFakultet();
  if (!fakultet) {
    return { error: "Izaberi fakultet." };
  }

  let konacniPredmetId = predmetId;

  if (predmetId === NOVI_PREDMET_VREDNOST) {
    const { data: noviPredmet, error: predmetGreska } = await supabase
      .from("predmeti")
      .insert({
        smer_id: smerId || null,
        fakultet_id: fakultet.id,
        godina,
        naziv: noviPredmetNaziv,
      })
      .select("id")
      .single();

    if (predmetGreska || !noviPredmet) {
      return { error: "Došlo je do greške pri dodavanju predmeta." };
    }
    konacniPredmetId = noviPredmet.id;
  }

  let slikaUrls: string[] = [];
  let putanje: string[] = [];

  if (slike.length > 0) {
    const rezultat = await otpremiSlike(supabase, user.id, slike);
    if ("error" in rezultat) {
      return { error: rezultat.error };
    }
    slikaUrls = rezultat.urls;
    putanje = rezultat.putanje;
  }

  const { data: noviOglas, error: oglasGreska } = await supabase
    .from("oglasi")
    .insert({
      korisnik_id: user.id,
      tip,
      naziv,
      predmet_id: konacniPredmetId || null,
      godina,
      smer_id: smerId || null,
      fakultet_id: fakultet.id,
      cena,
      besplatno,
      opis: opis || null,
      slika_url: slikaUrls[0] ?? null,
      status: "aktivan",
    })
    .select("id")
    .single();

  if (oglasGreska || !noviOglas) {
    if (putanje.length > 0) {
      await supabase.storage.from("oglasi-slike").remove(putanje);
    }
    return { error: "Došlo je do greške pri čuvanju oglasa." };
  }

  if (slikaUrls.length > 0) {
    await supabase.from("oglas_slike").insert(
      slikaUrls.map((url, redosled) => ({
        oglas_id: noviOglas.id,
        url,
        redosled,
      }))
    );
  }

  revalidatePath("/");
  revalidatePath("/oglasi");
  if (besplatno) revalidatePath("/besplatno");
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
  const slike = formData
    .getAll("slike")
    .filter((slika): slika is File => slika instanceof File && slika.size > 0);

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
  const slikeGreska = validirajSlike(slike);
  if (slikeGreska) {
    return { error: slikeGreska };
  }

  const izmene: Record<string, unknown> = {
    naziv,
    besplatno,
    cena,
    opis: opis || null,
  };

  let slikaUrls: string[] = [];
  let putanje: string[] = [];

  if (slike.length > 0) {
    const rezultat = await otpremiSlike(supabase, user.id, slike);
    if ("error" in rezultat) {
      return { error: rezultat.error };
    }
    slikaUrls = rezultat.urls;
    putanje = rezultat.putanje;

    const { data: postojeciOglas } = await supabase
      .from("oglasi")
      .select("slika_url")
      .eq("id", oglasId)
      .eq("korisnik_id", user.id)
      .maybeSingle();

    if (!postojeciOglas?.slika_url) {
      izmene.slika_url = slikaUrls[0];
    }
  }

  const { error: oglasGreska } = await supabase
    .from("oglasi")
    .update(izmene)
    .eq("id", oglasId)
    .eq("korisnik_id", user.id);

  if (oglasGreska) {
    if (putanje.length > 0) {
      await supabase.storage.from("oglasi-slike").remove(putanje);
    }
    return { error: "Došlo je do greške pri čuvanju izmena." };
  }

  if (slikaUrls.length > 0) {
    const { count } = await supabase
      .from("oglas_slike")
      .select("id", { count: "exact", head: true })
      .eq("oglas_id", oglasId);
    const pocetniRedosled = count ?? 0;

    await supabase.from("oglas_slike").insert(
      slikaUrls.map((url, i) => ({
        oglas_id: oglasId,
        url,
        redosled: pocetniRedosled + i,
      }))
    );
  }

  revalidatePath("/");
  revalidatePath("/oglasi");
  revalidatePath("/besplatno");
  revalidatePath(`/oglasi/${oglasId}`);
  revalidatePath("/moj-profil");
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

  revalidatePath("/");
  revalidatePath("/oglasi");
  revalidatePath("/besplatno");
  revalidatePath(`/oglasi/${oglasId}`);
  revalidatePath("/moj-profil");
  return { success: true };
}

const OBNOVA_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;

export async function obnoviOglas(formData: FormData): Promise<OglasRezultat> {
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
    .select("obnovljeno_at")
    .eq("id", oglasId)
    .eq("korisnik_id", user.id)
    .maybeSingle();

  if (!oglas) {
    return { error: "Oglas nije pronađen." };
  }

  const protekloMs = Date.now() - new Date(oglas.obnovljeno_at).getTime();
  if (protekloMs < OBNOVA_COOLDOWN_MS) {
    return { error: "Oglas možeš obnoviti tek 7 dana od prethodne obnove." };
  }

  const { error } = await supabase
    .from("oglasi")
    .update({ obnovljeno_at: new Date().toISOString() })
    .eq("id", oglasId)
    .eq("korisnik_id", user.id);

  if (error) {
    return { error: "Došlo je do greške pri obnavljanju oglasa." };
  }

  revalidatePath("/");
  revalidatePath("/oglasi");
  revalidatePath("/besplatno");
  revalidatePath(`/oglasi/${oglasId}`);
  revalidatePath("/moj-profil");
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

  const [{ data: oglas }, { data: slike }] = await Promise.all([
    supabase
      .from("oglasi")
      .select("slika_url")
      .eq("id", oglasId)
      .eq("korisnik_id", user.id)
      .maybeSingle(),
    supabase.from("oglas_slike").select("url").eq("oglas_id", oglasId),
  ]);

  const { error } = await supabase
    .from("oglasi")
    .delete()
    .eq("id", oglasId)
    .eq("korisnik_id", user.id);

  if (error) {
    return { error: "Došlo je do greške pri brisanju oglasa." };
  }

  const sveUrl = [
    ...(oglas?.slika_url ? [oglas.slika_url] : []),
    ...(slike ?? []).map((s) => s.url),
  ];
  const putanje = [...new Set(sveUrl)]
    .map((url) => url.split("/oglasi-slike/")[1])
    .filter((putanja): putanja is string => Boolean(putanja));

  if (putanje.length > 0) {
    await supabase.storage.from("oglasi-slike").remove(putanje);
  }

  revalidatePath("/");
  revalidatePath("/oglasi");
  revalidatePath("/besplatno");
  revalidatePath("/moj-profil");
  return { success: true };
}
