import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PrijavaForma } from "@/components/prijava-forma";
import { createClient } from "@/lib/supabase/server";

export default async function PrijavaPage({
  searchParams,
}: PageProps<"/prijava">) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/");
  }

  const params = await searchParams;
  const registrovan = params?.registrovan === "1";

  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">Prijava</CardTitle>
          <CardDescription>
            Nemaš nalog?{" "}
            <Link href="/registracija" className="text-primary hover:underline">
              Registruj se
            </Link>
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {registrovan && (
            <Alert>
              <AlertDescription>
                Nalog je kreiran. Ako je potvrda email-a uključena, proveri
                inbox pre prijave.
              </AlertDescription>
            </Alert>
          )}
          <PrijavaForma />
        </CardContent>
      </Card>
    </main>
  );
}
