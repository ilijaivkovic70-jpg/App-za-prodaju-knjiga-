// Service worker: prikazuje push obaveštenja o novim porukama.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

self.addEventListener("push", (event) => {
  let podaci = {};
  try {
    podaci = event.data ? event.data.json() : {};
  } catch {
    podaci = { body: event.data ? event.data.text() : "" };
  }
  event.waitUntil(
    self.registration.showNotification(podaci.title || "Indeks Knjige", {
      body: podaci.body || "Imaš novu poruku.",
      icon: "/pwa-icon/192",
      badge: "/pwa-icon/192",
      tag: podaci.tag,
      renotify: !!podaci.tag,
      data: { url: podaci.url || "/poruke" },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = new URL(event.notification.data?.url || "/poruke", self.location.origin).href;
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((klijenti) => {
      for (const klijent of klijenti) {
        if (klijent.url === url && "focus" in klijent) return klijent.focus();
      }
      for (const klijent of klijenti) {
        if ("navigate" in klijent && "focus" in klijent) {
          return klijent.navigate(url).then((k) => k && k.focus());
        }
      }
      return self.clients.openWindow(url);
    })
  );
});
