const CACHE_NAME = "jeux-themes-v1";
const FICHIERS_A_CACHER = [
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FICHIERS_A_CACHER))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((noms) =>
      Promise.all(
        noms
          .filter((nom) => nom !== CACHE_NAME)
          .map((nom) => caches.delete(nom))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // Ne jamais mettre en cache les appels vers Firebase : les jeux 2 et 3
  // gerent eux-memes leur cache de donnees via localStorage pour un
  // controle plus fin (mise a jour manuelle, mode hors ligne).
  if (event.request.url.includes("firebaseio.com") || event.request.url.includes("googleapis.com")) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((reponseEnCache) => {
      return reponseEnCache || fetch(event.request).catch(() => reponseEnCache);
    })
  );
});
