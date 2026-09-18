import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { OcenaForma } from "@/components/ocena-forma";
import { OglasVlasnikAkcije } from "@/components/oglas-vlasnik-akcije";

const NAZIVI_TIPOVA: Record<string, string> = {
  knjiga: "Knjiga",
  skripta: "Skripta",
  beleske: "Beleške",
  zbirka: "Zbirka zadataka",
  komplet: "Komplet knjiga",
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
      "id, tip, naziv, cena, besplatno, godina, opis, slika_url, status, korisnik_id, predmet_id, smer_id, created_at, smerovi(naziv)"
    )
    .eq("id", id)
    .maybeSingle();

  if (!oglas) {
    notFound();
  }

  const { data: brojTrazenja } = oglas.predmet_id
    ? await supabase.rpc("broj_trazenja", {
        p_predmet_id: oglas.predmet_id,
        p_godina: oglas.godina,
        p_smer_id: oglas.smer_id,
      })
    : { data: 0 };

  const { data: profil } = await supabase
    .from("profiles")
    .select("user_id, ime, verifikovan, prosecna_ocena, godina, telefon, fakulteti(naziv)")
    .eq("user_id", oglas.korisnik_id)
    .maybeSingle();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const jeVlasnik = user?.id === oglas.korisnik_id;

  let mozeDaOceni = false;
  if (user && !jeVlasnik && oglas.status === "prodato") {
    const { data: postojecaOcena } = await supabase
      .from("ocene")
      .select("id")
      .eq("oglas_id", oglas.id)
      .eq("ocenio_id", user.id)
      .maybeSingle();
    mozeDaOceni = !postojecaOcena;
  }

  const smerNaziv = jedanNaziv(oglas.smerovi);
  const fakultetNaziv = jedanNaziv(
    profil?.fakulteti as { naziv: string } | { naziv: string }[] | null
  );

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
      <div className="grid gap-8 md:grid-cols-2">
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-muted">
          {oglas.slika_url ? (
            <Image
              src={oglas.slika_url}
              alt={oglas.naziv}
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
              {oglas.naziv}
            </h1>
            <p className="text-sm text-muted-foreground">
              {smerNaziv ? `${smerNaziv}, ` : ""}
              {oglas.godina}. godina
            </p>
            {Number(brojTrazenja ?? 0) > 0 && (
              <p className="mt-1 text-sm font-medium text-primary">
                {brojTrazenja} {Number(brojTrazenja) === 1 ? "student trenutno traži" : "studenata trenutno traži"} ovaj predmet
              </p>
            )}
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
              {profil?.telefon && user && !jeVlasnik && (
                <p className="text-sm text-muted-foreground">
                  Telefon: <span className="text-foreground">{profil.telefon}</span>
                </p>
              )}
            </CardContent>
          </Card>

          {jeVlasnik && <OglasVlasnikAkcije oglasId={oglas.id} />}

          {!jeVlasnik &&
            (user ? (
              <Button
                render={<Link href={`/poruke/${oglas.id}/${oglas.korisnik_id}`} />}
                className="mt-2"
              >
                Pošalji poruku prodavcu
              </Button>
            ) : (
              <Button render={<Link href="/prijava" />} className="mt-2">
                Prijavi se da kontaktiraš prodavca
              </Button>
            ))}

          {mozeDaOceni && (
            <Card>
              <CardContent className="flex flex-col gap-4">
                <p className="text-sm font-semibold">
                  Oceni prodavca za ovaj oglas
                </p>
                <OcenaForma oglasId={oglas.id} />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </main>
  );
}
