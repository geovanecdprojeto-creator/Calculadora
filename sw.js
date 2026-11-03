const CACHE_NAME = 'github-pages-v2';

// Defina aqui todos os arquivos que devem estar disponíveis offline
const ASSETS_TO_CACHE = [
'./',
'./index.html',
// Adicione seus arquivos do projeto abaixo:
// './css/style.css',
// './js/app.js',
// './images/logo.png'
];

// 1. Instalação: Salva todos os recursos estáticos essenciais
self.addEventListener('install', (event) => {
event.waitUntil(
caches.open(CACHE_NAME).then((cache) => {
console.log('[Service Worker] Pré-carregando arquivos no cache...');
return cache.addAll(ASSETS_TO_CACHE);
}).then(() => self.skipWaiting())
);
});

// 2. Ativação: Limpa caches antigos de versões anteriores
self.addEventListener('activate', (event) => {
event.waitUntil(
caches.keys().then((cacheNames) => {
return Promise.all(
cacheNames.map((cache) => {
if (cache !== CACHE_NAME) {
console.log('[Service Worker] Removendo cache antigo:', cache);
return caches.delete(cache);
}
})
);
}).then(() => self.clients.claim())
);
});

// 3. Fetch: Estratégia "Cache First, fallback to Network" (Tenta o cache primeiro; se falhar, busca na rede)
self.addEventListener('fetch', (event) => {
// Ignora requisições de extensões do navegador ou métodos não-GET
if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) {
return;
}

event.respondWith(
caches.match(event.request).then((cachedResponse) => {
if (cachedResponse) {
return cachedResponse;
}

  // Se não estiver no cache, faz a requisição na rede
  return fetch(event.request).then((networkResponse) => {
    // Armazena no cache para chamadas futuras caso seja uma resposta válida
    if (networkResponse && networkResponse.status === 200) {
      const responseToCache = networkResponse.clone();
      caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, responseToCache);
      });
    }
    return networkResponse;
  }).catch((err) => {
    console.error('[Service Worker] Falha no fetch (offline):', err);
  });
})


);
});
