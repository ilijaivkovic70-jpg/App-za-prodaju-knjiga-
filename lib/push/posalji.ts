import "server-only";
import webpush from "web-push";
import type { SupabaseClient } from "@supabase/supabase-js";

type PushPodaci = { title: string; body: string; url: string; tag: string };

let podeseno = false;

function podesiVapid() {
  const javni = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privatni = process.env.VAPID_PRIVATE_KEY;
  if (!javni || !privatni) return false;
  if (!podeseno) {
    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT ?? "mailto:admin@example.com",
      javni,
      privatni
    );
    podeseno = true;
  }
  return true;
}

/** Šalje push svim uređajima primaoca. Greške se gutaju, poruka je već sačuvana. */
export async function posaljiPush(
  supabase: SupabaseClient,
  primalacId: string,
  podaci: PushPodaci
) {
  if (!podesiVapid()) return;

  const { data: pretplate } = await supabase.rpc("pretplate_primaoca", {
    p_primalac_id: primalacId,
  });
  if (!pretplate?.length) return;

  const payload = JSON.stringify(podaci);

  await Promise.all(
    (pretplate as { endpoint: string; p256dh: string; auth: string }[]).map(async (p) => {
      try {
        await webpush.sendNotification(
          { endpoint: p.endpoint, keys: { p256dh: p.p256dh, auth: p.auth } },
          payload,
          { TTL: 60 * 60 * 24 }
        );
      } catch (e) {
        const status = (e as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) {
          await supabase.rpc("ukloni_nevazecu_pretplatu", { p_endpoint: p.endpoint });
        }
      }
    })
  );
}
