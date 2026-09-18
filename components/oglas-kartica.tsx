import Image from "next/image";
import Link from "next/link";

export type OglasZaKarticu = {
  id: string;
  tip: string;
  naziv: string;
  cena: number | null;
  besplatno: boolean;
  godina: number;
  slika_url: string | null;
  smerovi: { naziv: string } | { naziv: string }[] | null;
};

const NAZIVI_TIPOVA: Record<string, string> = {
  knjiga: "KNJIGA",
  skripta: "SKRIPTA",
  beleske: "BELEŠKE",
  zbirka: "ZBIRKA",
  komplet: "KOMPLET",
  ostalo: "OSTALO",
};

function jedanNaziv(relacija: { naziv: string } | { naziv: string }[] | null) {
  if (!relacija) return null;
  return Array.isArray(relacija) ? relacija[0]?.naziv ?? null : relacija.naziv;
}

export function OglasKartica({ oglas }: { oglas: OglasZaKarticu }) {
  const smerNaziv = jedanNaziv(oglas.smerovi);

  return (
    <Link
      href={`/oglasi/${oglas.id}`}
      className="group flex flex-col gap-3.5 rounded-[22px] border border-border bg-card p-3.5 transition-[transform,border-color] duration-200 hover:-translate-y-1 hover:border-akcent-border"
    >
      <div className="traka-placeholder relative grid aspect-[4/3] place-items-center overflow-hidden rounded-[14px]">
        {oglas.slika_url ? (
          <Image
            src={oglas.slika_url}
            alt={oglas.naziv}
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          />
        ) : (
          <span className="font-mono text-[9px] tracking-[0.16em] text-muted-foreground">
            BEZ SLIKE
          </span>
        )}
        <span className="absolute left-2.5 top-2.5 rounded-full bg-background/75 px-2.5 py-1.5 font-mono text-[10px] tracking-[0.1em] text-muted-foreground backdrop-blur">
          {NAZIVI_TIPOVA[oglas.tip] ?? oglas.tip}
        </span>
      </div>

      <div className="flex flex-col gap-1.5 px-1 pb-1">
        <h3 className="text-base font-medium leading-snug tracking-[-0.015em]">
          {oglas.naziv}
        </h3>
        <p className="text-xs font-light text-muted-foreground">
          {smerNaziv ? `${smerNaziv} · ` : ""}
          {oglas.godina}. godina
        </p>
        <p
          className={`mt-1.5 text-[18px] font-semibold ${
            oglas.besplatno ? "text-akcent" : "text-foreground"
          }`}
        >
          {oglas.besplatno
            ? "Besplatno"
            : `${Number(oglas.cena).toLocaleString("sr-RS")} RSD`}
        </p>
      </div>
    </Link>
  );
}
