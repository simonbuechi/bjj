import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDqIXaRumK5xO4MHbe5qAO6wWU992ivk2M",
  authDomain: "bjj-guide-b767b.firebaseapp.com",
  projectId: "bjj-guide-b767b",
  storageBucket: "bjj-guide-b767b.firebasestorage.app",
  messagingSenderId: "396321422637",
  appId: "1:396321422637:web:405fa1dcdd5992259a67a4",
  measurementId: "G-NVX2WTHHV0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app, 'default');
export const storage = getStorage(app);

export default app;
