"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type AuthRezultat = { error: string } | undefined;

function mapirajGresku(poruka: string): string {
  if (poruka.includes("already registered") || poruka.includes("already been registered")) {
    return "Nalog sa ovim email-om već postoji.";
  }
  if (poruka.includes("Invalid login credentials")) {
    return "Pogrešan email ili lozinka.";
  }
  if (poruka.includes("Email not confirmed")) {
    return "Email adresa nije potvrđena. Proverite inbox.";
  }
  if (poruka.includes("Password should be at least")) {
    return "Lozinka mora imati najmanje 6 karaktera.";
  }
  if (poruka.includes("email rate limit exceeded")) {
    return "Previše pokušaja slanja email-a u kratkom periodu. Sačekaj malo pa pokušaj ponovo.";
  }
  return "Došlo je do greške. Pokušajte ponovo.";
}

export async function registrujSe(formData: FormData): Promise<AuthRezultat> {
  const email = String(formData.get("email") ?? "").trim();
  const lozinka = String(formData.get("lozinka") ?? "");
  const potvrdaLozinke = String(formData.get("potvrda-lozinke") ?? "");

  if (!email || !lozinka) {
    return { error: "Email i lozinka su obavezni." };
  }
  if (lozinka.length < 6) {
    return { error: "Lozinka mora imati najmanje 6 karaktera." };
  }
  if (lozinka !== potvrdaLozinke) {
    return { error: "Lozinke se ne poklapaju." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({ email, password: lozinka });

  if (error) {
    return { error: mapirajGresku(error.message) };
  }

  redirect("/prijava?registrovan=1");
}

export async function prijaviSe(formData: FormData): Promise<AuthRezultat> {
  const email = String(formData.get("email") ?? "").trim();
  const lozinka = String(formData.get("lozinka") ?? "");

  if (!email || !lozinka) {
    return { error: "Email i lozinka su obavezni." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: lozinka,
  });

  if (error) {
    return { error: mapirajGresku(error.message) };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function odjaviSe(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();

  revalidatePath("/", "layout");
  redirect("/prijava");
}
