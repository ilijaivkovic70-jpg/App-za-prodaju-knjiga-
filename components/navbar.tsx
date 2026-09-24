import Link from "next/link";
import { jeAdminEmail } from "@/lib/admin/auth";
import { trenutniKorisnik } from "@/lib/auth/current-user";
import { brojNeprocitanihPoruka } from "@/lib/poruke/unread";
import { LogoutDugme } from "@/components/logout-dugme";
import { TemaPrekidac } from "@/components/tema-prekidac";
import { FakultetPrekidac } from "@/components/fakultet-prekidac";
import { dohvatiFakultete, trenutniFakultet } from "@/lib/fakultet/trenutni";

const NAV_LINKOVI = [
  { href: "/oglasi", naziv: "Oglasi" },
  { href: "/besplatno", naziv: "Besplatno" },
  { href: "/sta-mi-treba", naziv: "Šta mi treba" },
];

export async function Navbar() {
  const user = await trenutniKorisnik();
  const jeAdmin = jeAdminEmail(user?.email);
  const inicijal = (user?.email ?? "?").charAt(0).toUpperCase();
  const brojNeprocitanih = user ? await brojNeprocitanihPoruka(user.id) : 0;
  const [fakulteti, fakultet] = await Promise.all([dohvatiFakultete(), trenutniFakultet()]);

  return (
    <header className="relative z-20">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-5 py-4">
        <Link href="/" className="text-lg font-bold tracking-[-0.02em]">
          INDEKS <span className="text-akcent">KNJIGE</span>
        </Link>

        <nav className="hidden rounded-full border border-border bg-secondary p-1.5 sm:flex">
          {NAV_LINKOVI.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-4 py-2 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-akcent-soft hover:text-akcent"
            >
              {link.naziv}
            </Link>
          ))}
          {user && (
            <Link
              href="/poruke"
              className="relative rounded-full px-4 py-2 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-akcent-soft hover:text-akcent"
            >
              Poruke
              {brojNeprocitanih > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-akcent text-[9px] font-semibold text-white">
                  {brojNeprocitanih > 9 ? "9+" : brojNeprocitanih}
                </span>
              )}
            </Link>
          )}
          {jeAdmin && (
            <Link
              href="/admin"
              className="rounded-full px-4 py-2 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-akcent-soft hover:text-akcent"
            >
              Admin
            </Link>
          )}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          {fakultet && (
            <FakultetPrekidac fakulteti={fakulteti} izabraniId={fakultet.id} />
          )}
          <div className="hidden sm:block">
            <TemaPrekidac />
          </div>
          {user ? (
            <>
              <Link
                href="/oglasi/novi"
                className="grad-akcent rounded-full px-5 py-2.5 text-[13px] font-semibold text-white shadow-[0_8px_28px_oklch(0.55_0.25_300/0.4)]"
              >
                Postavi oglas
              </Link>
              <Link
                href="/moj-profil"
                aria-label="Moj profil"
                className="grad-akcent grid size-9 place-items-center rounded-full text-sm font-semibold text-white"
              >
                {inicijal}
              </Link>
              <div className="hidden sm:block">
                <LogoutDugme />
              </div>
            </>
          ) : (
            <>
              <Link
                href="/prijava"
                className="text-[13px] text-muted-foreground hover:text-foreground"
              >
                Prijava
              </Link>
              <Link
                href="/registracija"
                className="grad-akcent rounded-full px-5 py-2.5 text-[13px] font-semibold text-white shadow-[0_8px_28px_oklch(0.55_0.25_300/0.4)]"
              >
                Registracija
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
