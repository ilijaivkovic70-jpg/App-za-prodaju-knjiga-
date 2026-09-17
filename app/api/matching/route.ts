import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { posaljiMatchObavestenja } from "@/lib/matching/matching";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Neautorizovano." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const traziSeId = body?.trazi_se_id ? String(body.trazi_se_id) : null;

  if (!traziSeId) {
    return NextResponse.json({ error: "Nedostaje trazi_se_id." }, { status: 400 });
  }

  const rezultat = await posaljiMatchObavestenja(supabase, traziSeId);
  return NextResponse.json(rezultat);
}
