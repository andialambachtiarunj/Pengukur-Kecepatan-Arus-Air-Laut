// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth"; // Tambahkan import ini
import { getDatabase } from "firebase/database"; // Tambahkan import ini
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDNwB4bJazCJh5EEpdSTcfnCj-e3FNJuzQ",
  authDomain: "monitoring-arus-air-laut.firebaseapp.com",
  databaseURL: "https://monitoring-arus-air-laut-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "monitoring-arus-air-laut",
  storageBucket: "monitoring-arus-air-laut.firebasestorage.app",
  messagingSenderId: "506696991706",
  appId: "1:506696991706:web:fc9b333b728749d15676e3",
  measurementId: "G-KJHFYSCXFR"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
