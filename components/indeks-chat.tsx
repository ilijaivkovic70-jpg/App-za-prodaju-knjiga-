"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { OglasKartica, type OglasZaKarticu } from "@/components/oglas-kartica";

type Poruka = {
  uloga: "user" | "assistant";
  tekst: string;
  oglasi?: OglasZaKarticu[];
};

const POCETNA_PORUKA: Poruka = {
  uloga: "assistant",
  tekst:
    "Ćao! Ja sam Indeks. Napiši mi koja knjiga, skripta ili zbirka ti treba (po mogućstvu sa predmetom i godinom) i odmah ću pretražiti oglase za tebe.",
};

export function IndeksChat() {
  const [poruke, setPoruke] = useState<Poruka[]>([POCETNA_PORUKA]);
  const [unos, setUnos] = useState("");
  const [saljeSe, setSaljeSe] = useState(false);
  const dnoRef = useRef<HTMLDivElement>(null);

  async function posaljiPoruku(e: React.FormEvent) {
    e.preventDefault();
    const tekst = unos.trim();
    if (!tekst || saljeSe) return;

    const noveporuke = [...poruke, { uloga: "user" as const, tekst }];
    setPoruke(noveporuke);
    setUnos("");
    setSaljeSe(true);

    try {
      const odgovor = await fetch("/api/indeks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          poruke: noveporuke.map((p) => ({ role: p.uloga, content: p.tekst })),
        }),
      });

      const data = await odgovor.json();

      setPoruke((p) => [
        ...p,
        {
          uloga: "assistant",
          tekst: data.odgovor ?? data.greska ?? "Došlo je do greške, pokušaj ponovo.",
          oglasi: data.oglasi ?? [],
        },
      ]);
    } catch {
      setPoruke((p) => [
        ...p,
        { uloga: "assistant", tekst: "Došlo je do greške sa konekcijom, pokušaj ponovo." },
      ]);
    } finally {
      setSaljeSe(false);
      requestAnimationFrame(() => {
        dnoRef.current?.scrollIntoView({ behavior: "smooth" });
      });
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
      <div className="flex max-h-[60vh] flex-col gap-4 overflow-y-auto rounded-[20px] border border-border bg-card p-5">
        {poruke.map((p, i) => (
          <div
            key={i}
            className={`flex flex-col gap-3 ${p.uloga === "user" ? "items-end" : "items-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-[14px] leading-relaxed ${
                p.uloga === "user"
                  ? "grad-akcent text-white"
                  : "bg-secondary text-foreground"
              }`}
            >
              {p.tekst}
            </div>
            {p.oglasi && p.oglasi.length > 0 && (
              <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-3">
                {p.oglasi.map((oglas) => (
                  <OglasKartica key={oglas.id} oglas={oglas} />
                ))}
              </div>
            )}
          </div>
        ))}
        {saljeSe && (
          <div className="flex items-start">
            <div className="rounded-2xl bg-secondary px-4 py-2.5 text-[14px] text-muted-foreground">
              Indeks pretražuje...
            </div>
          </div>
        )}
        <div ref={dnoRef} />
      </div>

      <form onSubmit={posaljiPoruku} className="flex gap-2.5">
        <input
          value={unos}
          onChange={(e) => setUnos(e.target.value)}
          placeholder="Npr. treba mi knjiga za Mikroekonomiju, 2. godina..."
          disabled={saljeSe}
          className="flex-1 rounded-full border border-input bg-background px-4.5 py-2.5 text-sm outline-none focus:border-akcent-border disabled:opacity-60"
        />
        <Button type="submit" disabled={saljeSe || !unos.trim()}>
          Pošalji
        </Button>
      </form>
    </div>
  );
}
