import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDYpTdyGyolsZPwUP75PN7FSUndFca-BHo",
  authDomain: "travel-planner-9bb10.firebaseapp.com",
  projectId: "travel-planner-9bb10",
  storageBucket: "travel-planner-9bb10.firebasestorage.app",
  messagingSenderId: "668827425148",
  appId: "1:668827425148:web:96ec534b49bdcaba4b6cf9"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
