// src/firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyACUjWUguirLtg1yL4mK9sQ-kHaSzrWnjQ",
  authDomain: "site-ffi.firebaseapp.com",
  projectId: "site-ffi",
  storageBucket: "site-ffi.appspot.com",
  messagingSenderId: "1014080667577",
  appId: "1:1014080667577:web:1410b822da0748e03a0068",
  measurementId: "G-004QZBYQSF"
};



// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Exporta o Firestore (banco de dados)
export const db = getFirestore(app);
export const storage = getStorage(app);