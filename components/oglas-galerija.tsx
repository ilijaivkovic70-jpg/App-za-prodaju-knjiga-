"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function OglasGalerija({
  slike,
  naslov,
  besplatno,
}: {
  slike: string[];
  naslov: string;
  besplatno: boolean;
}) {
  const [aktivna, setAktivna] = useState(0);
  const glavnaSlika = slike[aktivna];

  return (
    <div className="flex flex-col gap-2">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-muted">
        {glavnaSlika ? (
          <Image
            src={glavnaSlika}
            alt={naslov}
            fill
            className="object-cover"
            sizes="(min-width: 768px) 50vw, 100vw"
            priority
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Bez slike
          </div>
        )}
        {besplatno && (
          <span className="absolute right-2 top-2 rounded-lg bg-success px-2 py-1 text-xs font-semibold text-success-foreground">
            BESPLATNO
          </span>
        )}
      </div>

      {slike.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {slike.map((url, i) => (
            <button
              key={url + i}
              type="button"
              onClick={() => setAktivna(i)}
              className={cn(
                "relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted ring-offset-2 transition",
                i === aktivna ? "ring-2 ring-primary" : "opacity-70 hover:opacity-100"
              )}
            >
              <Image src={url} alt={`${naslov} - slika ${i + 1}`} fill className="object-cover" sizes="64px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
