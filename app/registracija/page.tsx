import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { RegistracijaForma } from "@/components/registracija-forma";
import { createClient } from "@/lib/supabase/server";

export default async function RegistracijaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/");
  }

  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">Napravi nalog</CardTitle>
          <CardDescription>
            Već imaš nalog?{" "}
            <Link href="/prijava" className="text-primary hover:underline">
              Prijavi se
            </Link>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RegistracijaForma />
        </CardContent>
      </Card>
    </main>
  );
}
