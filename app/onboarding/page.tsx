import { redirect } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { OnboardingForma } from "@/components/onboarding-forma";
import { createClient } from "@/lib/supabase/server";
import { trenutniKorisnik } from "@/lib/auth/current-user";

export default async function OnboardingPage() {
  const supabase = await createClient();

  const [user, { data: fakulteti }, { data: smerovi }] = await Promise.all([
    trenutniKorisnik(),
    supabase.from("fakulteti").select("id, naziv").order("naziv"),
    supabase.from("smerovi").select("id, fakultet_id, naziv").order("naziv"),
  ]);

  if (!user) {
    redirect("/prijava");
  }

  const { data: profil } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profil) {
    redirect("/");
  }

  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">Popuni profil</CardTitle>
          <CardDescription>
            Ovi podaci nam pomažu da ti prikažemo prave oglase i povežemo te
            sa pravim studentima.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OnboardingForma
            fakulteti={fakulteti ?? []}
            smerovi={smerovi ?? []}
          />
        </CardContent>
      </Card>
    </main>
  );
}
