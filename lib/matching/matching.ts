import { Resend } from "resend";
import type { SupabaseClient } from "@supabase/supabase-js";

const RESEND_FROM = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

type MatchRed = {
  oglas_id: string;
  prodavac_id: string;
  prodavac_email: string | null;
  predmet_naziv: string | null;
};

/**
 * Poredi jedan unos iz trazi_se sa postojećim aktivnim oglasima i šalje
 * email obaveštenje svakom prodavcu čiji oglas odgovara potrazi.
 * Poziva se odmah posle upisa u trazi_se (iz wizard-a "Šta mi treba"),
 * a dostupna je i preko POST /api/matching za ponovno pokretanje.
 */
export async function posaljiMatchObavestenja(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any>,
  traziSeId: string
): Promise<{ poslato: number }> {
  const { data: potraga } = await supabase
    .from("trazi_se")
    .select("id, korisnik_id, predmet_id, godina, smer_id")
    .eq("id", traziSeId)
    .maybeSingle();

  if (!potraga) return { poslato: 0 };

  const { data: matches } = await supabase.rpc("pronadji_match_oglase", {
    p_predmet_id: potraga.predmet_id,
    p_godina: potraga.godina,
    p_smer_id: potraga.smer_id,
    p_trazi_korisnik_id: potraga.korisnik_id,
  });

  const redovi = (matches ?? []) as MatchRed[];
  if (redovi.length === 0) return { poslato: 0 };

  const poNalogu = new Map<string, MatchRed[]>();
  for (const red of redovi) {
    if (!red.prodavac_email) continue;
    const postojeci = poNalogu.get(red.prodavac_email) ?? [];
    postojeci.push(red);
    poNalogu.set(red.prodavac_email, postojeci);
  }

  if (poNalogu.size === 0) return { poslato: 0 };

  if (!process.env.RESEND_API_KEY) {
    console.warn(
      "RESEND_API_KEY nije podešen, matching email obaveštenja se preskaču."
    );
    return { poslato: 0 };
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  const rezultati = await Promise.allSettled(
    Array.from(poNalogu.entries()).map(([email, oglasi]) => {
      const predmetNaziv = oglasi[0]?.predmet_naziv ?? "tvoj predmet";
      return resend.emails.send({
        from: RESEND_FROM,
        to: email,
        subject: `Neko traži materijal iz predmeta "${predmetNaziv}"`,
        html: `<p>Zdravo,</p><p>Student traži materijal iz predmeta <strong>${predmetNaziv}</strong>, a ti imaš aktivan oglas koji odgovara toj potrazi.</p><p>Proveri svoj oglas na platformi i javi se ako je materijal još dostupan.</p>`,
      });
    })
  );

  const poslato = rezultati.filter(
    (r) => r.status === "fulfilled" && !r.value.error
  ).length;

  return { poslato };
}
