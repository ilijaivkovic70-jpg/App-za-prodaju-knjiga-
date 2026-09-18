import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { trenutniKorisnik } from "@/lib/auth/current-user";
import { ChatNit } from "@/components/chat-nit";

export default async function PorukeNitPage({
  params,
}: {
  params: Promise<{ oglasId: string; korisnikId: string }>;
}) {
  const { oglasId, korisnikId } = await params;
  const supabase = await createClient();

  const [user, { data: oglas }, { data: sagovornik }] = await Promise.all([
    trenutniKorisnik(),
    supabase.from("oglasi").select("id, naziv").eq("id", oglasId).maybeSingle(),
    supabase.from("profiles").select("user_id, ime").eq("user_id", korisnikId).maybeSingle(),
  ]);

  if (!user) {
    redirect("/prijava");
  }

  if (!oglas || !sagovornik) {
    notFound();
  }

  const [, { data: poruke }] = await Promise.all([
    supabase
      .from("poruke")
      .update({ procitano: true })
      .eq("oglas_id", oglasId)
      .eq("primalac_id", user.id)
      .eq("posiljalac_id", korisnikId)
      .eq("procitano", false),
    supabase
      .from("poruke")
      .select("id, posiljalac_id, sadrzaj, created_at")
      .eq("oglas_id", oglasId)
      .or(
        `and(posiljalac_id.eq.${user.id},primalac_id.eq.${korisnikId}),and(posiljalac_id.eq.${korisnikId},primalac_id.eq.${user.id})`
      )
      .order("created_at", { ascending: true }),
  ]);

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <Link
            href="/poruke"
            className="text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            ← Sve poruke
          </Link>
          <h1 className="text-xl font-semibold">{sagovornik.ime}</h1>
          <Link
            href={`/oglasi/${oglas.id}`}
            className="text-sm text-muted-foreground hover:text-akcent"
          >
            {oglas.naziv}
          </Link>
        </div>
      </div>

      <ChatNit
        oglasId={oglasId}
        sagovornikId={korisnikId}
        trenutniKorisnikId={user.id}
        pocetnePoruke={poruke ?? []}
      />
    </main>
  );
}
