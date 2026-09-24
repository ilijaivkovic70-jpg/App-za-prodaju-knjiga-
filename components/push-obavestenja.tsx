"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { sacuvajPretplatu, ukloniPretplatu } from "@/lib/push/actions";

function urlBase64ToUint8Array(base64: string) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + padding).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

type Stanje = "ucitavanje" | "nepodrzano" | "iskljuceno" | "ukljuceno" | "blokirano";

/** Uključivanje/isključivanje push obaveštenja o novim porukama na ovom uređaju. */
export function PushObavestenja() {
  const [stanje, setStanje] = useState<Stanje>("ucitavanje");
  const [ios, setIos] = useState(false);
  const [greska, setGreska] = useState<string | null>(null);

  useEffect(() => {
    async function proveri() {
      setIos(/iPad|iPhone|iPod/.test(navigator.userAgent));
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        setStanje("nepodrzano");
        return;
      }
      const registracija = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
        updateViaCache: "none",
      });
      const pretplata = await registracija.pushManager.getSubscription();
      if (pretplata) {
        // Osveži vezu sa nalogom (npr. druga osoba se prijavila na istom uređaju).
        await sacuvajPretplatu(JSON.parse(JSON.stringify(pretplata)));
        setStanje("ukljuceno");
      } else {
        setStanje(Notification.permission === "denied" ? "blokirano" : "iskljuceno");
      }
    }
    proveri().catch(() => setStanje("nepodrzano"));
  }, []);

  async function ukljuci() {
    setGreska(null);
    try {
      const dozvola = await Notification.requestPermission();
      if (dozvola !== "granted") {
        setStanje(dozvola === "denied" ? "blokirano" : "iskljuceno");
        return;
      }
      const registracija = await navigator.serviceWorker.ready;
      const pretplata = await registracija.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
        ),
      });
      const rezultat = await sacuvajPretplatu(JSON.parse(JSON.stringify(pretplata)));
      if ("error" in rezultat) {
        setGreska(rezultat.error ?? "Greška.");
        return;
      }
      setStanje("ukljuceno");
    } catch {
      setGreska("Uključivanje obaveštenja nije uspelo.");
    }
  }

  async function iskljuci() {
    const registracija = await navigator.serviceWorker.ready;
    const pretplata = await registracija.pushManager.getSubscription();
    if (pretplata) {
      await ukloniPretplatu(pretplata.endpoint);
      await pretplata.unsubscribe();
    }
    setStanje("iskljuceno");
  }

  if (stanje === "ucitavanje") return null;

  if (stanje === "nepodrzano") {
    return (
      <p className="mb-4 text-xs text-muted-foreground">
        {ios
          ? "Za obaveštenja na iPhone-u: u Safari-ju tapni Deli → „Dodaj na početni ekran“, pa otvori aplikaciju odatle."
          : "Ovaj pretraživač ne podržava obaveštenja."}
      </p>
    );
  }

  if (stanje === "blokirano") {
    return (
      <p className="mb-4 text-xs text-muted-foreground">
        Obaveštenja su blokirana. Dozvoli ih u podešavanjima pretraživača za ovaj sajt.
      </p>
    );
  }

  return (
    <div className="mb-4 flex flex-col gap-1">
      {stanje === "ukljuceno" ? (
        <Button variant="outline" size="sm" onClick={iskljuci} className="self-start">
          <BellOff className="size-4" /> Isključi obaveštenja
        </Button>
      ) : (
        <Button size="sm" onClick={ukljuci} className="self-start">
          <Bell className="size-4" /> Uključi obaveštenja o porukama
        </Button>
      )}
      {greska && <p className="text-xs text-destructive">{greska}</p>}
    </div>
  );
}
