"use client";

import { useMemo, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { sacuvajProfil } from "@/lib/profil/actions";

type Fakultet = { id: string; naziv: string };
type Smer = { id: string; fakultet_id: string; naziv: string };

const GODINE = [1, 2, 3, 4];
const ULOGE = [
  { value: "kupac", label: "Kupujem" },
  { value: "prodavac", label: "Prodajem" },
  { value: "oba", label: "Kupujem i prodajem" },
];

export function OnboardingForma({
  fakulteti,
  smerovi,
}: {
  fakulteti: Fakultet[];
  smerovi: Smer[];
}) {
  const [greska, setGreska] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [fakultetId, setFakultetId] = useState<string | null>(null);
  const [smerId, setSmerId] = useState<string | null>(null);

  const smeroviZaFakultet = useMemo(
    () => smerovi.filter((smer) => smer.fakultet_id === fakultetId),
    [smerovi, fakultetId]
  );

  function handleFakultetChange(vrednost: string | null) {
    setFakultetId(vrednost);
    setSmerId(null);
  }

  function handleSubmit(formData: FormData) {
    setGreska(null);
    startTransition(async () => {
      const rezultat = await sacuvajProfil(formData);
      if (rezultat?.error) {
        setGreska(rezultat.error);
      }
    });
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-4">
      {greska && (
        <Alert variant="destructive">
          <AlertDescription>{greska}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="ime">Ime i prezime</Label>
        <Input id="ime" name="ime" type="text" required autoComplete="name" />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="uloga">Šta planiraš da radiš?</Label>
        <Select name="uloga" defaultValue="oba" required items={ULOGE}>
          <SelectTrigger id="uloga" className="w-full">
            <SelectValue placeholder="Izaberi ulogu" />
          </SelectTrigger>
          <SelectContent>
            {ULOGE.map((uloga) => (
              <SelectItem key={uloga.value} value={uloga.value}>
                {uloga.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="fakultet_id">Fakultet</Label>
        <Select
          name="fakultet_id"
          value={fakultetId}
          onValueChange={handleFakultetChange}
          required
          items={fakulteti.map((f) => ({ value: f.id, label: f.naziv }))}
        >
          <SelectTrigger id="fakultet_id" className="w-full">
            <SelectValue placeholder="Izaberi fakultet" />
          </SelectTrigger>
          <SelectContent>
            {fakulteti.map((fakultet) => (
              <SelectItem key={fakultet.id} value={fakultet.id}>
                {fakultet.naziv}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {(!fakultetId || smeroviZaFakultet.length > 0) && (
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="smer_id">Smer (opciono)</Label>
        <Select
          name="smer_id"
          value={smerId}
          onValueChange={setSmerId}
          disabled={!fakultetId}
          items={smeroviZaFakultet.map((s) => ({ value: s.id, label: s.naziv }))}
        >
          <SelectTrigger id="smer_id" className="w-full">
            <SelectValue
              placeholder={
                fakultetId ? "Nije bitno / svi smerovi" : "Prvo izaberi fakultet"
              }
            />
          </SelectTrigger>
          <SelectContent>
            {smeroviZaFakultet.map((smer) => (
              <SelectItem key={smer.id} value={smer.id}>
                {smer.naziv}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="telefon">Broj telefona (opciono)</Label>
        <Input
          id="telefon"
          name="telefon"
          type="tel"
          placeholder="npr. 06x xxx xxxx"
          autoComplete="tel"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="godina">Godina studija</Label>
        <Select
          name="godina"
          required
          items={GODINE.map((g) => ({ value: String(g), label: `${g}. godina` }))}
        >
          <SelectTrigger id="godina" className="w-full">
            <SelectValue placeholder="Izaberi godinu" />
          </SelectTrigger>
          <SelectContent>
            {GODINE.map((godina) => (
              <SelectItem key={godina} value={String(godina)}>
                {godina}. godina
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" disabled={pending} className="mt-2">
        {pending ? "Čuvanje..." : "Sačuvaj profil"}
      </Button>
    </form>
  );
}
