export default function UcitavanjeOglasa() {
  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
      <div className="grid gap-8 md:grid-cols-2">
        <div className="aspect-[4/3] w-full animate-pulse rounded-xl bg-muted" />
        <div className="flex flex-col gap-4">
          <div className="h-4 w-24 animate-pulse rounded bg-muted" />
          <div className="h-8 w-3/4 animate-pulse rounded bg-muted" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
          <div className="h-6 w-32 animate-pulse rounded bg-muted" />
          <div className="h-24 w-full animate-pulse rounded bg-muted" />
          <div className="h-32 w-full animate-pulse rounded-xl bg-muted" />
        </div>
      </div>
    </main>
  );
}
