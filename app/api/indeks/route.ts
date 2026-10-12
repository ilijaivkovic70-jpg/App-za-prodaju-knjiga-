import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { after } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { trenutniFakultet } from "@/lib/fakultet/trenutni";
import { posaljiMatchObavestenja } from "@/lib/matching/matching";
import type { OglasZaKarticu } from "@/components/oglas-kartica";

export const maxDuration = 30;

const MODEL = "claude-haiku-4-5-20251001";

const VALIDNI_TIPOVI = ["knjiga", "skripta", "beleske", "zbirka", "komplet", "ostalo"];

const SISTEM_PROMPT = `Ti si Indeks, AI asistent na studentskoj platformi za kupovinu i prodaju polovnih udžbenika, skripti, beležaka i zbirki zadataka.

Student će ti u razgovoru opisati knjigu, skriptu ili materijal koji mu treba (naziv, predmet, godina, tip). Tvoj posao:
1. Pozovi alat "pretrazi_oglase" da pronađeš odgovarajuće aktivne oglase na platformi.
2. Ako pronađeš oglase, kratko i prijateljski ih predstavi (1-2 rečenice), oglasi će biti prikazani studentu kao kartice ispod tvoje poruke — nemoj nabrajati cene i detalje u tekstu, oni su već vidljivi na karticama.
3. Ako ne pronađeš ništa, javi to kratko i, ako imaš dovoljno informacija (naziv predmeta i godina), pozovi alat "sacuvaj_potragu" da sačuvaš potragu — student će dobiti email obaveštenje čim se pojavi odgovarajući oglas. Reci studentu da si to uradio.
4. Ako poruka studenta nije jasna ili fali ključna informacija (npr. koji predmet), postavi kratko dodatno pitanje umesto da nagađaš.
5. Piši isključivo na srpskom, latinicom, kratko i direktno, bez nepotrebnog ćaskanja.`;

type Poruka = { role: "user" | "assistant"; content: string };

const ALATI: Anthropic.Tool[] = [
  {
    name: "pretrazi_oglase",
    description:
      "Pretražuje aktivne oglase na platformi po ključnim rečima (naziv knjige/predmeta), tipu materijala, godini studija i da li je besplatno.",
    input_schema: {
      type: "object",
      properties: {
        tekst: {
          type: "string",
          description: "Ključne reči za pretragu naziva i opisa oglasa, npr. naziv knjige ili predmeta.",
        },
        tip: {
          type: "string",
          enum: VALIDNI_TIPOVI,
          description: "Tip materijala, ako ga je student naveo.",
        },
        godina: {
          type: "integer",
          minimum: 1,
          maximum: 6,
          description: "Godina studija, ako je navedena.",
        },
        besplatno: {
          type: "boolean",
          description: "True ako student traži samo besplatne materijale.",
        },
      },
    },
  },
  {
    name: "sacuvaj_potragu",
    description:
      "Čuva potragu studenta za predmetom kada pretraga ne vrati rezultate, da bi dobio email čim se pojavi odgovarajući oglas. Pozovi samo ako je student prijavljen i ako znaš naziv predmeta i godinu.",
    input_schema: {
      type: "object",
      properties: {
        predmet_naziv: { type: "string", description: "Naziv predmeta." },
        godina: { type: "integer", minimum: 1, maximum: 6 },
      },
      required: ["predmet_naziv", "godina"],
    },
  },
];

