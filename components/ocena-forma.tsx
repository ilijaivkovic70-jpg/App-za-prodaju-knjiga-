"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { sacuvajOcenu } from "@/lib/ocene/actions";
import { cn } from "@/lib/utils";

export function OcenaForma({ oglasId }: { oglasId: string }) {
  const router = useRouter();
  const [ocena, setOcena] = useState(0);
  const [hoverOcena, setHoverOcena] = useState(0);
  const [greska, setGreska] = useState<string | null>(null);
  const [uspeh, setUspeh] = useState(false);
  const [pending, startTransition] = useTransition();

  if (uspeh) {
    return (
      <Alert>
        <AlertDescription>Hvala, ocena je sačuvana.</AlertDescription>
      </Alert>
    );
  }

  function handleSubmit(formData: FormData) {
    setGreska(null);
    formData.set("oglas_id", oglasId);
    formData.set("ocena", String(ocena));

    if (ocena < 1 || ocena > 5) {
      setGreska("Izaberi ocenu od 1 do 5.");
      return;
    }

    startTransition(async () => {
      const rezultat = await sacuvajOcenu(formData);
      if (rezultat && "error" in rezultat) {
        setGreska(rezultat.error);
        return;
      }
      setUspeh(true);
      router.refresh();
    });
  }

  const prikazanaOcena = hoverOcena || ocena;

  return (
    <form action={handleSubmit} className="flex flex-col gap-4">
      {greska && (
        <Alert variant="destructive">
          <AlertDescription>{greska}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-1.5">
        <Label>Tvoja ocena</Label>
        <div className="flex gap-1" onMouseLeave={() => setHoverOcena(0)}>
          {[1, 2, 3, 4, 5].map((broj) => (
            <button
              key={broj}
              type="button"
              aria-label={`Oceni sa ${broj} od 5`}
              onMouseEnter={() => setHoverOcena(broj)}
              onClick={() => setOcena(broj)}
              className={cn(
                "text-2xl leading-none transition-colors",
                broj <= prikazanaOcena ? "text-warning" : "text-muted-foreground"
              )}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="komentar">Komentar (opciono)</Label>
        <Textarea id="komentar" name="komentar" rows={3} />
      </div>

      <Button type="submit" disabled={pending} className="mt-2">
        {pending ? "Slanje..." : "Pošalji ocenu"}
      </Button>
    </form>
  );
}
