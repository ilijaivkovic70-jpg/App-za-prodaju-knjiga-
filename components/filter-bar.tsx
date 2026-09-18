"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Smer = { id: string; fakultet_id: string; naziv: string };

const GODINE = [1, 2, 3, 4, 5, 6];

const TIPOVI = [
  { value: "knjiga", label: "Knjiga" },
  { value: "skripta", label: "Skripta" },
  { value: "beleske", label: "Beleške" },
  { value: "zbirka", label: "Zbirka" },
  { value: "komplet", label: "Komplet" },
  { value: "ostalo", label: "Ostalo" },
];

function Pilula({
  aktivna,
  onClick,
  children,
}: {
  aktivna: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={aktivna}
      className={`rounded-full border px-3.5 py-2 text-xs font-medium transition-colors ${
        aktivna
          ? "border-akcent-border bg-akcent-soft text-akcent"
          : "border-input bg-secondary text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function Oznaka({ children }: { children: React.ReactNode }) {
  return (
    <span className="w-16 font-mono text-[10px] tracking-[0.14em] text-muted-foreground">
      {children}
    </span>
  );
}

export function FilterBar({ smerovi }: { smerovi: Smer[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const smerId = searchParams.get("smer_id");
  const godina = searchParams.get("godina");
  const tip = searchParams.get("tip");
  const besplatno = searchParams.get("besplatno") === "1";
  const pretragaParam = searchParams.get("pretraga") ?? "";

  const [pretraga, setPretraga] = useState(pretragaParam);
  const [sinhronizovanoSa, setSinhronizovanoSa] = useState(searchParams.toString());

  if (sinhronizovanoSa !== searchParams.toString()) {
    setSinhronizovanoSa(searchParams.toString());
    setPretraga(pretragaParam);
  }

  function postaviParametre(izmene: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [kljuc, vrednost] of Object.entries(izmene)) {
      if (vrednost) params.set(kljuc, vrednost);
      else params.delete(kljuc);
    }
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      if (pretraga !== (searchParams.get("pretraga") ?? "")) {
        postaviParametre({ pretraga: pretraga || null });
      }
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pretraga]);

  const imaAktivneFiltere = smerId || godina || tip || besplatno || pretraga;

  return (
    <div className="mb-8 flex flex-col gap-4">
      <div className="flex items-center gap-2 rounded-full border border-border bg-card py-1.5 pl-5 pr-2">
        <input
          type="text"
          value={pretraga}
          onChange={(e) => setPretraga(e.target.value)}
          placeholder="Naziv, predmet ili opis…"
          aria-label="Pretraga oglasa"
          className="min-w-0 flex-1 bg-transparent py-2.5 text-sm font-light text-foreground outline-none placeholder:text-muted-foreground"
        />
        <span className="pr-3 font-mono text-[11px] text-muted-foreground">↵</span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Oznaka>GODINA</Oznaka>
        {GODINE.map((g) => (
          <Pilula
            key={g}
            aktivna={godina === String(g)}
            onClick={() =>
              postaviParametre({ godina: godina === String(g) ? null : String(g) })
            }
          >
            {g}.
          </Pilula>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Oznaka>TIP</Oznaka>
        {TIPOVI.map((t) => (
          <Pilula
            key={t.value}
            aktivna={tip === t.value}
            onClick={() => postaviParametre({ tip: tip === t.value ? null : t.value })}
          >
            {t.label}
          </Pilula>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Oznaka>OSTALO</Oznaka>
        <Pilula
          aktivna={besplatno}
          onClick={() => postaviParametre({ besplatno: besplatno ? null : "1" })}
        >
          Samo besplatno
        </Pilula>
        <Select
          value={smerId}
          onValueChange={(v) => postaviParametre({ smer_id: v })}
          items={smerovi.map((s) => ({ value: s.id, label: s.naziv }))}
        >
          <SelectTrigger
            id="filter_smer"
            className="h-auto w-full rounded-full border-input bg-secondary px-3.5 py-2 text-xs sm:w-52"
          >
            <SelectValue placeholder="Svi smerovi" />
          </SelectTrigger>
          <SelectContent>
            {smerovi.map((smer) => (
              <SelectItem key={smer.id} value={smer.id}>
                {smer.naziv}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {imaAktivneFiltere && (
          <button
            type="button"
            onClick={() => {
              setPretraga("");
              router.push(pathname, { scroll: false });
            }}
            className="rounded-full border border-input px-3.5 py-2 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            Očisti sve
          </button>
        )}
      </div>
    </div>
  );
}
