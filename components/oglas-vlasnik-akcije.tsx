"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { obrisiOglas } from "@/lib/oglasi/actions";

export function OglasVlasnikAkcije({ oglasId }: { oglasId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [greska, setGreska] = useState<string | null>(null);

  function obrisi() {
    if (!confirm("Da li sigurno želiš da obrišeš ovaj oglas?")) return;
    setGreska(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.set("oglas_id", oglasId);
      const rezultat = await obrisiOglas(formData);
      if (rezultat && "error" in rezultat) {
        setGreska(rezultat.error);
        return;
      }
      router.push("/moj-profil");
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-2">
      {greska && <p className="text-sm text-destructive">{greska}</p>}
      <div className="flex gap-2">
        <Button
          render={<Link href={`/oglasi/${oglasId}/izmeni`} />}
          variant="outline"
          className="flex-1"
        >
          Izmeni oglas
        </Button>
        <Button
          variant="destructive"
          className="flex-1"
          disabled={pending}
          onClick={obrisi}
        >
          {pending ? "Brisanje..." : "Obriši oglas"}
        </Button>
      </div>
    </div>
  );
}
