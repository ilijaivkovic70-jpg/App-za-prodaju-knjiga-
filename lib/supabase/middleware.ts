import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const ZASTICENI_PREFIKSI = ["/oglasi/novi", "/moj-profil", "/onboarding"];
const AUTH_RUTE = ["/prijava", "/registracija"];

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // getUser() validira token direktno kod Supabase-a, za razliku od getSession()
  // koje samo čita cookie bez provere da li je token još važeći.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const putanja = request.nextUrl.pathname;

  const trazenaZasticenaRuta = ZASTICENI_PREFIKSI.some(
    (prefiks) => putanja === prefiks || putanja.startsWith(`${prefiks}/`)
  );

  if (!user && trazenaZasticenaRuta) {
    const url = request.nextUrl.clone();
    url.pathname = "/prijava";
    return NextResponse.redirect(url);
  }

  if (user && AUTH_RUTE.includes(putanja)) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // TODO (korak 1.1): kad app/onboarding/page.tsx bude gotov, ovde proveriti
  // da li ulogovan korisnik ima red u `profiles` i ako nema, redirect na /onboarding.

  return response;
}
