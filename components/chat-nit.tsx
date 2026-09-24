"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Reply, Smile, X } from "lucide-react";
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
  odgovor_na_id: string | null;
};

export type Reakcija = {
  id: string;
  poruka_id: string;
  korisnik_id: string;
  emoji: string;
};

const EMOJIJI = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

export function ChatNit({
  oglasId,
  sagovornikId,
  trenutniKorisnikId,
  pocetnePoruke,
  pocetneReakcije,
}: {
  oglasId: string;
  sagovornikId: string;
  trenutniKorisnikId: string;
  pocetnePoruke: Poruka[];
  pocetneReakcije: Reakcija[];
}) {
  const router = useRouter();
  const [poruke, setPoruke] = useState(pocetnePoruke);
  const [reakcije, setReakcije] = useState(pocetneReakcije);
  const [odgovorNa, setOdgovorNa] = useState<Poruka | null>(null);
  const [otvorenPicker, setOtvorenPicker] = useState<string | null>(null);
  const [tekst, setTekst] = useState("");
  const [greska, setGreska] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const dnoRef = useRef<HTMLDivElement>(null);
  const porukeIdsRef = useRef<string[]>([]);

  useEffect(() => {
    porukeIdsRef.current = poruke.map((p) => p.id);
  }, [poruke]);

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
      .on("postgres_changes", { event: "*", schema: "public", table: "poruke_reakcije" }, () => {
        osveziReakcije();
      })
      .subscribe();

    async function osveziReakcije() {
      const ids = porukeIdsRef.current;
      if (ids.length === 0) return;
      const { data } = await supabase
        .from("poruke_reakcije")
        .select("id, poruka_id, korisnik_id, emoji")
        .in("poruka_id", ids);
      if (data) setReakcije(data);
    }

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
      if (odgovorNa) formData.set("odgovor_na_id", odgovorNa.id);
      const rezultat = await posaljiPoruku(formData);
      if (rezultat && "error" in rezultat) {
        setGreska(rezultat.error);
        return;
      }
      setTekst("");
      setOdgovorNa(null);
      router.refresh();
    });
  }

  async function promeniReakciju(porukaId: string, emoji: string) {
    setOtvorenPicker(null);
    const supabase = createClient();
    const postojeca = reakcije.find(
      (r) => r.poruka_id === porukaId && r.korisnik_id === trenutniKorisnikId && r.emoji === emoji
    );

    if (postojeca) {
      setReakcije((prethodne) => prethodne.filter((r) => r.id !== postojeca.id));
      const { error } = await supabase.from("poruke_reakcije").delete().eq("id", postojeca.id);
      if (error) setReakcije((prethodne) => [...prethodne, postojeca]);
      return;
    }

    const privremena: Reakcija = {
      id: `tmp-${porukaId}-${emoji}`,
      poruka_id: porukaId,
      korisnik_id: trenutniKorisnikId,
      emoji,
    };
    setReakcije((prethodne) => [...prethodne, privremena]);
    const { data, error } = await supabase
      .from("poruke_reakcije")
      .insert({ poruka_id: porukaId, korisnik_id: trenutniKorisnikId, emoji })
      .select("id, poruka_id, korisnik_id, emoji")
      .single();
    setReakcije((prethodne) =>
      error || !data
        ? prethodne.filter((r) => r.id !== privremena.id)
        : prethodne.map((r) => (r.id === privremena.id ? data : r))
    );
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
              const original = poruka.odgovor_na_id
                ? poruke.find((p) => p.id === poruka.odgovor_na_id)
                : null;
              const reakcijeOvePoruke = reakcije.filter((r) => r.poruka_id === poruka.id);
              const grupe = [...new Set(reakcijeOvePoruke.map((r) => r.emoji))].map((emoji) => {
                const njih = reakcijeOvePoruke.filter((r) => r.emoji === emoji);
                return {
                  emoji,
                  broj: njih.length,
                  moja: njih.some((r) => r.korisnik_id === trenutniKorisnikId),
                };
              });
              return (
                <div
                  key={poruka.id}
                  className={`flex flex-col ${mojaPoruka ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                      mojaPoruka
                        ? "grad-akcent text-white"
                        : "bg-secondary text-foreground"
                    }`}
                  >
                    {poruka.odgovor_na_id && (
                      <p
                        className={`mb-1.5 line-clamp-2 border-l-2 pl-2 text-xs ${
                          mojaPoruka
                            ? "border-white/60 text-white/80"
                            : "border-akcent text-muted-foreground"
                        }`}
                      >
                        {original ? original.sadrzaj : "Poruka više nije dostupna"}
                      </p>
                    )}
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

                  <div
                    className={`mt-1 flex flex-wrap items-center gap-1 ${
                      mojaPoruka ? "justify-end" : "justify-start"
                    }`}
                  >
                    {grupe.map((g) => (
                      <button
                        key={g.emoji}
                        type="button"
                        onClick={() => promeniReakciju(poruka.id, g.emoji)}
                        className={`rounded-full border px-1.5 py-0.5 text-xs ${
                          g.moja
                            ? "border-akcent-border bg-akcent-soft"
                            : "border-border bg-card"
                        }`}
                      >
                        {g.emoji} {g.broj}
                      </button>
                    ))}
                    <button
                      type="button"
                      aria-label="Reaguj emotikonom"
                      onClick={() =>
                        setOtvorenPicker(otvorenPicker === poruka.id ? null : poruka.id)
                      }
                      className="rounded-full p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
                    >
                      <Smile className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      aria-label="Odgovori na poruku"
                      onClick={() => setOdgovorNa(poruka)}
                      className="rounded-full p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
                    >
                      <Reply className="size-3.5" />
                    </button>
                  </div>

                  {otvorenPicker === poruka.id && (
                    <div className="mt-1 flex gap-1 rounded-full border border-border bg-card px-2 py-1 shadow-sm">
                      {EMOJIJI.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => promeniReakciju(poruka.id, emoji)}
                          className="rounded-full px-1 text-lg transition-transform hover:scale-125"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            <div ref={dnoRef} />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 border-t border-border p-3">
        {greska && <p className="text-sm text-destructive">{greska}</p>}
        {odgovorNa && (
          <div className="flex items-center justify-between gap-2 rounded-lg bg-secondary px-3 py-1.5 text-xs">
            <p className="line-clamp-1 border-l-2 border-akcent pl-2 text-muted-foreground">
              Odgovaraš na: {odgovorNa.sadrzaj}
            </p>
            <button
              type="button"
              aria-label="Otkaži odgovor"
              onClick={() => setOdgovorNa(null)}
              className="shrink-0 text-muted-foreground hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          </div>
        )}
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
