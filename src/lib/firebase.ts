import { initializeApp, getApps, getApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';

// Configuration minimale pour Firebase Storage
const firebaseConfig = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "burger-house-4a1fd",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "burger-house-4a1fd.appspot.com",
  apiKey: "dummy-api-key-for-storage", // Required by SDK, but not strictly validated for public unauthenticated uploads/downloads if rules permit (or if using a real API key later)
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const storage = getStorage(app);

export { storage };
