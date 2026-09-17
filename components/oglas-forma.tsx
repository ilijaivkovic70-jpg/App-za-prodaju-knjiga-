"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { kreirajOglas } from "@/lib/oglasi/actions";

type Fakultet = { id: string; naziv: string };
type Smer = { id: string; fakultet_id: string; naziv: string };
type Predmet = { id: string; smer_id: string; godina: number; naziv: string };

const GODINE = [1, 2, 3, 4, 5, 6];
const NOVI_PREDMET_VREDNOST = "__novi__";

const TIPOVI = [
  { value: "knjiga", label: "Knjiga" },
  { value: "skripta", label: "Skripta" },
  { value: "beleske", label: "Beleške" },
  { value: "zbirka", label: "Zbirka zadataka" },
  { value: "ostalo", label: "Ostalo" },
];

export function OglasForma({
  fakulteti,
  smerovi,
  predmeti,
}: {
  fakulteti: Fakultet[];
  smerovi: Smer[];
  predmeti: Predmet[];
}) {
  const router = useRouter();
  const [greska, setGreska] = useState<string | null>(null);
  const [uspeh, setUspeh] = useState(false);
  const [pending, startTransition] = useTransition();

  const [fakultetId, setFakultetId] = useState<string | null>(null);
  const [smerId, setSmerId] = useState<string | null>(null);
  const [godina, setGodina] = useState<string | null>(null);
  const [predmetId, setPredmetId] = useState<string | null>(null);
  const [besplatno, setBesplatno] = useState(false);
  const [formKey, setFormKey] = useState(0);

  const smeroviZaFakultet = useMemo(
    () => smerovi.filter((smer) => smer.fakultet_id === fakultetId),
    [smerovi, fakultetId]
  );

  const predmetiZaSmerIGodinu = useMemo(
    () =>
      predmeti.filter(
        (predmet) =>
          predmet.smer_id === smerId && String(predmet.godina) === godina
      ),
    [predmeti, smerId, godina]
  );

  function handleFakultetChange(vrednost: string | null) {
    setFakultetId(vrednost);
    setSmerId(null);
    setPredmetId(null);
  }

  function handleSmerChange(vrednost: string | null) {
    setSmerId(vrednost);
    setPredmetId(null);
  }

  function handleGodinaChange(vrednost: string | null) {
    setGodina(vrednost);
    setPredmetId(null);
  }

  function handleSubmit(formData: FormData) {
    setGreska(null);
    setUspeh(false);
    startTransition(async () => {
      const rezultat = await kreirajOglas(formData);
      if (rezultat && "error" in rezultat) {
        setGreska(rezultat.error);
        return;
      }
      setUspeh(true);
      setFakultetId(null);
      setSmerId(null);
      setGodina(null);
      setPredmetId(null);
      setBesplatno(false);
      setFormKey((k) => k + 1);
      router.refresh();
    });
  }

  return (
    <form key={formKey} action={handleSubmit} className="flex flex-col gap-4">
      {greska && (
        <Alert variant="destructive">
          <AlertDescription>{greska}</AlertDescription>
        </Alert>
      )}
      {uspeh && (
        <Alert>
          <AlertDescription>Oglas je uspešno postavljen.</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="tip">Tip materijala</Label>
        <Select name="tip" required items={TIPOVI}>
          <SelectTrigger id="tip" className="w-full">
            <SelectValue placeholder="Izaberi tip" />
          </SelectTrigger>
          <SelectContent>
            {TIPOVI.map((tip) => (
              <SelectItem key={tip.value} value={tip.value}>
                {tip.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="fakultet_id">Fakultet</Label>
        <Select
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

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="smer_id">Smer</Label>
        <Select
          name="smer_id"
          value={smerId}
          onValueChange={handleSmerChange}
          disabled={!fakultetId}
          required
          items={smeroviZaFakultet.map((s) => ({ value: s.id, label: s.naziv }))}
        >
          <SelectTrigger id="smer_id" className="w-full">
            <SelectValue
              placeholder={fakultetId ? "Izaberi smer" : "Prvo izaberi fakultet"}
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

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="godina">Godina</Label>
        <Select
          name="godina"
          value={godina}
          onValueChange={handleGodinaChange}
          required
          items={GODINE.map((g) => ({ value: String(g), label: `${g}. godina` }))}
        >
          <SelectTrigger id="godina" className="w-full">
            <SelectValue placeholder="Izaberi godinu" />
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
        <Label htmlFor="predmet_id">Predmet</Label>
        <Select
          name="predmet_id"
          value={predmetId}
          onValueChange={setPredmetId}
          disabled={!smerId || !godina}
          required
          items={[
            ...predmetiZaSmerIGodinu.map((p) => ({ value: p.id, label: p.naziv })),
            { value: NOVI_PREDMET_VREDNOST, label: "+ Dodaj novi predmet" },
          ]}
        >
          <SelectTrigger id="predmet_id" className="w-full">
            <SelectValue
              placeholder={
                smerId && godina ? "Izaberi predmet" : "Prvo izaberi smer i godinu"
              }
            />
          </SelectTrigger>
          <SelectContent>
            {predmetiZaSmerIGodinu.map((predmet) => (
              <SelectItem key={predmet.id} value={predmet.id}>
                {predmet.naziv}
              </SelectItem>
            ))}
            <SelectItem value={NOVI_PREDMET_VREDNOST}>
              + Dodaj novi predmet
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {predmetId === NOVI_PREDMET_VREDNOST && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="novi_predmet_naziv">Naziv novog predmeta</Label>
          <Input
            id="novi_predmet_naziv"
            name="novi_predmet_naziv"
            type="text"
            required
          />
        </div>
      )}

      <div className="flex items-center gap-2">
        <Checkbox
          id="besplatno"
          name="besplatno"
          checked={besplatno}
          onCheckedChange={(vrednost) => setBesplatno(vrednost === true)}
        />
        <Label htmlFor="besplatno">Besplatno</Label>
      </div>

      {!besplatno && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="cena">Cena (RSD)</Label>
          <Input id="cena" name="cena" type="number" min="1" step="1" required />
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="opis">Opis</Label>
        <Textarea id="opis" name="opis" rows={4} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="slika">Slika (opciono)</Label>
        <Input id="slika" name="slika" type="file" accept="image/*" />
      </div>

      <Button type="submit" disabled={pending} className="mt-2">
        {pending ? "Postavljanje..." : "Postavi oglas"}
      </Button>
    </form>
  );
}
