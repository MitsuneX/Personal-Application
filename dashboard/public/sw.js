// ─── Nexus Xenon PWA Service Worker v3 ───────────────────────────────────────
// Strategy:
//   • Static assets  → Cache-First (JS/CSS chunks, icons, manifest)
//   • Navigation     → Network-First  (always fresh HTML, offline fallback)
//   • API calls      → Network-First with short timeout, no caching
//   • Fonts/images   → Stale-While-Revalidate

const CACHE_VERSION = "v3";
const STATIC_CACHE  = `nexus-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `nexus-dynamic-${CACHE_VERSION}`;
const OFFLINE_URL   = "/offline.html";

// Assets precached at install time
const PRECACHE_ASSETS = [
  "/",
  "/offline.html",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function isStaticAsset(url) {
  return (
    url.includes("/_next/static/") ||
    url.includes("/icons/") ||
    url.endsWith(".png") ||
    url.endsWith(".svg") ||
    url.endsWith(".webp") ||
    url.endsWith(".ico") ||
    url.endsWith(".woff2") ||
    url.endsWith(".woff") ||
    url.endsWith("manifest.json")
  );
}

function isApiRequest(url) {
  return url.includes("/api/");
}

function isNavigationRequest(request) {
  return request.mode === "navigate";
}

// ── Install: precache shell ───────────────────────────────────────────────────

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// ── Activate: clean stale caches ─────────────────────────────────────────────

self.addEventListener("activate", (event) => {
  const validCaches = [STATIC_CACHE, DYNAMIC_CACHE];
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => !validCaches.includes(key))
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

// ── Fetch: multi-strategy routing ─────────────────────────────────────────────

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = request.url;

  // Skip non-GET and cross-origin
  if (request.method !== "GET") return;
  if (!url.startsWith(self.location.origin)) return;

  // ① API calls → Network-only (never cache sensitive data)
  if (isApiRequest(url)) {
    event.respondWith(fetch(request).catch(() => new Response(
      JSON.stringify({ error: "offline", message: "No network connection" }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    )));
    return;
  }

  // ② Static assets → Cache-First
  if (isStaticAsset(url)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // ③ Navigation → Network-First with offline fallback
  if (isNavigationRequest(request)) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful navigations in dynamic cache
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(async () => {
          // Try cached version first
          const cached = await caches.match(request);
          if (cached) return cached;
          // Fall back to offline page
          return caches.match(OFFLINE_URL);
        })
    );
    return;
  }

  // ④ Everything else → Stale-While-Revalidate
  event.respondWith(
    caches.match(request).then((cached) => {
      const networkFetch = fetch(request).then((response) => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => cache.put(request, clone));
        }
        return response;
      }).catch(() => undefined);

      return cached || networkFetch;
    })
  );
});

// ── Push Notifications (future hook) ─────────────────────────────────────────

self.addEventListener("push", (event) => {
  const data = event.data?.json() ?? {};
  event.waitUntil(
    self.registration.showNotification(data.title || "Nexus Xenon", {
      body: data.body || "",
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
    })
  );
});
