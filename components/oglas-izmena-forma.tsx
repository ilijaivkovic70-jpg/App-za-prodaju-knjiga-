"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { azurirajOglas } from "@/lib/oglasi/actions";

export function OglasIzmenaForma({
  oglasId,
  pocetnaCena,
  pocetnoBesplatno,
  pocetniOpis,
}: {
  oglasId: string;
  pocetnaCena: number | null;
  pocetnoBesplatno: boolean;
  pocetniOpis: string | null;
}) {
  const router = useRouter();
  const [greska, setGreska] = useState<string | null>(null);
  const [uspeh, setUspeh] = useState(false);
  const [besplatno, setBesplatno] = useState(pocetnoBesplatno);
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setGreska(null);
    setUspeh(false);
    formData.set("oglas_id", oglasId);
    startTransition(async () => {
      const rezultat = await azurirajOglas(formData);
      if (rezultat && "error" in rezultat) {
        setGreska(rezultat.error);
        return;
      }
      setUspeh(true);
      router.refresh();
    });
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-4">
      {greska && (
        <Alert variant="destructive">
          <AlertDescription>{greska}</AlertDescription>
        </Alert>
      )}
      {uspeh && (
        <Alert>
          <AlertDescription>Izmene su sačuvane.</AlertDescription>
        </Alert>
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
          <Input
            id="cena"
            name="cena"
            type="number"
            min="1"
            step="1"
            defaultValue={pocetnaCena ?? undefined}
            required
          />
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="opis">Opis</Label>
        <Textarea id="opis" name="opis" rows={4} defaultValue={pocetniOpis ?? ""} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="slika">Nova slika (opciono)</Label>
        <Input id="slika" name="slika" type="file" accept="image/*" />
      </div>

      <Button type="submit" disabled={pending} className="mt-2">
        {pending ? "Čuvanje..." : "Sačuvaj izmene"}
      </Button>
    </form>
  );
}
