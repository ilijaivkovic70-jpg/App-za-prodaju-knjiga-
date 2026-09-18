"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const STAVKE = [
  { href: "/", naziv: "Početna" },
  { href: "/oglasi", naziv: "Oglasi" },
  { href: "/besplatno", naziv: "Besplatno" },
  { href: "/sta-mi-treba", naziv: "Šta mi treba" },
  { href: "/moj-profil", naziv: "Profil" },
];

/** Donja navigacija na telefonu (zamenjuje stari hamburger meni). */
export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 flex border-t border-border bg-background/95 px-2 py-2.5 backdrop-blur sm:hidden">
      {STAVKE.map((s) => {
        const aktivna = s.href === "/" ? pathname === "/" : pathname.startsWith(s.href);
        return (
          <Link
            key={s.href}
            href={s.href}
            className={`flex flex-1 flex-col items-center gap-1.5 py-1 ${
              aktivna ? "text-akcent" : "text-muted-foreground"
            }`}
          >
            <span
              className={`size-1.5 rounded-full ${aktivna ? "bg-akcent" : "bg-transparent"}`}
            />
            <span className="text-[10px] font-medium">{s.naziv}</span>
          </Link>
        );
      })}
    </nav>
  );
}
