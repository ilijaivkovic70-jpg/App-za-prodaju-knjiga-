function adminEmailovi(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function jeAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return adminEmailovi().includes(email.toLowerCase());
}
