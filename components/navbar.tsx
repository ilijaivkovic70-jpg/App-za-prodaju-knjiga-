import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LogoutDugme } from "@/components/logout-dugme";
import { Button } from "@/components/ui/button";

const NAV_LINKOVI = [
  { href: "/oglasi", naziv: "Oglasi" },
  { href: "/besplatno", naziv: "Besplatno" },
  { href: "/sta-mi-treba", naziv: "Šta mi treba" },
];

export async function Navbar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="text-lg font-bold text-foreground">
          Knjige<span className="text-primary">za</span>Studente
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium sm:flex">
          {NAV_LINKOVI.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-foreground/80 transition-colors hover:text-primary"
            >
              {link.naziv}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link
                href="/moj-profil"
                className="hidden text-sm text-muted-foreground hover:text-foreground sm:inline"
              >
                {user.email}
              </Link>
              <LogoutDugme />
            </>
          ) : (
            <>
              <Link href="/prijava" className="text-sm font-medium hover:text-primary">
                Prijava
              </Link>
              <Button render={<Link href="/registracija" />} size="sm">
                Registracija
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
