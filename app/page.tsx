import Link from "next/link";
import { Search, Gift, Users, Star } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { OglasKartica, type OglasZaKarticu } from "@/components/oglas-kartica";

const PREDNOSTI = [
  {
    ikona: Search,
    naslov: "Filteri i pretraga",
    opis: "Pronađi tačno predmet, godinu i smer koji ti treba, bez skrolovanja kroz Viber poruke.",
  },
  {
    ikona: Gift,
    naslov: "Besplatni materijali",
    opis: "Posebna sekcija za skripte i beleške koje stariji studenti dele bez naknade.",
  },
  {
    ikona: Users,
    naslov: "Matching",
    opis: "Postavi šta ti treba i dobićeš email čim se pojavi oglas za taj predmet.",
  },
  {
    ikona: Star,
    naslov: "Reputacija",
    opis: "Ocene posle svake transakcije grade poverenje između studenata koji se ne poznaju.",
  },
];

export default async function Home() {
  const supabase = await createClient();
  const { data: oglasi } = await supabase
    .from("oglasi")
    .select(
      "id, tip, cena, besplatno, godina, slika_url, predmeti(naziv), smerovi(naziv)"
    )
    .eq("status", "aktivan")
    .order("created_at", { ascending: false })
    .limit(4);

  return (
    <>
      <section className="border-b bg-muted/30">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-6 px-4 py-20 text-center">
          <h1 className="max-w-2xl text-[32px] font-bold leading-tight sm:text-5xl">
            Udžbenici i skripte, od studenta do studenta
          </h1>
          <p className="max-w-xl text-base text-muted-foreground sm:text-lg">
            Kupuj i prodaj polovne udžbenike, skripte, beleške i zbirke
            zadataka sa Ekonomskog fakulteta u Beogradu, kroz filtere i
            pretragu umesto beskonačnog skrolovanja Viber grupa.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button render={<Link href="/oglasi" />} size="lg">
              Pogledaj oglase
            </Button>
            <Button render={<Link href="/oglasi/novi" />} variant="outline" size="lg">
              Postavi oglas
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-16">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PREDNOSTI.map(({ ikona: Ikona, naslov, opis }) => (
            <div key={naslov} className="flex flex-col gap-2">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Ikona className="size-5" />
              </div>
              <h3 className="text-lg font-semibold">{naslov}</h3>
              <p className="text-sm text-muted-foreground">{opis}</p>
            </div>
          ))}
        </div>
      </section>

      {oglasi && oglasi.length > 0 && (
        <section className="border-t bg-muted/30">
          <div className="mx-auto w-full max-w-6xl px-4 py-16">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Najnoviji oglasi</h2>
              <Link
                href="/oglasi"
                className="text-sm font-medium text-primary hover:underline"
              >
                Svi oglasi
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {(oglasi as unknown as OglasZaKarticu[]).map((oglas) => (
                <OglasKartica key={oglas.id} oglas={oglas} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
