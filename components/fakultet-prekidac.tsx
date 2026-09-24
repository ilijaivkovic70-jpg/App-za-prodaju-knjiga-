"use client";

import { useTransition } from "react";
import { postaviFakultet } from "@/lib/fakultet/actions";

type Fakultet = { id: string; naziv: string };

/** Izbor fakulteta (sekcije platforme); prikazuje se samo kad ih ima više. */
export function FakultetPrekidac({
  fakulteti,
  izabraniId,
}: {
  fakulteti: Fakultet[];
  izabraniId: string;
}) {
  const [ucitava, startTransition] = useTransition();

  if (fakulteti.length < 2) return null;

  return (
    <select
      aria-label="Fakultet"
      value={izabraniId}
      disabled={ucitava}
      onChange={(e) => {
        const id = e.target.value;
        startTransition(() => postaviFakultet(id));
      }}
      className="max-w-44 rounded-full border border-border bg-secondary px-3 py-2 text-[13px] font-medium text-foreground outline-none focus-visible:border-akcent-border disabled:opacity-60"
    >
      {fakulteti.map((f) => (
        <option key={f.id} value={f.id}>
          {f.naziv.replace(/ Beograd$/, "")}
        </option>
      ))}
    </select>
  );
}
