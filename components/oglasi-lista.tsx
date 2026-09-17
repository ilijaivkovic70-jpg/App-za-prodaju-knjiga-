"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { OglasKartica, type OglasZaKarticu } from "@/components/oglas-kartica";
import {
  dohvatiIdPredmetaZaPretragu,
  primeniFiltereNaUpit,
  type OglasiFilteri,
} from "@/lib/oglasi/filteri";

const STRANA_VELICINA = 12;

export function OglasiLista({
  pocetniOglasi,
  ukupno,
  filteri,
  samoBesplatno = false,
}: {
  pocetniOglasi: OglasZaKarticu[];
  ukupno: number;
  filteri: OglasiFilteri;
  samoBesplatno?: boolean;
}) {
  const [oglasi, setOglasi] = useState(pocetniOglasi);
  const [ucitava, setUcitava] = useState(false);
  const [izvor, setIzvor] = useState(pocetniOglasi);

  if (izvor !== pocetniOglasi) {
    setIzvor(pocetniOglasi);
    setOglasi(pocetniOglasi);
  }

  const imaJos = oglasi.length < ukupno;

  async function ucitajJos() {
    setUcitava(true);
    const supabase = createClient();
    const predmetIdsZaPretragu = filteri.pretraga
      ? await dohvatiIdPredmetaZaPretragu(supabase, filteri.pretraga)
      : null;
    let upit = primeniFiltereNaUpit(
      supabase
        .from("oglasi")
        .select(
          "id, tip, cena, besplatno, godina, slika_url, predmeti(naziv), smerovi(naziv)"
        )
        .eq("status", "aktivan"),
      filteri,
      predmetIdsZaPretragu
    );
    if (samoBesplatno) upit = upit.eq("besplatno", true);
    const { data } = await upit
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
    const imaAktivneFiltere = Object.values(filteri).some(
      (vrednost) => vrednost !== null && vrednost !== ""
    );

    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center">
        <p className="text-muted-foreground">
          {imaAktivneFiltere
            ? "Nema oglasa za izabrane filtere. Probaj da ih promeniš ili budi prvi koji će postaviti."
            : "Trenutno nema aktivnih oglasa. Budi prvi koji će postaviti."}
        </p>
        <Button render={<Link href="/oglasi/novi" />} variant="outline">
          Postavi oglas
        </Button>
      </div>
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
