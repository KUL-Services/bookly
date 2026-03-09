/* eslint-disable no-restricted-globals */

// Firebase Messaging background service worker.
// Uses the Firebase v8 "compat" CDN builds — the ONLY method supported inside service workers.
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js')

// ---------------------------------------------------------------------------
// Firebase config — must match the values in .env
// The service worker cannot read NEXT_PUBLIC_* env vars at runtime,
// so they are inlined here. Update these if you rotate your Firebase project.
// ---------------------------------------------------------------------------
firebase.initializeApp({
  apiKey: 'AIzaSyBvu8h7pwwgP14PipeM5HRqLqk0fzZIpwM',
  authDomain: 'zerv-225e9.firebaseapp.com',
  projectId: 'zerv-225e9',
  storageBucket: 'zerv-225e9.firebasestorage.app',
  messagingSenderId: '344947630052',
  appId: '1:344947630052:web:ede5e39ca2e775965d71f1'
})

const messaging = firebase.messaging()

// ---------------------------------------------------------------------------
// Background message handler
// Called when a push arrives while the Bookly tab is:
//   - Closed
//   - In the background / minimised
//   - On a different tab
// ---------------------------------------------------------------------------
messaging.onBackgroundMessage(payload => {
  console.log('[firebase-messaging-sw.js] Background message received:', payload)

  const { title, body, icon, image, click_action } = payload.notification || {}
  const data = payload.data || {}

  // Resolve the click target: prefer data.click_action, then notification.click_action, then home
  const targetUrl = data.click_action || click_action || '/'

  self.registration.showNotification(title || 'Zerv Notification', {
    body: body || '',
    icon: icon || '/images/logos/zerv-logo.png',
    image: image,
    badge: '/images/logos/zerv-logo.png',
    data: { targetUrl },
    // Actions shown on desktop (Chrome / Edge only)
    actions: [{ action: 'open', title: 'View Booking' }],
    requireInteraction: false,
    tag: data.bookingId || 'zerv-notification' // Collapses duplicate notifications for the same booking
  })
})

// ---------------------------------------------------------------------------
// Notification click handler
// Opens / focuses the correct booking page when the admin clicks the notification
// ---------------------------------------------------------------------------
self.addEventListener('notificationclick', event => {
  event.notification.close()

  const targetUrl = (event.notification.data && event.notification.data.targetUrl) || '/'

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      // If a Bookly tab is already open, focus it and navigate
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(targetUrl)
          return client.focus()
        }
      }
      // Otherwise open a new tab
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl)
      }
    })
  )
})

// ---------------------------------------------------------------------------
// Lifecycle
// ---------------------------------------------------------------------------
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()))
