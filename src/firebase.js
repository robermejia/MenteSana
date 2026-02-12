import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Reemplaza estas credenciales con las de tu proyecto en Firebase Console
// Puedes crearlo en: https://console.firebase.google.com/
const firebaseConfig = {
    apiKey: "AIzaSyCojSRSZwAXUENXP24UyQMqvMP1784xCyc",
    authDomain: "mentesana-8a914.firebaseapp.com",
    projectId: "mentesana-8a914",
    storageBucket: "mentesana-8a914.firebasestorage.app",
    messagingSenderId: "56771090881",
    appId: "1:56771090881:web:a975906e293c371974f740"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
