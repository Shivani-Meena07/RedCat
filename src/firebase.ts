import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "sinuous-weft-mqvh5",
  appId: "1:901711373284:web:b099e4e9827a2382835df1",
  apiKey: "AIzaSyAn34P-ybrOQtwaTWjO1KB0lP_WP2xgUK4",
  authDomain: "sinuous-weft-mqvh5.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-daa75105-cf39-4aae-a3c6-be52ed36a98a",
  storageBucket: "sinuous-weft-mqvh5.firebasestorage.app",
  messagingSenderId: "901711373284"
};

// Initialize app securely, check if already initialized
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);

// Use the explicit firestore database ID from the app config
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
