import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { jeAdminEmail } from "@/lib/admin/auth";
import { trenutniKorisnik } from "@/lib/auth/current-user";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

async function ucitajBroj(
  upit: PromiseLike<{ count: number | null }>
): Promise<number> {
  const { count } = await upit;
  return count ?? 0;
}

export default async function AdminPage() {
  const supabase = await createClient();
  const user = await trenutniKorisnik();

  if (!jeAdminEmail(user?.email)) {
    redirect("/");
  }

  const [brojKorisnika, brojOglasa, brojProdatih, brojBesplatnih] = await Promise.all([
    ucitajBroj(supabase.from("profiles").select("id", { count: "exact", head: true })),
    ucitajBroj(supabase.from("oglasi").select("id", { count: "exact", head: true })),
    ucitajBroj(
      supabase
        .from("oglasi")
        .select("id", { count: "exact", head: true })
        .eq("status", "prodato")
    ),
    ucitajBroj(
      supabase
        .from("oglasi")
        .select("id", { count: "exact", head: true })
        .eq("besplatno", true)
    ),
  ]);

  const statistike = [
    { naslov: "Registrovani korisnici", vrednost: brojKorisnika },
    { naslov: "Ukupno oglasa", vrednost: brojOglasa },
    { naslov: "Prodato", vrednost: brojProdatih },
    { naslov: "Besplatni oglasi", vrednost: brojBesplatnih },
  ];

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
      <h1 className="mb-6 text-[32px] font-bold">Admin pregled</h1>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {statistike.map((stat) => (
          <Card key={stat.naslov}>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.naslov}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[32px] font-bold">{stat.vrednost}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
