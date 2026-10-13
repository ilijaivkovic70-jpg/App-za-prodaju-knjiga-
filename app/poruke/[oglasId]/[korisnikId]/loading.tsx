export default function UcitavanjeChata() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-3 px-4 py-8">
      <div className="mb-2 h-10 w-full animate-pulse rounded-xl bg-muted" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className={
            "h-10 animate-pulse rounded-xl bg-muted " +
            (i % 2 === 0 ? "w-2/3 self-start" : "w-1/2 self-end")
          }
        />
      ))}
    </main>
  );
}
