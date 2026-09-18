import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { trenutniKorisnik } from "@/lib/auth/current-user";
import { Card, CardContent } from "@/components/ui/card";

type Konverzacija = {
  oglas_id: string;
  sagovornik_id: string;
  poslednja_poruka: string;
  poslednje_vreme: string;
  nije_procitano: number;
};

export default async function PorukePage() {
  const supabase = await createClient();
  const user = await trenutniKorisnik();

  if (!user) {
    redirect("/prijava");
  }

  const { data: konverzacije } = await supabase.rpc("moje_konverzacije");
  const lista = (konverzacije ?? []) as Konverzacija[];

  const oglasIds = [...new Set(lista.map((k) => k.oglas_id))];
  const sagovornikIds = [...new Set(lista.map((k) => k.sagovornik_id))];

  const [{ data: oglasi }, { data: profili }] = await Promise.all([
    oglasIds.length > 0
      ? supabase.from("oglasi").select("id, naziv").in("id", oglasIds)
      : Promise.resolve({ data: [] as { id: string; naziv: string }[] }),
    sagovornikIds.length > 0
      ? supabase.from("profiles").select("user_id, ime").in("user_id", sagovornikIds)
      : Promise.resolve({ data: [] as { user_id: string; ime: string }[] }),
  ]);

  const oglasMap = new Map((oglasi ?? []).map((o) => [o.id, o.naziv]));
  const imeMap = new Map((profili ?? []).map((p) => [p.user_id, p.ime]));

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
      <h1 className="mb-6 text-[32px] font-bold">Poruke</h1>

      {lista.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">
          Još uvek nemaš nijednu konverzaciju. Kontaktiraj prodavca sa stranice
          oglasa da započneš razgovor.
        </p>
      ) : (
        <div className="flex flex-col gap-2.5">
          {lista.map((k) => (
            <Link
              key={`${k.oglas_id}-${k.sagovornik_id}`}
              href={`/poruke/${k.oglas_id}/${k.sagovornik_id}`}
            >
              <Card className="transition-colors hover:border-akcent-border">
                <CardContent className="flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">
                        {imeMap.get(k.sagovornik_id) ?? "Korisnik"}
                      </p>
                      {k.nije_procitano > 0 && (
                        <span className="grad-akcent rounded-full px-2 py-0.5 text-[11px] font-semibold text-white">
                          {k.nije_procitano}
                        </span>
                      )}
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
                      {oglasMap.get(k.oglas_id) ?? "Oglas"}
                    </p>
                    <p className="mt-1 truncate text-sm text-muted-foreground">
                      {k.poslednja_poruka}
                    </p>
                  </div>
                  <p className="shrink-0 text-xs text-muted-foreground">
                    {new Date(k.poslednje_vreme).toLocaleDateString("sr-RS")}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
