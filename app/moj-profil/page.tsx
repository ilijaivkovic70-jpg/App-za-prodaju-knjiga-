import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { trenutniKorisnik } from "@/lib/auth/current-user";
import { MojOglasKartica, type MojOglas } from "@/components/moj-oglas-kartica";
import { Button } from "@/components/ui/button";

export default async function MojProfilPage() {
  const supabase = await createClient();
  const user = await trenutniKorisnik();

  if (!user) {
    redirect("/prijava");
  }

  const { data: oglasi } = await supabase
    .from("oglasi")
    .select("id, tip, naziv, cena, besplatno, godina, slika_url, status")
    .eq("korisnik_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
      <h1 className="mb-6 text-[32px] font-bold">Moji oglasi</h1>
      {oglasi && oglasi.length > 0 ? (
        <div className="flex flex-col gap-4">
          {(oglasi as unknown as MojOglas[]).map((oglas) => (
            <MojOglasKartica key={oglas.id} oglas={oglas} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <p className="text-muted-foreground">
            Još uvek nemaš postavljenih oglasa.
          </p>
          <Button render={<Link href="/oglasi/novi" />} variant="outline">
            Postavi prvi oglas
          </Button>
        </div>
      )}
    </main>
  );
}
