import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MojOglasKartica, type MojOglas } from "@/components/moj-oglas-kartica";

export default async function MojProfilPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/prijava");
  }

  const { data: oglasi } = await supabase
    .from("oglasi")
    .select("id, tip, cena, besplatno, godina, slika_url, status, predmeti(naziv)")
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
        <p className="py-12 text-center text-muted-foreground">
          Još uvek nemaš postavljenih oglasa.
        </p>
      )}
    </main>
  );
}
