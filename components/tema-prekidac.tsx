"use client";

import { useEffect, useState } from "react";

const KLJUC = "ekof-tema";

export function TemaPrekidac() {
  const [tamna, setTamna] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sinhronizacija sa klasom koju inline skripta u <head> postavlja pre hidratacije
    setTamna(document.documentElement.classList.contains("dark"));
  }, []);

  function postavi(naTamnu: boolean) {
    setTamna(naTamnu);
    document.documentElement.classList.toggle("dark", naTamnu);
    try {
      localStorage.setItem(KLJUC, naTamnu ? "dark" : "light");
    } catch {
      /* private mode */
    }
  }

  return (
    <div className="flex rounded-full border border-border bg-secondary p-1">
      <button
        type="button"
        aria-pressed={tamna}
        onClick={() => postavi(true)}
        className={`rounded-full px-3 py-1.5 font-mono text-[10px] tracking-[0.08em] transition-colors ${
          tamna ? "grad-akcent text-white" : "text-muted-foreground"
        }`}
      >
        TAMNO
      </button>
      <button
        type="button"
        aria-pressed={!tamna}
        onClick={() => postavi(false)}
        className={`rounded-full px-3 py-1.5 font-mono text-[10px] tracking-[0.08em] transition-colors ${
          !tamna ? "grad-akcent text-white" : "text-muted-foreground"
        }`}
      >
        SVETLO
      </button>
    </div>
  );
}
