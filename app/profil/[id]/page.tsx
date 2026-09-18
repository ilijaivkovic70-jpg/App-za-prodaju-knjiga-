import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { trenutniKorisnik } from "@/lib/auth/current-user";
import { Card, CardContent } from "@/components/ui/card";
import { OglasKartica, type OglasZaKarticu } from "@/components/oglas-kartica";

function jedanNaziv(relacija: { naziv: string } | { naziv: string }[] | null) {
  if (!relacija) return null;
  return Array.isArray(relacija) ? relacija[0]?.naziv ?? null : relacija.naziv;
}

function nazivZaBrojOcena(broj: number) {
  if (broj === 1) return "ocena";
  if (broj >= 2 && broj <= 4) return "ocene";
  return "ocena";
}

export default async function JavniProfilPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: profil }, user, { count: brojProdaja }, { count: brojOcena }, { data: oglasi }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("user_id, ime, verifikovan, prosecna_ocena, godina, telefon, fakulteti(naziv)")
        .eq("user_id", id)
        .maybeSingle(),
      trenutniKorisnik(),
      supabase
        .from("oglasi")
        .select("id", { count: "exact", head: true })
        .eq("korisnik_id", id)
        .eq("status", "prodato"),
      supabase
        .from("ocene")
        .select("id", { count: "exact", head: true })
        .eq("ocenjeni_id", id),
      supabase
        .from("oglasi")
        .select("id, tip, naziv, cena, besplatno, godina, slika_url, smerovi(naziv)")
        .eq("korisnik_id", id)
        .eq("status", "aktivan")
        .order("created_at", { ascending: false }),
    ]);

  if (!profil) {
    notFound();
  }

  const fakultetNaziv = jedanNaziv(profil.fakulteti);

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
      <Card>
        <CardContent className="flex flex-col gap-2">
          <h1 className="text-[32px] font-bold leading-tight">
            {profil.ime}
            {profil.verifikovan && (
              <span
                className="ml-2 align-middle text-sm font-semibold text-success"
                title="Verifikovan student"
              >
                ✓ Verifikovan student
              </span>
            )}
          </h1>
          <p className="text-sm text-muted-foreground">
            {[fakultetNaziv, profil.godina ? `${profil.godina}. godina` : null]
              .filter(Boolean)
              .join(", ")}
          </p>
          <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
            <span>
              {profil.prosecna_ocena != null
                ? `Prosečna ocena: ${Number(profil.prosecna_ocena).toFixed(1)} / 5 (${brojOcena ?? 0} ${nazivZaBrojOcena(
                    brojOcena ?? 0
                  )})`
                : "Još uvek nema ocena"}
            </span>
            <span>{brojProdaja ?? 0} realizovanih prodaja</span>
          </div>
          {profil.telefon && user && (
            <p className="mt-1 text-sm text-muted-foreground">
              Telefon: <span className="text-foreground">{profil.telefon}</span>
            </p>
          )}
        </CardContent>
      </Card>

      <h2 className="mb-4 mt-8 text-[24px] font-bold">Aktivni oglasi</h2>
      {oglasi && oglasi.length > 0 ? (
        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(oglasi as unknown as OglasZaKarticu[]).map((oglas) => (
            <OglasKartica key={oglas.id} oglas={oglas} />
          ))}
        </div>
      ) : (
        <p className="py-12 text-center text-muted-foreground">
          Ovaj korisnik trenutno nema aktivnih oglasa.
        </p>
      )}
    </main>
  );
}
