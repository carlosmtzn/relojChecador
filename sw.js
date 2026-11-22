const NOMBRE_CACHE = "reloj-jornada-v10";
const ARCHIVOS_A_CACHEAR = [
    "./",
    "./index.html",
    "./estilos.css",
    "./aplicacion.js",
    "./manifest.json",
    "./icono.svg"
];

self.addEventListener("install", function(evento) {
    evento.waitUntil(
        caches.open(NOMBRE_CACHE).then(function(cache) {
            return cache.addAll(ARCHIVOS_A_CACHEAR);
        }).then(function() {
            return self.skipWaiting();
        })
    );
});

self.addEventListener("activate", function(evento) {
    evento.waitUntil(
        caches.keys().then(function(nombresDeCache) {
            return Promise.all(
                nombresDeCache.map(function(nombreCacheActual) {
                    if (nombreCacheActual !== NOMBRE_CACHE) {
                        return caches.delete(nombreCacheActual);
                    }
                })
            );
        }).then(function() {
            return self.clients.claim();
        })
    );
});

self.addEventListener("fetch", function(evento) {
    evento.respondWith(
        caches.match(evento.request).then(function(respuestaEnCache) {
            return respuestaEnCache || fetch(evento.request);
        })
    );
});
