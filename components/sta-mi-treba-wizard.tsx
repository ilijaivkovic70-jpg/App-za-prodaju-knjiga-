"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { sacuvajPotragu } from "@/lib/trazi-se/actions";

type Smer = { id: string; fakultet_id: string; naziv: string };
type Predmet = { id: string; smer_id: string | null; godina: number; naziv: string };

const GODINE = [1, 2, 3, 4];

export function StaMiTrebaWizard({
  smerovi,
  predmeti,
}: {
  smerovi: Smer[];
  predmeti: Predmet[];
}) {
  const router = useRouter();
  const [korak, setKorak] = useState(1);
  const [godina, setGodina] = useState<string | null>(null);
  const [smerId, setSmerId] = useState<string | null>(null);
  const [predmetId, setPredmetId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const imaSmerove = smerovi.length > 0;

  const predmetiZaSmerIGodinu = useMemo(
    () =>
      predmeti.filter(
        (predmet) =>
          (imaSmerove ? predmet.smer_id === smerId : true) &&
          String(predmet.godina) === godina
      ),
    [predmeti, smerId, godina, imaSmerove]
  );

  function izaberiGodinu(vrednost: string) {
    setGodina(vrednost);
    setKorak(imaSmerove ? 2 : 3);
  }

  function izaberiSmer(vrednost: string | null) {
    setSmerId(vrednost);
    setKorak(3);
  }

  function izaberiPredmet(vrednost: string | null) {
    setPredmetId(vrednost);
    if (!vrednost || (imaSmerove && !smerId) || !godina) return;

    const formData = new FormData();
    if (smerId) formData.set("smer_id", smerId);
    formData.set("godina", godina);
    formData.set("predmet_id", vrednost);

    startTransition(async () => {
      await sacuvajPotragu(formData);
      const smerDeo = smerId ? `smer_id=${smerId}&` : "";
      router.push(`/oglasi?${smerDeo}godina=${godina}&predmet_id=${vrednost}`);
    });
  }

  function nazad() {
    setKorak((k) => (k === 3 && !imaSmerove ? 1 : Math.max(1, k - 1)));
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 rounded-xl border bg-secondary p-6 shadow-sm">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className={korak === 1 ? "font-semibold text-foreground" : ""}>
          1. Godina
        </span>
        {imaSmerove && (
          <>
            <span>›</span>
            <span className={korak === 2 ? "font-semibold text-foreground" : ""}>
              2. Smer
            </span>
          </>
        )}
        <span>›</span>
        <span className={korak === 3 ? "font-semibold text-foreground" : ""}>
          {imaSmerove ? "3." : "2."} Predmet
        </span>
      </div>

      {korak === 1 && (
        <div className="flex flex-col gap-3">
          <p className="text-lg font-semibold">Koju godinu upisuješ?</p>
          <div className="grid grid-cols-3 gap-2">
            {GODINE.map((g) => (
              <Button
                key={g}
                type="button"
                variant={godina === String(g) ? "default" : "outline"}
                onClick={() => izaberiGodinu(String(g))}
              >
                {g}. godina
              </Button>
            ))}
          </div>
        </div>
      )}

      {korak === 2 && (
        <div className="flex flex-col gap-3">
          <p className="text-lg font-semibold">Koji smer studiraš?</p>
          <Select
            value={smerId}
            onValueChange={izaberiSmer}
            items={smerovi.map((s) => ({ value: s.id, label: s.naziv }))}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Izaberi smer" />
            </SelectTrigger>
            <SelectContent>
              {smerovi.map((smer) => (
                <SelectItem key={smer.id} value={smer.id}>
                  {smer.naziv}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button type="button" variant="outline" onClick={nazad}>
            Nazad
          </Button>
        </div>
      )}

      {korak === 3 && (
        <div className="flex flex-col gap-3">
          <p className="text-lg font-semibold">Koji predmet ti treba?</p>
          {predmetiZaSmerIGodinu.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Za izabranu godinu i smer trenutno nema unetih predmeta.
            </p>
          ) : (
            <Select
              value={predmetId}
              onValueChange={izaberiPredmet}
              disabled={pending}
              items={predmetiZaSmerIGodinu.map((p) => ({
                value: p.id,
                label: p.naziv,
              }))}
            >
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={pending ? "Pretraga..." : "Izaberi predmet"}
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
          )}
          <Button type="button" variant="outline" onClick={nazad} disabled={pending}>
            Nazad
          </Button>
        </div>
      )}
    </div>
  );
}
