import { IndeksChat } from "@/components/indeks-chat";

export default function StaMiTrebaPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center px-4 py-12">
      <h1 className="mb-2 text-[32px] font-bold">Indeks</h1>
      <p className="mb-8 text-center text-muted-foreground">
        Napiši šta ti treba, Indeks pretražuje oglase i šalje ih pravo u razgovor.
      </p>
      <IndeksChat />
    </main>
  );
}
