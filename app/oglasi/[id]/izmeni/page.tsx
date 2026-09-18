import { notFound, redirect } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { OglasIzmenaForma } from "@/components/oglas-izmena-forma";
import { createClient } from "@/lib/supabase/server";
import { trenutniKorisnik } from "@/lib/auth/current-user";

export default async function IzmeniOglasPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const user = await trenutniKorisnik();

  if (!user) {
    redirect("/prijava");
  }

  const { data: oglas } = await supabase
    .from("oglasi")
    .select("id, naziv, cena, besplatno, opis, korisnik_id")
    .eq("id", id)
    .eq("korisnik_id", user.id)
    .maybeSingle();

  if (!oglas) {
    notFound();
  }

  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">Izmeni oglas</CardTitle>
          <CardDescription>
            Ažuriraj naziv, cenu, opis ili sliku svog oglasa.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OglasIzmenaForma
            oglasId={oglas.id}
            pocetniNaziv={oglas.naziv}
            pocetnaCena={oglas.cena}
            pocetnoBesplatno={oglas.besplatno}
            pocetniOpis={oglas.opis}
          />
        </CardContent>
      </Card>
    </main>
  );
}
