// Petit « service worker » : il rend l'appli installable et la garde disponible pour l'ouvrir.
// Il demande toujours la version la plus récente du site d'abord (pas de vieille page coincée) ;
// la copie gardée ne sert que si le téléphone n'a pas de réseau. Il n'intercepte jamais Firebase ni Google.
var CACHE = "visite-dedette-v1";
var SHELL = ["./", "manifest.webmanifest", "icons/icon-192.png", "icons/icon-512.png"];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(SHELL); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys()
      .then(function (keys) { return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); })); })
      .then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET") return;
  if (new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(
    fetch(req, { cache: "no-cache" })
      .then(function (res) {
        if (res && res.ok) { var copy = res.clone(); caches.open(CACHE).then(function (c) { c.put(req, copy); }).catch(function () {}); }
        return res;
      })
      .catch(function () {
        return caches.match(req, { ignoreSearch: true }).then(function (r) { return r || caches.match("./"); });
      })
  );
});
