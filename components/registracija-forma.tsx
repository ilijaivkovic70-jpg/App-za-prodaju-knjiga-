"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { registrujSe } from "@/lib/auth/actions";

export function RegistracijaForma() {
  const [greska, setGreska] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setGreska(null);
    startTransition(async () => {
      const rezultat = await registrujSe(formData);
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
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required autoComplete="email" />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="lozinka">Lozinka</Label>
        <Input
          id="lozinka"
          name="lozinka"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="potvrda-lozinke">Potvrda lozinke</Label>
        <Input
          id="potvrda-lozinke"
          name="potvrda-lozinke"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
        />
      </div>

      <Button type="submit" disabled={pending} className="mt-2">
        {pending ? "Kreiranje naloga..." : "Napravi nalog"}
      </Button>
    </form>
  );
}
