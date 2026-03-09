'use client'

import { NotificationsService } from '@/lib/api/services/notifications.service'

const PUSH_TOKEN_STORAGE_KEY = 'zerv_push_fcm_token'
const PUSH_IDENTITY_STORAGE_KEY = 'zerv_push_identity'
const PUSH_DEVICE_ID_STORAGE_KEY = 'zerv_push_device_id'

export type PushSyncResult = 'synced' | 'skipped' | 'auth_error' | 'transient_error'

type FirebaseMessagingContext = {
  getToken: (options?: { vapidKey?: string; serviceWorkerRegistration?: ServiceWorkerRegistration }) => Promise<string>
  serviceWorkerRegistration: ServiceWorkerRegistration
}

const FIREBASE_WEB_CONFIG = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
}

function hasFirebaseWebConfig() {
  return Object.values(FIREBASE_WEB_CONFIG).every(Boolean)
}

function isAuthErrorMessage(message?: string) {
  if (!message) return false
  const value = message.toLowerCase()
  return value.includes('401') || value.includes('403') || value.includes('unauthorized') || value.includes('forbidden')
}

export function getStoredPushToken() {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(PUSH_TOKEN_STORAGE_KEY)
}

export function setStoredPushToken(token: string) {
  if (typeof window === 'undefined') return
  localStorage.setItem(PUSH_TOKEN_STORAGE_KEY, token)
}

export function clearStoredPushToken() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(PUSH_TOKEN_STORAGE_KEY)
}

export function getStoredPushIdentity() {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(PUSH_IDENTITY_STORAGE_KEY)
}

export function setStoredPushIdentity(identity: string) {
  if (typeof window === 'undefined') return
  localStorage.setItem(PUSH_IDENTITY_STORAGE_KEY, identity)
}

export function clearStoredPushIdentity() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(PUSH_IDENTITY_STORAGE_KEY)
}

export function getOrCreatePushDeviceId() {
  if (typeof window === 'undefined') return undefined

  const existing = localStorage.getItem(PUSH_DEVICE_ID_STORAGE_KEY)
  if (existing) return existing

  const generated = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `web-${Date.now()}`
  localStorage.setItem(PUSH_DEVICE_ID_STORAGE_KEY, generated)
  return generated
}

export async function unregisterPushTokenBestEffort(authToken?: string | null, explicitToken?: string | null) {
  const token = explicitToken || getStoredPushToken()
  if (!token || !authToken || typeof window === 'undefined') {
    clearStoredPushToken()
    clearStoredPushIdentity()
    return
  }

  try {
    await fetch('/api/proxy/notifications/push-tokens', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({ token })
    })
  } catch (error) {
    console.warn('Failed to unregister push token on logout:', error)
  } finally {
    clearStoredPushToken()
    clearStoredPushIdentity()
  }
}

async function getFirebaseMessagingContext(): Promise<FirebaseMessagingContext | null> {
  if (typeof window === 'undefined') return null
  if (!hasFirebaseWebConfig()) return null
  if (!('Notification' in window) || !('serviceWorker' in navigator)) return null

  const { initializeApp, getApps, getApp } = await import('firebase/app')
  const { getMessaging, getToken, isSupported } = await import('firebase/messaging')

  const supported = await isSupported().catch(() => false)
  if (!supported) return null

  const firebaseApp = getApps().length ? getApp() : initializeApp(FIREBASE_WEB_CONFIG)
  const serviceWorkerRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js')
  const messaging = getMessaging(firebaseApp)

  return {
    getToken: options => getToken(messaging, options),
    serviceWorkerRegistration
  }
}

export async function syncPushTokenForIdentity(identity: string): Promise<PushSyncResult> {
  if (typeof window === 'undefined') return 'skipped'
  if (!('Notification' in window)) return 'skipped'

  if (Notification.permission === 'denied') {
    const existingToken = getStoredPushToken()
    if (existingToken) {
      const deleteResponse = await NotificationsService.deletePushToken({ token: existingToken })
      if (deleteResponse.error && isAuthErrorMessage(deleteResponse.error)) {
        return 'auth_error'
      }
    }
    clearStoredPushToken()
    clearStoredPushIdentity()
    return 'skipped'
  }

  const permission = Notification.permission === 'granted' ? 'granted' : await Notification.requestPermission()
  if (permission !== 'granted') return 'skipped'

  const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
  const messagingCtx = await getFirebaseMessagingContext()
  if (!messagingCtx || !vapidKey) return 'skipped'

  const token = await messagingCtx.getToken({
    vapidKey,
    serviceWorkerRegistration: messagingCtx.serviceWorkerRegistration
  })

  if (!token) return 'skipped'

  const existingToken = getStoredPushToken()
  const existingIdentity = getStoredPushIdentity()
  if (existingToken === token && existingIdentity === identity) {
    return 'skipped'
  }

  const response = await NotificationsService.registerPushToken({
    token,
    platform: 'web',
    deviceId: getOrCreatePushDeviceId(),
    appVersion: process.env.NEXT_PUBLIC_APP_VERSION,
    locale: typeof navigator !== 'undefined' ? navigator.language : undefined
  })

  if (response.error) {
    console.warn('Failed to register push token:', response.error)
    return isAuthErrorMessage(response.error) ? 'auth_error' : 'transient_error'
  }

  setStoredPushToken(token)
  setStoredPushIdentity(identity)
  return 'synced'
}
