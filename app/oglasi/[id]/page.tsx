import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const NAZIVI_TIPOVA: Record<string, string> = {
  knjiga: "Knjiga",
  skripta: "Skripta",
  beleske: "Beleške",
  zbirka: "Zbirka zadataka",
  ostalo: "Ostalo",
};

const NAZIVI_STATUSA: Record<string, string> = {
  prodato: "Prodato",
  neaktivan: "Neaktivan",
};

function jedanNaziv(relacija: { naziv: string } | { naziv: string }[] | null) {
  if (!relacija) return null;
  return Array.isArray(relacija) ? relacija[0]?.naziv ?? null : relacija.naziv;
}

export default async function OglasDetaljPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: oglas } = await supabase
    .from("oglasi")
    .select(
      "id, tip, cena, besplatno, godina, opis, slika_url, status, korisnik_id, created_at, predmeti(naziv), smerovi(naziv)"
    )
    .eq("id", id)
    .maybeSingle();

  if (!oglas) {
    notFound();
  }

  const { data: profil } = await supabase
    .from("profiles")
    .select("user_id, ime, verifikovan, prosecna_ocena, godina, fakulteti(naziv)")
    .eq("user_id", oglas.korisnik_id)
    .maybeSingle();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const jeVlasnik = user?.id === oglas.korisnik_id;

  let prodavacEmail: string | null = null;
  if (user && !jeVlasnik) {
    const { data } = await supabase.rpc("email_prodavca", { oglas_id: oglas.id });
    prodavacEmail = data ?? null;
  }

  const predmetNaziv = jedanNaziv(oglas.predmeti);
  const smerNaziv = jedanNaziv(oglas.smerovi);
  const fakultetNaziv = jedanNaziv(
    profil?.fakulteti as { naziv: string } | { naziv: string }[] | null
  );

  const mailtoHref = prodavacEmail
    ? `mailto:${prodavacEmail}?subject=${encodeURIComponent(
        `Oglas: ${predmetNaziv ?? "materijal"}`
      )}`
    : null;

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
      <div className="grid gap-8 md:grid-cols-2">
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-muted">
          {oglas.slika_url ? (
            <Image
              src={oglas.slika_url}
              alt={predmetNaziv ?? "Oglas"}
              fill
              className="object-cover"
              sizes="(min-width: 768px) 50vw, 100vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Bez slike
            </div>
          )}
          {oglas.besplatno && (
            <span className="absolute right-2 top-2 rounded-lg bg-success px-2 py-1 text-xs font-semibold text-success-foreground">
              BESPLATNO
            </span>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <p className="text-sm text-muted-foreground">
              {NAZIVI_TIPOVA[oglas.tip] ?? oglas.tip}
              {oglas.status !== "aktivan" && (
                <span className="ml-2 rounded-lg bg-warning px-2 py-0.5 text-xs font-semibold text-warning-foreground">
                  {NAZIVI_STATUSA[oglas.status] ?? oglas.status}
                </span>
              )}
            </p>
            <h1 className="text-[32px] font-bold leading-tight">
              {predmetNaziv ?? "Predmet"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {smerNaziv ? `${smerNaziv}, ` : ""}
              {oglas.godina}. godina
            </p>
          </div>

          <p className="text-[24px] font-bold text-primary">
            {oglas.besplatno
              ? "Besplatno"
              : `${Number(oglas.cena).toLocaleString("sr-RS")} RSD`}
          </p>

          {oglas.opis && (
            <p className="whitespace-pre-line text-base text-foreground">
              {oglas.opis}
            </p>
          )}

          <Card>
            <CardContent className="flex flex-col gap-2">
              <p className="text-sm text-muted-foreground">Prodavac</p>
              <Link
                href={`/profil/${oglas.korisnik_id}`}
                className="text-base font-semibold hover:underline"
              >
                {profil?.ime ?? "Korisnik"}
                {profil?.verifikovan && (
                  <span className="ml-1 text-success" title="Verifikovan korisnik">
                    ✓
                  </span>
                )}
              </Link>
              <p className="text-sm text-muted-foreground">
                {[fakultetNaziv, profil?.godina ? `${profil.godina}. godina` : null]
                  .filter(Boolean)
                  .join(", ")}
              </p>
              {profil?.prosecna_ocena != null && (
                <p className="text-sm text-muted-foreground">
                  Prosečna ocena: {Number(profil.prosecna_ocena).toFixed(1)} / 5
                </p>
              )}
            </CardContent>
          </Card>

          {!jeVlasnik &&
            (user ? (
              <Button
                render={<a href={mailtoHref ?? undefined} />}
                className="mt-2"
                disabled={!mailtoHref}
              >
                Kontaktiraj prodavca
              </Button>
            ) : (
              <Button render={<Link href="/prijava" />} className="mt-2">
                Prijavi se da kontaktiraš prodavca
              </Button>
            ))}
        </div>
      </div>
    </main>
  );
}
