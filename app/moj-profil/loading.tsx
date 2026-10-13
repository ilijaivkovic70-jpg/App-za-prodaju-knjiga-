export default function UcitavanjeMogProfila() {
  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
      <div className="mb-6 h-8 w-48 animate-pulse rounded bg-muted" />
      <div className="flex flex-col gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 w-full animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
    </main>
  );
}
