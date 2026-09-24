"use client";

import { useTransition } from "react";
import { postaviFakultet } from "@/lib/fakultet/actions";

type Fakultet = { id: string; naziv: string };

/** Istaknut izbor fakulteta na početnoj strani. */
export function FakultetBiraci({
  fakulteti,
  izabraniId,
}: {
  fakulteti: Fakultet[];
  izabraniId: string;
}) {
  const [ucitava, startTransition] = useTransition();

  if (fakulteti.length < 2) return null;

  return (
    <div className="mt-8">
      <p className="mb-3 font-mono text-[11px] tracking-[0.1em] text-muted-foreground">
        IZABERI SVOJ FAKULTET
      </p>
      <div
        role="radiogroup"
        aria-label="Fakultet"
        className="flex flex-wrap justify-center gap-2.5"
      >
        {fakulteti.map((f) => {
          const aktivan = f.id === izabraniId;
          return (
            <button
              key={f.id}
              type="button"
              role="radio"
              aria-checked={aktivan}
              disabled={ucitava}
              onClick={() => startTransition(() => postaviFakultet(f.id))}
              className={`rounded-full border px-5 py-3 text-sm font-semibold transition-colors disabled:opacity-60 ${
                aktivan
                  ? "grad-akcent border-transparent text-white shadow-[0_8px_28px_oklch(0.55_0.25_300/0.4)]"
                  : "border-border bg-secondary text-muted-foreground hover:border-akcent-border hover:text-akcent"
              }`}
            >
              {f.naziv.replace(/ Beograd$/, "")}
            </button>
          );
        })}
      </div>
    </div>
  );
}
