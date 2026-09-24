import { createClient } from "@/lib/supabase/server";
import { trenutniFakultet } from "@/lib/fakultet/trenutni";
import { StaMiTrebaWizard } from "@/components/sta-mi-treba-wizard";

export default async function StaMiTrebaPage() {
  const supabase = await createClient();
  const fakultetId = (await trenutniFakultet())?.id ?? "";

  const { data: smerovi } = await supabase
    .from("smerovi")
    .select("id, fakultet_id, naziv")
    .eq("fakultet_id", fakultetId)
    .order("naziv");

  const { data: predmeti } = await supabase
    .from("predmeti")
    .select("id, smer_id, godina, naziv")
    .in("smer_id", (smerovi ?? []).map((s) => s.id))
    .order("naziv");

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center px-4 py-12">
      <h1 className="mb-2 text-[32px] font-bold">Šta mi treba?</h1>
      <p className="mb-8 text-center text-muted-foreground">
        Odgovori na tri kratka pitanja i dobij tačno one materijale koji ti trebaju.
      </p>
      <StaMiTrebaWizard smerovi={smerovi ?? []} predmeti={predmeti ?? []} />
    </main>
  );
}
