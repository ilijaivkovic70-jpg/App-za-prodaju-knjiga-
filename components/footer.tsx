export function Footer() {
  return (
    <footer className="border-t bg-secondary">
      <div className="mx-auto max-w-6xl px-6 py-6 text-sm text-muted-foreground">
        © {new Date().getFullYear()} KnjigeZaStudente — Ekonomski fakultet Beograd
      </div>
    </footer>
  );
}
