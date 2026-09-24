import { ImageResponse } from "next/og";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ velicina: string }> }
) {
  const { velicina } = await params;
  const px = velicina === "512" ? 512 : velicina === "180" ? 180 : 192;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
          color: "#fff",
          fontSize: px * 0.42,
          fontWeight: 700,
        }}
      >
        EK
      </div>
    ),
    { width: px, height: px }
  );
}
