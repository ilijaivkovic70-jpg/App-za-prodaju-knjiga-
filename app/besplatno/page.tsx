import { createClient } from "@/lib/supabase/server";
import { OglasiLista } from "@/components/oglasi-lista";
import type { OglasZaKarticu } from "@/components/oglas-kartica";
import { trenutniFakultet } from "@/lib/fakultet/trenutni";
import { PRAZNI_FILTERI } from "@/lib/oglasi/filteri";

const STRANA_VELICINA = 12;

export default async function BesplatnoPage() {
  const supabase = await createClient();
  const fakultetId = (await trenutniFakultet())?.id ?? "";

  const { data: oglasi, count } = await supabase
    .from("oglasi")
    .select(
      "id, tip, naziv, cena, besplatno, godina, slika_url, smerovi(naziv)",
      { count: "exact" }
    )
    .eq("status", "aktivan")
    .eq("besplatno", true)
    .eq("fakultet_id", fakultetId)
    .order("created_at", { ascending: false })
    .range(0, STRANA_VELICINA - 1);

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
      <h1 className="mb-6 text-[32px] font-bold">Besplatni materijali</h1>
      <OglasiLista
        pocetniOglasi={(oglasi ?? []) as unknown as OglasZaKarticu[]}
        ukupno={count ?? 0}
        filteri={PRAZNI_FILTERI}
        samoBesplatno
        fakultetId={fakultetId}
      />
    </main>
  );
}