function ocistiZaOrFilter(tekst: string) {
  return tekst.replace(/[,()%]/g, " ").trim();
}

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { greska: "Indeks trenutno nije dostupan (nedostaje API ključ)." },
      { status: 503 }
    );
  }

  const body = await request.json();
  const poruke: Poruka[] = Array.isArray(body?.poruke) ? body.poruke : [];
  if (poruke.length === 0) {
    return NextResponse.json({ greska: "Nema poruke." }, { status: 400 });
  }

  const supabase = await createClient();
  const [fakultet, { data: auth }] = await Promise.all([
    trenutniFakultet(),
    supabase.auth.getUser(),
  ]);
  const fakultetId = fakultet?.id ?? "";
  const korisnik = auth?.user ?? null;

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const istorija: Anthropic.MessageParam[] = poruke.map((p) => ({
    role: p.role,
    content: p.content,
  }));

  let pronadjeniOglasi: OglasZaKarticu[] = [];
  let zavrsniTekst = "";

  for (let krug = 0; krug < 4; krug++) {
    const odgovor = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: SISTEM_PROMPT,
      tools: ALATI,
      messages: istorija,
    });

    const tekstDelovi = odgovor.content.filter((deo) => deo.type === "text");
    zavrsniTekst = tekstDelovi.map((deo) => (deo as { text: string }).text).join("\n").trim();

    const pozivi = odgovor.content.filter(
      (deo): deo is Anthropic.ToolUseBlock => deo.type === "tool_use"
    );

    if (pozivi.length === 0) break;

    istorija.push({ role: "assistant", content: odgovor.content });

    const rezultatiAlata: Anthropic.ToolResultBlockParam[] = [];

    for (const poziv of pozivi) {
      if (poziv.name === "pretrazi_oglase") {
        const ulaz = poziv.input as {
          tekst?: string;
          tip?: string;
          godina?: number;
          besplatno?: boolean;
        };

        let upit = supabase
          .from("oglasi")
          .select(
            "id, tip, naziv, cena, besplatno, godina, slika_url, smerovi(naziv), created_at, obnovljeno_at"
          )
          .eq("status", "aktivan")
          .eq("fakultet_id", fakultetId);

        if (ulaz.tip && VALIDNI_TIPOVI.includes(ulaz.tip)) upit = upit.eq("tip", ulaz.tip);
        if (ulaz.godina) upit = upit.eq("godina", ulaz.godina);
        if (ulaz.besplatno) upit = upit.eq("besplatno", true);
        if (ulaz.tekst?.trim()) {
          const tekst = ocistiZaOrFilter(ulaz.tekst);
          upit = upit.or(`naziv.ilike.%${tekst}%,opis.ilike.%${tekst}%`);
        }

        const { data } = await upit.order("obnovljeno_at", { ascending: false }).limit(6);
        const oglasi = (data ?? []) as unknown as OglasZaKarticu[];
        pronadjeniOglasi = oglasi;

        rezultatiAlata.push({
          type: "tool_result",
          tool_use_id: poziv.id,
          content: oglasi.length
            ? `Pronađeno ${oglasi.length} oglasa: ${oglasi.map((o) => o.naziv).join(", ")}.`
            : "Nema aktivnih oglasa koji odgovaraju pretrazi.",
        });
      } else if (poziv.name === "sacuvaj_potragu") {
        const ulaz = poziv.input as { predmet_naziv?: string; godina?: number };

        if (!korisnik || !ulaz.predmet_naziv || !ulaz.godina) {
          rezultatiAlata.push({
            type: "tool_result",
            tool_use_id: poziv.id,
            content: korisnik
              ? "Nedostaje naziv predmeta ili godina, potraga nije sačuvana."
              : "Student nije prijavljen, potraga nije sačuvana. Predloži mu da se prijavi.",
          });
          continue;
        }

        const { data: predmet } = await supabase
          .from("predmeti")
          .select("id")
          .eq("fakultet_id", fakultetId)
          .ilike("naziv", `%${ocistiZaOrFilter(ulaz.predmet_naziv)}%`)
          .limit(1)
          .maybeSingle();

        if (!predmet) {
          rezultatiAlata.push({
            type: "tool_result",
            tool_use_id: poziv.id,
            content: "Predmet nije pronađen u bazi, potraga nije sačuvana.",
          });
          continue;
        }

        const { data: potraga } = await supabase
          .from("trazi_se")
          .insert({
            korisnik_id: korisnik.id,
            predmet_id: predmet.id,
            godina: ulaz.godina,
            smer_id: null,
          })
          .select("id")
          .single();

        if (potraga) {
          after(() => posaljiMatchObavestenja(supabase, potraga.id));
        }

        rezultatiAlata.push({
          type: "tool_result",
          tool_use_id: poziv.id,
          content: "Potraga je sačuvana, student će dobiti email obaveštenje.",
        });
      }
    }

    istorija.push({ role: "user", content: rezultatiAlata });
  }

  return NextResponse.json({
    odgovor: zavrsniTekst || "Nisam uspeo da obradim zahtev, pokušaj ponovo.",
    oglasi: pronadjeniOglasi,
  });
}
