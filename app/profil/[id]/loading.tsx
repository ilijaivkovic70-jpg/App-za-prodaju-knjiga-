export default function UcitavanjeProfila() {
  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
      <div className="mb-6 h-32 w-full animate-pulse rounded-xl bg-muted" />
      <div className="h-6 w-40 animate-pulse rounded bg-muted" />
      <div className="mt-4 grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-24 w-full animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
    </main>
  );
}
