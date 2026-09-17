import { createClient } from "@/lib/supabase/server";
import { OglasiLista } from "@/components/oglasi-lista";
import type { OglasZaKarticu } from "@/components/oglas-kartica";

const STRANA_VELICINA = 12;

export default async function OglasiPage() {
  const supabase = await createClient();

  const { data: oglasi, count } = await supabase
    .from("oglasi")
    .select(
      "id, tip, cena, besplatno, godina, slika_url, predmeti(naziv), smerovi(naziv)",
      { count: "exact" }
    )
    .eq("status", "aktivan")
    .order("created_at", { ascending: false })
    .range(0, STRANA_VELICINA - 1);

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
      <h1 className="mb-6 text-[32px] font-bold">Oglasi</h1>
      <OglasiLista
        pocetniOglasi={(oglasi ?? []) as unknown as OglasZaKarticu[]}
        ukupno={count ?? 0}
      />
    </main>
  );
}
