export function Footer() {
  return (
    <footer className="border-t bg-secondary">
      <div className="mx-auto max-w-6xl px-6 py-6 text-sm text-muted-foreground">
        © {new Date().getFullYear()} KNJIGOMAT — studentska razmena knjiga i skripti
      </div>
    </footer>
  );
}
