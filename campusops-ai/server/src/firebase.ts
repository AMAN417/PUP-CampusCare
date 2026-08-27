import { initializeApp, getApps, cert, App } from 'firebase-admin/app'
import { getFirestore, Firestore } from 'firebase-admin/firestore'
import { getAuth, Auth } from 'firebase-admin/auth'
import fs from 'fs'

let app: App | undefined
let dbInstance: Firestore | null = null
let authInstance: Auth | null = null

try {
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
  const googleAppCreds = process.env.GOOGLE_APPLICATION_CREDENTIALS

  let hasValidCreds = false

  if (serviceAccountJson) {
    try {
      const sa = JSON.parse(serviceAccountJson)
      if (sa.private_key && sa.client_email) {
        if (!getApps().length) {
          app = initializeApp({ credential: cert(sa) })
        } else {
          app = getApps()[0]
        }
        hasValidCreds = true
      }
    } catch {
      // invalid json
    }
  }

  if (!hasValidCreds && googleAppCreds && fs.existsSync(googleAppCreds)) {
    if (!getApps().length) {
      app = initializeApp()
    } else {
      app = getApps()[0]
    }
    hasValidCreds = true
  }

  if (hasValidCreds && app) {
    dbInstance = getFirestore(app)
    authInstance = getAuth(app)
    console.log('[Firebase] Connected to Firebase Firestore with verified credentials.')
  } else {
    console.warn('[Firebase] Running in local/mock database mode (provide valid FIREBASE_SERVICE_ACCOUNT_JSON with private_key to connect live Firestore).')
  }
} catch (err) {
  console.warn('[Firebase] Init notice:', (err as Error).message)
}

export const db = dbInstance
export const adminAuth = authInstance
export default app
