import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "EKOF Knjige",
    short_name: "EKOF Knjige",
    description: "Kupovina i prodaja polovnih udžbenika za studente Ekonomskog fakulteta.",
    start_url: "/",
    display: "standalone",
    background_color: "#0b0b12",
    theme_color: "#0b0b12",
    icons: [
      { src: "/pwa-icon/192", sizes: "192x192", type: "image/png" },
      { src: "/pwa-icon/512", sizes: "512x512", type: "image/png" },
    ],
  };
}
