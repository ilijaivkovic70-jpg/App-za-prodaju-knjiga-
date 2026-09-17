"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const NAV_LINKOVI = [
  { href: "/oglasi", naziv: "Oglasi" },
  { href: "/besplatno", naziv: "Besplatno" },
  { href: "/sta-mi-treba", naziv: "Šta mi treba" },
];

export function MobileNav() {
  const [otvoreno, setOtvoreno] = useState(false);

  return (
    <div className="sm:hidden">
      <Button
        variant="ghost"
        size="icon"
        aria-label={otvoreno ? "Zatvori meni" : "Otvori meni"}
        onClick={() => setOtvoreno((v) => !v)}
      >
        {otvoreno ? <X className="size-5" /> : <Menu className="size-5" />}
      </Button>
      {otvoreno && (
        <nav className="absolute inset-x-0 top-16 z-50 flex flex-col gap-4 border-b bg-background px-6 py-4 text-sm font-medium shadow-md animate-in fade-in slide-in-from-top-2 duration-200">
          {NAV_LINKOVI.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOtvoreno(false)}
              className="text-foreground/80 hover:text-primary"
            >
              {link.naziv}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}
