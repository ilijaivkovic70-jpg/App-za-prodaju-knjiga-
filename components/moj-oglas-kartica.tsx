"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { promeniStatusOglasa, obrisiOglas } from "@/lib/oglasi/actions";

const NAZIVI_TIPOVA: Record<string, string> = {
  knjiga: "Knjiga",
  skripta: "Skripta",
  beleske: "Beleške",
  zbirka: "Zbirka zadataka",
  ostalo: "Ostalo",
};

const NAZIVI_STATUSA: Record<string, string> = {
  aktivan: "Aktivan",
  prodato: "Prodato",
  neaktivan: "Neaktivan",
};

export type MojOglas = {
  id: string;
  tip: string;
  cena: number | null;
  besplatno: boolean;
  godina: number;
  slika_url: string | null;
  status: string;
  predmeti: { naziv: string } | { naziv: string }[] | null;
};

function jedanNaziv(relacija: { naziv: string } | { naziv: string }[] | null) {
  if (!relacija) return null;
  return Array.isArray(relacija) ? relacija[0]?.naziv ?? null : relacija.naziv;
}

export function MojOglasKartica({ oglas }: { oglas: MojOglas }) {
  const router = useRouter();
  const [pendingStatus, startStatusTransition] = useTransition();
  const [pendingBrisanje, startBrisanjeTransition] = useTransition();
  const [greska, setGreska] = useState<string | null>(null);

  const predmetNaziv = jedanNaziv(oglas.predmeti);

  function promeniStatus(status: string) {
    setGreska(null);
    startStatusTransition(async () => {
      const formData = new FormData();
      formData.set("oglas_id", oglas.id);
      formData.set("status", status);
      const rezultat = await promeniStatusOglasa(formData);
      if (rezultat && "error" in rezultat) {
        setGreska(rezultat.error);
        return;
      }
      router.refresh();
    });
  }

  function obrisi() {
    if (!confirm("Da li sigurno želiš da obrišeš ovaj oglas?")) return;
    setGreska(null);
    startBrisanjeTransition(async () => {
      const formData = new FormData();
      formData.set("oglas_id", oglas.id);
      const rezultat = await obrisiOglas(formData);
      if (rezultat && "error" in rezultat) {
        setGreska(rezultat.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        <Link
          href={`/oglasi/${oglas.id}`}
          className="relative aspect-[4/3] w-full shrink-0 bg-muted sm:w-40"
        >
          {oglas.slika_url ? (
            <Image
              src={oglas.slika_url}
              alt={predmetNaziv ?? "Oglas"}
              fill
              className="object-cover"
              sizes="160px"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Bez slike
            </div>
          )}
        </Link>

        <CardContent className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              {NAZIVI_TIPOVA[oglas.tip] ?? oglas.tip}
              <span
                className={
                  "ml-2 rounded-lg px-2 py-0.5 text-xs font-semibold " +
                  (oglas.status === "aktivan"
                    ? "bg-success text-success-foreground"
                    : "bg-warning text-warning-foreground")
                }
              >
                {NAZIVI_STATUSA[oglas.status] ?? oglas.status}
              </span>
            </p>
            <Link
              href={`/oglasi/${oglas.id}`}
              className="text-base font-semibold leading-snug hover:underline"
            >
              {predmetNaziv ?? "Predmet"}
            </Link>
            <p className="text-sm font-bold text-primary">
              {oglas.besplatno
                ? "Besplatno"
                : `${Number(oglas.cena).toLocaleString("sr-RS")} RSD`}
            </p>
            {greska && <p className="text-sm text-destructive">{greska}</p>}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button render={<Link href={`/oglasi/${oglas.id}/izmeni`} />} variant="outline" size="sm">
              Izmeni
            </Button>
            {oglas.status === "aktivan" ? (
              <Button
                variant="outline"
                size="sm"
                disabled={pendingStatus}
                onClick={() => promeniStatus("prodato")}
              >
                Označi kao prodato
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                disabled={pendingStatus}
                onClick={() => promeniStatus("aktivan")}
              >
                Vrati u aktivne
              </Button>
            )}
            <Button
              variant="destructive"
              size="sm"
              disabled={pendingBrisanje}
              onClick={obrisi}
            >
              {pendingBrisanje ? "Brisanje..." : "Obriši"}
            </Button>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
