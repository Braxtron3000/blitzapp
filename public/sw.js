// public/sw.js
self.addEventListener("install", (event) => {
  console.log("Service Worker installed");
});

self.addEventListener("fetch", (event) => {
  console.log("Intercepting fetch:", event.request.url);
});
