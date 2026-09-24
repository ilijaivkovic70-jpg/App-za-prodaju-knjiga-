import { redirect } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { OglasForma } from "@/components/oglas-forma";
import { createClient } from "@/lib/supabase/server";
import { trenutniFakultet } from "@/lib/fakultet/trenutni";
import { trenutniKorisnik } from "@/lib/auth/current-user";

export default async function NoviOglasPage() {
  const supabase = await createClient();
  const fakultetId = (await trenutniFakultet())?.id ?? "";

  const [user, { data: smerovi }, { data: predmeti }] = await Promise.all([
    trenutniKorisnik(),
    supabase
      .from("smerovi")
      .select("id, fakultet_id, naziv")
      .eq("fakultet_id", fakultetId)
      .order("naziv"),
    supabase
      .from("predmeti")
      .select("id, smer_id, godina, naziv")
      .eq("fakultet_id", fakultetId)
      .order("naziv"),
  ]);

  if (!user) {
    redirect("/prijava");
  }

  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">Postavi oglas</CardTitle>
          <CardDescription>
            Popuni podatke o materijalu koji prodaješ ili deliš besplatno.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OglasForma smerovi={smerovi ?? []} predmeti={predmeti ?? []} />
        </CardContent>
      </Card>
    </main>
  );
}
