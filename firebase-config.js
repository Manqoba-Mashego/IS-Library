// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBA33plVVUJJkfX5ifidNEERyprtNOG_e8",
  authDomain: "is-library.firebaseapp.com",
  projectId: "is-library",
  storageBucket: "is-library.firebasestorage.app",
  messagingSenderId: "1077152815983",
  appId: "1:1077152815983:web:d89af6e825ff5dfb52269a",
  measurementId: "G-N7M020K24L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const db = getFirestore(app);