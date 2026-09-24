"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { dohvatiFakultete, FAKULTET_KOLACIC } from "@/lib/fakultet/trenutni";

export async function postaviFakultet(fakultetId: string): Promise<void> {
  const fakulteti = await dohvatiFakultete();
  if (!fakulteti.some((f) => f.id === fakultetId)) return;

  const cookieStore = await cookies();
  cookieStore.set(FAKULTET_KOLACIC, fakultetId, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  revalidatePath("/", "layout");
}
