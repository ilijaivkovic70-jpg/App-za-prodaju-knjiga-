import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

export type OglasZaKarticu = {
  id: string;
  tip: string;
  cena: number | null;
  besplatno: boolean;
  godina: number;
  slika_url: string | null;
  predmeti: { naziv: string } | { naziv: string }[] | null;
  smerovi: { naziv: string } | { naziv: string }[] | null;
};

const NAZIVI_TIPOVA: Record<string, string> = {
  knjiga: "Knjiga",
  skripta: "Skripta",
  beleske: "Beleške",
  zbirka: "Zbirka zadataka",
  ostalo: "Ostalo",
};

function jedanNaziv(relacija: { naziv: string } | { naziv: string }[] | null) {
  if (!relacija) return null;
  return Array.isArray(relacija) ? relacija[0]?.naziv ?? null : relacija.naziv;
}

export function OglasKartica({ oglas }: { oglas: OglasZaKarticu }) {
  const predmetNaziv = jedanNaziv(oglas.predmeti);
  const smerNaziv = jedanNaziv(oglas.smerovi);

  return (
    <Link
      href={`/oglasi/${oglas.id}`}
      className="block animate-in fade-in duration-300"
    >
      <Card className="h-full transition-transform hover:scale-[1.02]">
        <div className="relative aspect-[4/3] w-full bg-muted">
          {oglas.slika_url ? (
            <Image
              src={oglas.slika_url}
              alt={predmetNaziv ?? "Oglas"}
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 100vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Bez slike
            </div>
          )}
          {oglas.besplatno && (
            <span className="absolute right-2 top-2 rounded-lg bg-success px-2 py-1 text-xs font-semibold text-success-foreground">
              BESPLATNO
            </span>
          )}
        </div>
        <CardContent className="flex flex-col gap-1">
          <p className="text-sm text-muted-foreground">
            {NAZIVI_TIPOVA[oglas.tip] ?? oglas.tip}
          </p>
          <h3 className="text-base font-semibold leading-snug">
            {predmetNaziv ?? "Predmet"}
          </h3>
          <p className="text-sm text-muted-foreground">
            {smerNaziv ? `${smerNaziv}, ` : ""}
            {oglas.godina}. godina
          </p>
          <p className="mt-1 text-base font-bold text-primary">
            {oglas.besplatno
              ? "Besplatno"
              : `${Number(oglas.cena).toLocaleString("sr-RS")} RSD`}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
