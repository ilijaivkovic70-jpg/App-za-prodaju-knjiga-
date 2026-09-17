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

export default async function NoviOglasPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/prijava");
  }

  const [{ data: smerovi }, { data: predmeti }] = await Promise.all([
    supabase.from("smerovi").select("id, fakultet_id, naziv").order("naziv"),
    supabase.from("predmeti").select("id, smer_id, godina, naziv").order("naziv"),
  ]);

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
