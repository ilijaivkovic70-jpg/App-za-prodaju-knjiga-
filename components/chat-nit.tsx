"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { posaljiPoruku } from "@/lib/poruke/actions";

export type Poruka = {
  id: string;
  posiljalac_id: string;
  sadrzaj: string;
  created_at: string;
};

export function ChatNit({
  oglasId,
  sagovornikId,
  trenutniKorisnikId,
  pocetnePoruke,
}: {
  oglasId: string;
  sagovornikId: string;
  trenutniKorisnikId: string;
  pocetnePoruke: Poruka[];
}) {
  const router = useRouter();
  const [poruke, setPoruke] = useState(pocetnePoruke);
  const [tekst, setTekst] = useState("");
  const [greska, setGreska] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const dnoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dnoRef.current?.scrollIntoView({ block: "end" });
  }, [poruke]);

  useEffect(() => {
    const supabase = createClient();
    const kanal = supabase
      .channel(`poruke-${oglasId}-${trenutniKorisnikId}-${sagovornikId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "poruke", filter: `oglas_id=eq.${oglasId}` },
        (payload) => {
          const nova = payload.new as Poruka & {
            posiljalac_id: string;
            primalac_id: string;
          };
          const pripadaNiti =
            (nova.posiljalac_id === trenutniKorisnikId && nova.primalac_id === sagovornikId) ||
            (nova.posiljalac_id === sagovornikId && nova.primalac_id === trenutniKorisnikId);
          if (!pripadaNiti) return;
          setPoruke((prethodne) =>
            prethodne.some((p) => p.id === nova.id) ? prethodne : [...prethodne, nova]
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(kanal);
    };
  }, [oglasId, sagovornikId, trenutniKorisnikId]);

  function posalji() {
    const sadrzaj = tekst.trim();
    if (!sadrzaj) return;
    setGreska(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.set("oglas_id", oglasId);
      formData.set("primalac_id", sagovornikId);
      formData.set("sadrzaj", sadrzaj);
      const rezultat = await posaljiPoruku(formData);
      if (rezultat && "error" in rezultat) {
        setGreska(rezultat.error);
        return;
      }
      setTekst("");
      router.refresh();
    });
  }

  return (
    <div className="flex h-[60vh] flex-col rounded-[20px] border border-border bg-card">
      <div className="flex-1 overflow-y-auto p-4">
        {poruke.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Nema još poruka. Napiši prvu.
          </p>
        ) : (
          <div className="flex flex-col gap-2.5">
            {poruke.map((poruka) => {
              const mojaPoruka = poruka.posiljalac_id === trenutniKorisnikId;
              return (
                <div
                  key={poruka.id}
                  className={`flex ${mojaPoruka ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                      mojaPoruka
                        ? "grad-akcent text-white"
                        : "bg-secondary text-foreground"
                    }`}
                  >
                    <p className="whitespace-pre-line">{poruka.sadrzaj}</p>
                    <p
                      className={`mt-1 text-[10px] ${
                        mojaPoruka ? "text-white/70" : "text-muted-foreground"
                      }`}
                    >
                      {new Date(poruka.created_at).toLocaleString("sr-RS", {
                        hour: "2-digit",
                        minute: "2-digit",
                        day: "2-digit",
                        month: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={dnoRef} />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 border-t border-border p-3">
        {greska && <p className="text-sm text-destructive">{greska}</p>}
        <div className="flex items-end gap-2">
          <Textarea
            value={tekst}
            onChange={(e) => setTekst(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                posalji();
              }
            }}
            placeholder="Napiši poruku..."
            rows={1}
            className="flex-1 resize-none"
          />
          <Button onClick={posalji} disabled={pending || !tekst.trim()}>
            Pošalji
          </Button>
        </div>
      </div>
    </div>
  );
}
