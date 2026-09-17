export function OglasKarticaSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-xl ring-1 ring-foreground/10">
      <div className="aspect-[4/3] w-full bg-muted" />
      <div className="flex flex-col gap-2 bg-card p-4">
        <div className="h-3 w-16 rounded bg-muted" />
        <div className="h-4 w-3/4 rounded bg-muted" />
        <div className="h-3 w-1/2 rounded bg-muted" />
        <div className="mt-1 h-4 w-20 rounded bg-muted" />
      </div>
    </div>
  );
}
