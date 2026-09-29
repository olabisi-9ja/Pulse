/* PayVault service worker: lets the wallet open and work with no network.
   Pages: network first, cached copy when offline. Static assets: cache first.
   API calls are never cached; the app queues them itself. */
const VERSION = "pv-v2";
const SHELL = ["/en/app", "/fr/app", "/icon.svg", "/icon-192.png", "/manifest.webmanifest"];

const STATIC = /\/_next\/static\/[^"'\s)]+/g;

/** Caches each URL, ignoring failures so one missing file never blocks install. */
async function cacheAll(cache, urls) {
  await Promise.all([...new Set(urls)].map((u) => cache.add(new Request(u, { cache: "reload" })).catch(() => {})));
}

// Precache the shell pages and every script/style they reference, so the very
// first offline launch works even if the worker installed after those loaded.
self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(VERSION);
      await cacheAll(cache, SHELL);
      for (const page of ["/en/app", "/fr/app"]) {
        const res = await cache.match(page);
        if (res) await cacheAll(cache, (await res.text()).match(STATIC) ?? []);
      }
      await self.skipWaiting();
    })(),
  );
});

// The app posts the static files it actually loaded (including lazy chunks).
self.addEventListener("message", (event) => {
  const data = event.data;
  if (data?.type !== "cache" || !Array.isArray(data.urls)) return;
  const urls = data.urls.filter((u) => typeof u === "string" && new URL(u, self.location.origin).pathname.startsWith("/_next/static/"));
  event.waitUntil(caches.open(VERSION).then((c) => cacheAll(c, urls)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

function timeout(ms) {
  return new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), ms));
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith("/api/")) return;

  if (url.pathname.startsWith("/_next/static/") || /\.(?:woff2?|png|svg|ico|webmanifest)$/.test(url.pathname)) {
    event.respondWith(
      caches.match(req).then(
        (hit) =>
          hit ||
          fetch(req).then((res) => {
            if (res.ok) {
              const copy = res.clone();
              caches.open(VERSION).then((c) => c.put(req, copy));
            }
            return res;
          }),
      ),
    );
    return;
  }

  if (req.mode === "navigate") {
    event.respondWith(
      Promise.race([fetch(req), timeout(6000)])
        .then((res) => {
          if (res.ok && !res.redirected) {
            const copy = res.clone();
            caches.open(VERSION).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(async () => {
          const hit = await caches.match(req, { ignoreSearch: true });
          if (hit) return hit;
          const fallback = url.pathname.startsWith("/fr") ? "/fr/app" : "/en/app";
          return (await caches.match(fallback)) || new Response("Offline", { status: 503, headers: { "content-type": "text/plain" } });
        }),
    );
  }
});
