import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

/** Dedupe-uje upit kad ga i layout i navbar zovu u istom request-u. */
export const brojNeprocitanihPoruka = cache(async (userId: string) => {
  const supabase = await createClient();
  const { count } = await supabase
    .from("poruke")
    .select("id", { count: "exact", head: true })
    .eq("primalac_id", userId)
    .eq("procitano", false);
  return count ?? 0;
});
