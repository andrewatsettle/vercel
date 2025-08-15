// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDgt-GDl8_rQgFRdmm9KV1RR-fbfatIgpQ",
  authDomain: "settle-4af7c.firebaseapp.com",
  projectId: "settle-4af7c",
  storageBucket: "settle-4af7c.firebasestorage.app",
  messagingSenderId: "397786014586",
  appId: "1:397786014586:web:e9f6ff6dd2eee83c83ecc3",
  measurementId: "G-FTHFWBHTLB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const storage = getStorage(app);
