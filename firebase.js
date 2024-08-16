import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
 apiKey: process.env.FIREBASE_API_KEY,
 authDomain: process.env.FIREBASE_AUTH_DOMAIN,
 projectId: process.env.FIREBASE_PROJ_ID,
 storageBucket: process.env.FIREBASE_STORAGE,
 messagingSenderId: process.env.FIREBASE_MSG_SENDER,
 appId: process.env.FIREBASE_APP_ID
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
export default db;