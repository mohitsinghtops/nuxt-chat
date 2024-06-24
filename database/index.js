// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'
import { getDatabase } from 'firebase/database'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
const config = useRuntimeConfig();

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: config.public.FIREBASE_API_KEY,
  authDomain: config.public.FIREBASE_AUTH_DOMAIN,
  projectId: config.public.FIREBASE_PROJECT_ID,
  storageBucket: config.public.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: config.public.FIREBASE_SENDER_ID,
  appId: config.public.FIREBASE_APP_ID,
  measurementId: config.public.FIREBASE_MEASUREMENT_ID
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const analytics = getAnalytics(app)

export const db = getFirestore()
export const storage = getStorage()
