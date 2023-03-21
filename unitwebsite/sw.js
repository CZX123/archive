'use strict';

var _cache = 'cache';
var urlsToCache = [
	'.',
	'ac',
	'exco',
	'index',
	'info',
	'links',
	'officers',
	'roh',
	'flickity.min.css',
	'font.css',
	'style.min.css',
	'font.js',
	'flickity.pkgd.min.js',
	'script.min.js',
	'images/instagram-black.svg',
	'images/instagram-color.svg',
	'fonts/roboto-subset.woff2',
	'fonts/roboto.woff2',
	'fonts/roboto-medium.woff2',
	'fonts/roboto-italic.woff2',
	'fonts/renner.woff2',
	'fonts/renner-medium.woff2'
];

self.addEventListener('install', function(evt) {
	self.skipWaiting();
	evt.waitUntil(
		caches.open(_cache).then(function(cache) {
			return cache.addAll(urlsToCache);
		})
	);
});

self.addEventListener('fetch', function(evt) {
	evt.respondWith(
		fetch(evt.request).then(function(response) {
			return caches.open(_cache).then(function(cache) {
				cache.put(evt.request, response.clone());
				return response;
			});
		}).catch(function() {
			return caches.match(evt.request);
		})
	);
});
