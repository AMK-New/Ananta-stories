import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// Replace these with your actual Firebase project config from the Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyCRtaMq7OcpxnsHsmHWZof8gwVXJOgVLkc",
  authDomain: "anantha-stories.firebaseapp.com",
  projectId: "anantha-stories",
  storageBucket: "anantha-stories.firebasestorage.app",
  messagingSenderId: "282002145979",
  appId: "1:282002145979:web:29e11ed31fb1046b175f9e",
  measurementId: "G-D4HHDPC2CY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore and Storage
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;