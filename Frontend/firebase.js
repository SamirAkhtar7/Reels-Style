// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "reels-food-delivery.firebaseapp.com",
  projectId: "reels-food-delivery",
  storageBucket: "reels-food-delivery.firebasestorage.app",
  messagingSenderId: "914222338094",
  appId: "1:914222338094:web:87963e41ca366675b64fbf",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

export {auth,app}
