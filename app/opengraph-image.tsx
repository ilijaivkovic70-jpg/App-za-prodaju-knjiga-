import { ImageResponse } from "next/og";

export const alt = "Indeks Knjige";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          padding: "80px",
          background: "#FFFFFF",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 32,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: "#4F46E5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#FFFFFF",
              fontSize: 32,
              fontWeight: 700,
            }}
          >
            E
          </div>
          <div style={{ fontSize: 28, fontWeight: 600, color: "#111827" }}>
            Indeks Knjige
          </div>
        </div>
        <div
          style={{
            fontSize: 56,
            fontWeight: 700,
            color: "#111827",
            lineHeight: 1.1,
            maxWidth: 900,
          }}
        >
          Kupovina i prodaja udžbenika za studente
        </div>
        <div
          style={{
            fontSize: 28,
            color: "#111827",
            opacity: 0.7,
            marginTop: 24,
            maxWidth: 850,
          }}
        >
          Knjige, skripte, beleške i zbirke od studenta do studenta
        </div>
        <div
          style={{
            display: "flex",
            gap: 12,
            marginTop: 48,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "10px 24px",
              borderRadius: 999,
              background: "#22C55E",
              color: "#FFFFFF",
              fontSize: 22,
              fontWeight: 600,
            }}
          >
            BESPLATNO dostupno
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
