import { initializeApp } from "firebase/app";
import firebase from "firebase/compat/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA83GCQLShhW4koTbeQSlTukNKWwTgR-ZU",
  authDomain: "web-fdr-notification.firebaseapp.com",
  projectId: "web-fdr-notification",
  storageBucket: "web-fdr-notification.appspot.com",
  messagingSenderId: "207781794232",
  appId: "1:207781794232:web:d05b3c6f73d651aad7bf4d"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth();
export const db = getFirestore();

export default firebase;