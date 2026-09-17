"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { OglasKartica, type OglasZaKarticu } from "@/components/oglas-kartica";

const STRANA_VELICINA = 12;

export function OglasiLista({
  pocetniOglasi,
  ukupno,
}: {
  pocetniOglasi: OglasZaKarticu[];
  ukupno: number;
}) {
  const [oglasi, setOglasi] = useState(pocetniOglasi);
  const [ucitava, setUcitava] = useState(false);

  const imaJos = oglasi.length < ukupno;

  async function ucitajJos() {
    setUcitava(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("oglasi")
      .select(
        "id, tip, cena, besplatno, godina, slika_url, predmeti(naziv), smerovi(naziv)"
      )
      .eq("status", "aktivan")
      .order("created_at", { ascending: false })
      .range(oglasi.length, oglasi.length + STRANA_VELICINA - 1);

    if (data) {
      setOglasi((prethodni) => [
        ...prethodni,
        ...(data as unknown as OglasZaKarticu[]),
      ]);
    }
    setUcitava(false);
  }

  if (oglasi.length === 0) {
    return (
      <p className="py-12 text-center text-muted-foreground">
        Trenutno nema aktivnih oglasa.
      </p>
    );
  }

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {oglasi.map((oglas) => (
          <OglasKartica key={oglas.id} oglas={oglas} />
        ))}
      </div>
      {imaJos && (
        <Button variant="outline" onClick={ucitajJos} disabled={ucitava}>
          {ucitava ? "Učitavanje..." : "Učitaj još"}
        </Button>
      )}
    </div>
  );
}
