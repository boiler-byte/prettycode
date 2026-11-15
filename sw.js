/* prettycode. PWA – keep only app files and public formatter libraries in caches.
   Code submitted to the editor is never cached or uploaded by this Service Worker. */
'use strict';
const VERSION = 'v1';
const SHELL_CACHE = 'prettycode-shell-' + VERSION;
const LIB_CACHE = 'prettycode-libraries-' + VERSION;
const SCOPE_URL = new URL(self.registration.scope);
const APP_SHELL = [
  './', './index.html', './manifest.webmanifest',
  './icons/favicon.svg', './icons/icon-192.png',
  './icons/icon-512.png', './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png'
];
const LIBRARY_HOSTS = new Set([
  'cdn.jsdelivr.net', 'unpkg.com', 'cdnjs.cloudflare.com',
  'files.pythonhosted.org', 'pypi.org'
]);
const PRELOAD = [
  [
    "https://cdn.jsdelivr.net/npm/prettier@3.6.2/standalone.js",
    "https://unpkg.com/prettier@3.6.2/standalone.js"
  ],
  [
    "https://cdn.jsdelivr.net/npm/prettier@3.6.2/plugins/babel.js",
    "https://unpkg.com/prettier@3.6.2/plugins/babel.js"
  ],
  [
    "https://cdn.jsdelivr.net/npm/prettier@3.6.2/plugins/estree.js",
    "https://unpkg.com/prettier@3.6.2/plugins/estree.js"
  ],
  [
    "https://cdn.jsdelivr.net/npm/prettier@3.6.2/plugins/html.js",
    "https://unpkg.com/prettier@3.6.2/plugins/html.js"
  ],
  [
    "https://cdn.jsdelivr.net/npm/prettier@3.6.2/plugins/postcss.js",
    "https://unpkg.com/prettier@3.6.2/plugins/postcss.js"
  ],
  [
    "https://cdn.jsdelivr.net/npm/@prettier/plugin-php@0.24.0/standalone.js",
    "https://unpkg.com/@prettier/plugin-php@0.24.0/standalone.js"
  ],
  [
    "https://cdn.jsdelivr.net/npm/sql-formatter@15.6.10/dist/sql-formatter.min.js",
    "https://unpkg.com/sql-formatter@15.6.10/dist/sql-formatter.min.js"
  ],
  [
    "https://cdn.jsdelivr.net/npm/php-parser@3.7.0/dist/php-parser.js",
    "https://unpkg.com/php-parser@3.7.0/dist/php-parser.js"
  ],
  [
    "https://cdn.jsdelivr.net/npm/terser@5.43.1/dist/bundle.min.js",
    "https://unpkg.com/terser@5.43.1/dist/bundle.min.js"
  ],
  [
    "https://cdn.jsdelivr.net/npm/css-tree@3.1.0/dist/csstree.js",
    "https://unpkg.com/css-tree@3.1.0/dist/csstree.js"
  ],
  [
    "https://cdn.jsdelivr.net/npm/html-minifier-terser@7.2.0/dist/htmlminifier.umd.bundle.min.js",
    "https://unpkg.com/html-minifier-terser@7.2.0/dist/htmlminifier.umd.bundle.min.js"
  ],
  [
    "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/highlight.min.js",
    "https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.11.1/build/highlight.min.js"
  ],
  [
    "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/languages/xml.min.js",
    "https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.11.1/build/languages/xml.min.js"
  ],
  [
    "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/languages/css.min.js",
    "https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.11.1/build/languages/css.min.js"
  ],
  [
    "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/languages/javascript.min.js",
    "https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.11.1/build/languages/javascript.min.js"
  ],
  [
    "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/languages/sql.min.js",
    "https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.11.1/build/languages/sql.min.js"
  ],
  [
    "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/languages/php.min.js",
    "https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.11.1/build/languages/php.min.js"
  ],
  [
    "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/languages/python.min.js",
    "https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.11.1/build/languages/python.min.js"
  ],
  [
    "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/languages/json.min.js",
    "https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.11.1/build/languages/json.min.js"
  ],
  [
    "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/languages/php-template.min.js",
    "https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.11.1/build/languages/php-template.min.js"
  ]
];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(SHELL_CACHE);
    await cache.addAll(APP_SHELL.map(path => new URL(path, SCOPE_URL).href));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(name =>
      (name.startsWith('prettycode-shell-') && name !== SHELL_CACHE) ||
      (name.startsWith('prettycode-libraries-') && name !== LIB_CACHE)
    ).map(name => caches.delete(name)));
    await self.clients.claim();
  })());
});

async function cacheFirst(request, name) {
  const cache = await caches.open(name);
  const stored = await cache.match(request);
  if (stored) return stored;
  const response = await fetch(request);
  // Opaque importScripts responses and CORS-enabled libraries are valid cache entries.
  if (response.ok || response.type === 'opaque') {
    try { await cache.put(request, response.clone()); } catch (_) { /* Storage quota. */ }
  }
  return response;
}

async function networkFirstPage(request) {
  try {
    const network = await fetch(request);
    if (network.ok) {
      try { await (await caches.open(SHELL_CACHE)).put(request, network.clone()); } catch (_) {}
    }
    return network;
  } catch (_) {
    const cache = await caches.open(SHELL_CACHE);
    return (await cache.match(request)) ||
      (await cache.match(new URL('./index.html', SCOPE_URL).href)) ||
      Response.error();
  }
}

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin === SCOPE_URL.origin && url.pathname.startsWith(SCOPE_URL.pathname)) {
    event.respondWith(request.mode === 'navigate'
      ? networkFirstPage(request)
      : cacheFirst(request, SHELL_CACHE));
    return;
  }
  if (url.protocol === 'https:' && LIBRARY_HOSTS.has(url.hostname)) {
    event.respondWith(cacheFirst(request, LIB_CACHE));
  }
});

async function prepareLibraries(port) {
  const cache = await caches.open(LIB_CACHE);
  let done = 0;
  let failed = 0;
  // Limit parallel transfers to avoid flooding mobile connections.
  let cursor = 0;
  const workers = Array.from({length: 4}, async () => {
    while (cursor < PRELOAD.length) {
      const paths = PRELOAD[cursor++];
      let available = false;
      for (const url of paths) {
        const request = new Request(url, { mode: 'cors', credentials: 'omit' });
        const saved = await cache.match(request);
        if (saved) { available = true; break; }
        try {
          const response = await fetch(request);
          if (!response.ok && response.type !== 'opaque') continue;
          await cache.put(request, response);
          available = true;
          break;
        } catch (_) { /* Try the second pinned CDN. */ }
      }
      if (!available) failed++;
      done++;
      port.postMessage({ type: 'PROGRESS', done, total: PRELOAD.length });
    }
  });
  await Promise.all(workers);
  port.postMessage({ type: 'DONE', done: done - failed, total: PRELOAD.length, failed });
}

self.addEventListener('message', event => {
  if (event.data?.type !== 'PREPARE_OFFLINE' || !event.ports?.[0]) return;
  const port = event.ports[0];
  event.waitUntil(prepareLibraries(port).catch(error => {
    port.postMessage({ type: 'DONE', done: 0, total: PRELOAD.length, failed: PRELOAD.length,
      error: String(error?.message || error) });
  }));
});
