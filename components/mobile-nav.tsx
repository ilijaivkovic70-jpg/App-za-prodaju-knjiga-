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
export function MobileNav({
  prijavljen = false,
  brojNeprocitanih = 0,
}: {
  prijavljen?: boolean;
  brojNeprocitanih?: number;
}) {
  const pathname = usePathname();
  const stavke = prijavljen
    ? [...STAVKE, { href: "/poruke", naziv: "Poruke" }]
    : STAVKE;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 flex border-t border-border bg-background/95 px-2 py-4 backdrop-blur sm:hidden">
      {stavke.map((s) => {
        const aktivna = s.href === "/" ? pathname === "/" : pathname.startsWith(s.href);
        return (
          <Link
            key={s.href}
            href={s.href}
            className={`relative flex flex-1 flex-col items-center gap-2 py-1.5 ${
              aktivna ? "text-akcent" : "text-muted-foreground"
            }`}
          >
            <span
              className={`size-2 rounded-full ${aktivna ? "bg-akcent" : "bg-transparent"}`}
            />
            <span className="text-sm font-semibold">{s.naziv}</span>
            {s.href === "/poruke" && brojNeprocitanih > 0 && (
              <span className="absolute right-[16%] top-0 flex size-4 items-center justify-center rounded-full bg-akcent text-[9px] font-semibold text-white">
                {brojNeprocitanih > 9 ? "9+" : brojNeprocitanih}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
