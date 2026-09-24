import { createClient } from "@/lib/supabase/server";
import { OglasiLista } from "@/components/oglasi-lista";
import { FilterBar } from "@/components/filter-bar";
import type { OglasZaKarticu } from "@/components/oglas-kartica";
import { trenutniFakultet } from "@/lib/fakultet/trenutni";
import {
  dohvatiIdPredmetaZaPretragu,
  parsirajFiltere,
  primeniFiltereNaUpit,
} from "@/lib/oglasi/filteri";

const STRANA_VELICINA = 12;

export default async function OglasiPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filteri = parsirajFiltere(await searchParams);
  const supabase = await createClient();
  const fakultet = await trenutniFakultet();
  const fakultetId = fakultet?.id ?? "";

  const predmetIdsZaPretragu = filteri.pretraga
    ? await dohvatiIdPredmetaZaPretragu(supabase, filteri.pretraga)
    : null;

  const [{ data: smerovi }, { data: oglasi, count }] = await Promise.all([
    supabase
      .from("smerovi")
      .select("id, fakultet_id, naziv")
      .eq("fakultet_id", fakultetId)
      .order("naziv"),
    primeniFiltereNaUpit(
      supabase
        .from("oglasi")
        .select(
          "id, tip, naziv, cena, besplatno, godina, slika_url, smerovi(naziv)",
          { count: "exact" }
        )
        .eq("status", "aktivan")
        .eq("fakultet_id", fakultetId),
      filteri,
      predmetIdsZaPretragu
    )
      .order("created_at", { ascending: false })
      .range(0, STRANA_VELICINA - 1),
  ]);

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
      <h1 className="mb-6 text-[32px] font-bold">Oglasi</h1>
      <FilterBar smerovi={smerovi ?? []} />
      <OglasiLista
        pocetniOglasi={(oglasi ?? []) as unknown as OglasZaKarticu[]}
        ukupno={count ?? 0}
        filteri={filteri}
        fakultetId={fakultetId}
      />
    </main>
  );
}
