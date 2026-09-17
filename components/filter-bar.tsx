"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Smer = { id: string; fakultet_id: string; naziv: string };
type Predmet = { id: string; smer_id: string; godina: number; naziv: string };

const GODINE = [1, 2, 3, 4, 5, 6];

const TIPOVI = [
  { value: "knjiga", label: "Knjiga" },
  { value: "skripta", label: "Skripta" },
  { value: "beleske", label: "Beleške" },
  { value: "zbirka", label: "Zbirka zadataka" },
  { value: "ostalo", label: "Ostalo" },
];

export function FilterBar({
  smerovi,
  predmeti,
}: {
  smerovi: Smer[];
  predmeti: Predmet[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const smerId = searchParams.get("smer_id");
  const godina = searchParams.get("godina");
  const predmetId = searchParams.get("predmet_id");
  const tip = searchParams.get("tip");

  const cenaMinParam = searchParams.get("cena_min") ?? "";
  const cenaMaxParam = searchParams.get("cena_max") ?? "";

  const [cenaMin, setCenaMin] = useState(cenaMinParam);
  const [cenaMax, setCenaMax] = useState(cenaMaxParam);
  const [sinhronizovanoSa, setSinhronizovanoSa] = useState(searchParams.toString());

  if (sinhronizovanoSa !== searchParams.toString()) {
    setSinhronizovanoSa(searchParams.toString());
    setCenaMin(cenaMinParam);
    setCenaMax(cenaMaxParam);
  }

  const predmetiZaSmerIGodinu = useMemo(
    () =>
      predmeti.filter(
        (predmet) => predmet.smer_id === smerId && String(predmet.godina) === godina
      ),
    [predmeti, smerId, godina]
  );

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

  function izmeniSmer(vrednost: string | null) {
    postaviParametre({ smer_id: vrednost, predmet_id: null });
  }

  function izmeniGodinu(vrednost: string | null) {
    postaviParametre({ godina: vrednost, predmet_id: null });
  }

  function izmeniPredmet(vrednost: string | null) {
    postaviParametre({ predmet_id: vrednost });
  }

  function izmeniTip(vrednost: string | null) {
    postaviParametre({ tip: vrednost });
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      const trenutniMin = searchParams.get("cena_min") ?? "";
      const trenutniMax = searchParams.get("cena_max") ?? "";
      if (cenaMin !== trenutniMin || cenaMax !== trenutniMax) {
        postaviParametre({
          cena_min: cenaMin || null,
          cena_max: cenaMax || null,
        });
      }
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cenaMin, cenaMax]);

  const imaAktivneFiltere =
    smerId || godina || predmetId || tip || cenaMin || cenaMax;

  function ocistiFiltere() {
    setCenaMin("");
    setCenaMax("");
    router.push(pathname, { scroll: false });
  }

  return (
    <div className="mb-6 flex flex-col gap-4 rounded-xl border bg-secondary p-4 sm:flex-row sm:flex-wrap sm:items-end">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="filter_smer">Smer</Label>
        <Select
          value={smerId}
          onValueChange={izmeniSmer}
          items={smerovi.map((s) => ({ value: s.id, label: s.naziv }))}
        >
          <SelectTrigger id="filter_smer" className="w-full sm:w-44">
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
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="filter_godina">Godina</Label>
        <Select
          value={godina}
          onValueChange={izmeniGodinu}
          items={GODINE.map((g) => ({ value: String(g), label: `${g}. godina` }))}
        >
          <SelectTrigger id="filter_godina" className="w-full sm:w-32">
            <SelectValue placeholder="Sve godine" />
          </SelectTrigger>
          <SelectContent>
            {GODINE.map((g) => (
              <SelectItem key={g} value={String(g)}>
                {g}. godina
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="filter_predmet">Predmet</Label>
        <Select
          value={predmetId}
          onValueChange={izmeniPredmet}
          disabled={!smerId || !godina}
          items={predmetiZaSmerIGodinu.map((p) => ({ value: p.id, label: p.naziv }))}
        >
          <SelectTrigger id="filter_predmet" className="w-full sm:w-44">
            <SelectValue
              placeholder={smerId && godina ? "Svi predmeti" : "Izaberi smer i godinu"}
            />
          </SelectTrigger>
          <SelectContent>
            {predmetiZaSmerIGodinu.map((predmet) => (
              <SelectItem key={predmet.id} value={predmet.id}>
                {predmet.naziv}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="filter_tip">Tip materijala</Label>
        <Select
          value={tip}
          onValueChange={izmeniTip}
          items={TIPOVI}
        >
          <SelectTrigger id="filter_tip" className="w-full sm:w-40">
            <SelectValue placeholder="Svi tipovi" />
          </SelectTrigger>
          <SelectContent>
            {TIPOVI.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="filter_cena_min">Cena od</Label>
        <Input
          id="filter_cena_min"
          type="number"
          min="0"
          step="1"
          placeholder="0"
          className="w-full sm:w-24"
          value={cenaMin}
          onChange={(e) => setCenaMin(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="filter_cena_max">Cena do</Label>
        <Input
          id="filter_cena_max"
          type="number"
          min="0"
          step="1"
          placeholder="∞"
          className="w-full sm:w-24"
          value={cenaMax}
          onChange={(e) => setCenaMax(e.target.value)}
        />
      </div>

      {imaAktivneFiltere && (
        <Button variant="outline" onClick={ocistiFiltere} className="sm:ml-auto">
          Očisti filtere
        </Button>
      )}
    </div>
  );
}
