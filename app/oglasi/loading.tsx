import { OglasKarticaSkeleton } from "@/components/oglas-kartica-skeleton";

export default function UcitavanjeOglasa() {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
      <div className="mb-6 h-8 w-32 animate-pulse rounded bg-muted" />
      <div className="mb-6 h-32 animate-pulse rounded-xl bg-muted" />
      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <OglasKarticaSkeleton key={i} />
        ))}
      </div>
    </main>
  );
}
