import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { dohvatiFakultete, trenutniFakultet } from "@/lib/fakultet/trenutni";
import { FakultetBiraci } from "@/components/fakultet-biraci";
import { OglasKartica, type OglasZaKarticu } from "@/components/oglas-kartica";

const PREDNOSTI = [
  {
    br: "01",
    naslov: "Filteri koji rade",
    opis: "Godina, tip materijala, smer, cena. Nema skrolovanja kroz 400 Viber poruka.",
  },
  {
    br: "02",
    naslov: "Besplatna sekcija",
    opis: "Skripte i beleške koje stariji studenti dele bez naknade.",
  },
  {
    br: "03",
    naslov: "Matching",
    opis: "Upiši šta ti treba i dobijaš mejl čim se pojavi oglas za taj predmet.",
  },
  {
    br: "04",
    naslov: "Ocene i verifikacija",
    opis: "Ocena posle svake razmene. Znaš s kim se nalaziš.",
  },
];

const BRZI_FILTERI = [
  { naziv: "1. godina", href: "/oglasi?godina=1" },
  { naziv: "Skripte", href: "/oglasi?tip=skripta" },
  { naziv: "Komplet knjiga", href: "/oglasi?tip=komplet" },
  { naziv: "Samo besplatno", href: "/besplatno" },
];

function zaokruziNadole(broj: number, korak = 10) {
  return Math.floor(broj / korak) * korak;
}

export default async function Home() {
  const supabase = await createClient();
  const [fakulteti, fakultet] = await Promise.all([dohvatiFakultete(), trenutniFakultet()]);
  const fakultetId = fakultet?.id ?? "";
  const [{ data: oglasi }, { count: brojOglasa }, { count: brojProdaja }, { count: brojStudenata }] =
    await Promise.all([
      supabase
        .from("oglasi")
        .select(
          "id, tip, naziv, cena, besplatno, godina, slika_url, smerovi(naziv), created_at, obnovljeno_at"
        )
        .eq("status", "aktivan")
        .eq("fakultet_id", fakultetId)
        .order("obnovljeno_at", { ascending: false })
        .limit(4),
      supabase
        .from("oglasi")
        .select("id", { count: "exact", head: true })
        .eq("status", "aktivan")
        .eq("fakultet_id", fakultetId),
      supabase
        .from("oglasi")
        .select("id", { count: "exact", head: true })
        .eq("status", "prodato")
        .eq("fakultet_id", fakultetId),
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("fakultet_id", fakultetId),
    ]);

  const zaokruzenoOglasa = zaokruziNadole(brojOglasa ?? 0);
  const STATISTIKE = [
    (brojOglasa ?? 0) > 0 && {
      vrednost:
        zaokruzenoOglasa >= 10 ? `${zaokruzenoOglasa}+` : `${brojOglasa}`,
      naziv: `${(brojOglasa ?? 0) === 1 ? "Oglas" : "Oglasa"} na platformi`,
    },
    (brojProdaja ?? 0) > 0 && {
      vrednost: `${brojProdaja}`,
      naziv: `Uspešn${brojProdaja === 1 ? "a prodaja" : "e prodaje"}`,
    },
    (brojStudenata ?? 0) > 0 && {
      vrednost: `${brojStudenata}`,
      naziv: `Student${brojStudenata === 1 ? "" : "a"} se priključilo`,
    },
  ].filter((s): s is { vrednost: string; naziv: string } => Boolean(s));

  return (
    <div className="relative overflow-hidden">
      <div
        aria-hidden
        className="sjaj-akcent pointer-events-none absolute -top-72 left-1/2 h-[720px] w-[1100px] -translate-x-1/2"
      />

      <section className="relative mx-auto w-full max-w-6xl px-5 pb-10 pt-12 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-akcent-border bg-akcent-soft px-3.5 py-1.5 font-mono text-[11px] tracking-[0.1em] text-akcent">
          <span className="size-1.5 rounded-full bg-akcent" />
          NOVI OGLASI SVAKI DAN
        </span>

        <h1 className="mx-auto mt-6 max-w-[26ch] text-[clamp(30px,4.6vw,56px)] font-semibold leading-[1.06] tracking-[-0.04em] text-balance">
          Polovne knjige, skripte i beleške{" "}
          <span className="text-akcent">od starijih studenata</span>
        </h1>

        {fakultet && (
          <FakultetBiraci fakulteti={fakulteti} izabraniId={fakultet.id} />
        )}

        <form
          action="/oglasi"
          className="mx-auto mt-6 flex max-w-[640px] items-center gap-2.5 rounded-full border border-border bg-card py-2 pl-5 pr-2 senka-panel"
        >
          <input
            type="text"
            name="pretraga"
            placeholder="Traži predmet, knjigu ili smer…"
            aria-label="Traži oglase"
            className="min-w-0 flex-1 bg-transparent py-2.5 text-[15px] font-light text-foreground outline-none placeholder:text-muted-foreground"
          />
          <button
            type="submit"
            className="grad-akcent rounded-full px-6 py-3 text-[13px] font-semibold text-white"
          >
            Traži
          </button>
        </form>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {BRZI_FILTERI.map((f) => (
            <Link
              key={f.href}
              href={f.href}
              className="rounded-full border border-border bg-secondary px-4 py-2.5 text-xs text-muted-foreground transition-colors hover:border-akcent-border hover:text-akcent"
            >
              {f.naziv}
            </Link>
          ))}
        </div>

      </section>

      {STATISTIKE.length > 0 && (
        <section className="relative mx-auto w-full max-w-4xl px-5 pb-10">
          <div className="grid grid-cols-1 divide-y divide-border overflow-hidden rounded-[22px] border border-akcent-border bg-akcent-soft sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {STATISTIKE.map((s) => (
              <div
                key={s.naziv}
                className="flex flex-col items-center gap-1 px-6 py-6 text-center"
              >
                <span className="text-[clamp(28px,4vw,38px)] font-bold tracking-[-0.03em] text-akcent">
                  {s.vrednost}
                </span>
                <span className="text-[13px] font-medium text-muted-foreground">
                  {s.naziv}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {oglasi && oglasi.length > 0 && (
        <section className="relative mx-auto w-full max-w-6xl px-5 py-6">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-[23px] font-semibold tracking-[-0.02em]">
                Najnoviji oglasi
              </h2>
              <p className="mt-1.5 text-[13px] font-light text-muted-foreground">
                Od studenta do studenta
              </p>
            </div>
            <Link
              href="/oglasi"
              className="rounded-full border border-input px-4.5 py-2.5 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              Svi oglasi →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {(oglasi as unknown as OglasZaKarticu[]).map((oglas) => (
              <OglasKartica key={oglas.id} oglas={oglas} />
            ))}
          </div>
        </section>
      )}

      <section className="relative mx-auto w-full max-w-6xl px-5 py-10">
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          {PREDNOSTI.map((p) => (
            <div
              key={p.br}
              className="flex flex-col gap-2.5 rounded-[20px] border border-border bg-card p-6"
            >
              <span className="font-mono text-[10px] tracking-[0.16em] text-akcent">
                {p.br}
              </span>
              <h3 className="text-base font-medium">{p.naslov}</h3>
              <p className="text-[13px] font-light leading-relaxed text-muted-foreground">
                {p.opis}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
