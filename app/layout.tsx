import type { Metadata } from "next";
import { Sora, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { MobileNav } from "@/components/mobile-nav";

const sora = Sora({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

// Ime varijable ostaje --font-geist-mono da globals.css ostane nepromenjen.
const mono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const NASLOV = "EKOF Knjige";
const OPIS =
  "Kupovina i prodaja polovnih udžbenika, skripti i beleški za studente Ekonomskog fakulteta Beograd.";

const SAJT_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(SAJT_URL),
  title: NASLOV,
  description: OPIS,
  openGraph: {
    title: NASLOV,
    description: OPIS,
    url: SAJT_URL,
    siteName: NASLOV,
    locale: "sr_RS",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: NASLOV,
    description: OPIS,
  },
};

// Postavlja temu pre prvog paint-a da nema bleska pri osvežavanju.
const SKRIPTA_TEME = `
try {
  var t = localStorage.getItem("ekof-tema");
  if (t === "light") document.documentElement.classList.remove("dark");
  else document.documentElement.classList.add("dark");
} catch (e) {}
`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="sr"
      suppressHydrationWarning
      className={`dark ${sora.variable} ${mono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: SKRIPTA_TEME }} />
      </head>
      <body className="flex min-h-full flex-col pb-20 sm:pb-0">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <MobileNav />
        <Analytics />
      </body>
    </html>
  );
}
