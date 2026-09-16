/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// If the loader is already loaded, just stop.
if (!self.define) {
  let registry = {};

  // Used for `eval` and `importScripts` where we can't get script URL by other means.
  // In both cases, it's safe to use a global var because those functions are synchronous.
  let nextDefineUri;

  const singleRequire = (uri, parentUri) => {
    uri = new URL(uri + ".js", parentUri).href;
    return registry[uri] || (
      
        new Promise(resolve => {
          if ("document" in self) {
            const script = document.createElement("script");
            script.src = uri;
            script.onload = resolve;
            document.head.appendChild(script);
          } else {
            nextDefineUri = uri;
            importScripts(uri);
            resolve();
          }
        })
      
      .then(() => {
        let promise = registry[uri];
        if (!promise) {
          throw new Error(`Module ${uri} didn’t register its module`);
        }
        return promise;
      })
    );
  };

  self.define = (depsNames, factory) => {
    const uri = nextDefineUri || ("document" in self ? document.currentScript.src : "") || location.href;
    if (registry[uri]) {
      // Module is already loading or loaded.
      return;
    }
    let exports = {};
    const require = depUri => singleRequire(depUri, uri);
    const specialDeps = {
      module: { uri },
      exports,
      require
    };
    registry[uri] = Promise.all(depsNames.map(
      depName => specialDeps[depName] || require(depName)
    )).then(deps => {
      factory(...deps);
      return exports;
    });
  };
}
define(['./workbox-afac4cd2'], (function (workbox) { 'use strict';

  self.skipWaiting();
  workbox.clientsClaim();
  /**
   * The precacheAndRoute() method efficiently caches and responds to
   * requests for URLs in the manifest.
   * See https://goo.gl/S9QRab
   */
  workbox.precacheAndRoute([{
    "url": "registerSW.js",
    "revision": "1872c500de691dce40960bb85481de07"
  }, {
    "url": "pwa-maskable-512x512.png",
    "revision": "9339c90a81a6e9a627cbefa18f39fe3d"
  }, {
    "url": "pwa-512x512.png",
    "revision": "56cff63885547bb8edd77626c801cb22"
  }, {
    "url": "pwa-192x192.png",
    "revision": "2f5a3ea037789b95a8df91d5590302df"
  }, {
    "url": "index.html",
    "revision": "5bf871d71232e0b294ee8a293f7b94cf"
  }, {
    "url": "icon.svg",
    "revision": "d76f93b2b89dfedbc5eaf62aeb5ac308"
  }, {
    "url": "favicon.png",
    "revision": "ecee6290d91059246d61722953aa4172"
  }, {
    "url": "favicon.ico",
    "revision": "85b56e363607a4ac3a444fcdfa66276a"
  }, {
    "url": "apple-touch-icon.png",
    "revision": "9f0da55f50c9c0855af90e2b423bc91e"
  }, {
    "url": "assets/index-vM7wccjW.js",
    "revision": null
  }, {
    "url": "assets/index-CGKNsn2v.css",
    "revision": null
  }, {
    "url": "apple-touch-icon.png",
    "revision": "9f0da55f50c9c0855af90e2b423bc91e"
  }, {
    "url": "favicon.ico",
    "revision": "85b56e363607a4ac3a444fcdfa66276a"
  }, {
    "url": "favicon.png",
    "revision": "ecee6290d91059246d61722953aa4172"
  }, {
    "url": "icon.svg",
    "revision": "d76f93b2b89dfedbc5eaf62aeb5ac308"
  }, {
    "url": "pwa-192x192.png",
    "revision": "2f5a3ea037789b95a8df91d5590302df"
  }, {
    "url": "pwa-512x512.png",
    "revision": "56cff63885547bb8edd77626c801cb22"
  }, {
    "url": "pwa-maskable-512x512.png",
    "revision": "9339c90a81a6e9a627cbefa18f39fe3d"
  }, {
    "url": "manifest.webmanifest",
    "revision": "bdb5d44b5ac3f9bd643baa3b9a79f5cf"
  }], {});
  workbox.cleanupOutdatedCaches();
  workbox.registerRoute(new workbox.NavigationRoute(workbox.createHandlerBoundToURL("index.html")));
  workbox.registerRoute(/^https:\/\/fonts\.googleapis\.com\/.*/i, new workbox.CacheFirst({
    "cacheName": "google-fonts-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 10,
      maxAgeSeconds: 31536000
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');
  workbox.registerRoute(/^https:\/\/fonts\.gstatic\.com\/.*/i, new workbox.CacheFirst({
    "cacheName": "gstatic-fonts-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 10,
      maxAgeSeconds: 31536000
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');

}));
