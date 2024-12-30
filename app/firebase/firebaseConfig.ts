import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import {getAuth} from '@firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyBm7s3ArxcIS2sGpNj0CQdSA3Dk5WOnRTY",

  authDomain: "yavebeerrating.firebaseapp.com",

  projectId: "yavebeerrating",

  storageBucket: "yavebeerrating.firebasestorage.app",

  messagingSenderId: "499547641976",

  appId: "1:499547641976:web:795f81df95c4477970358d",

  measurementId: "G-R57K4RDX33"

};


const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

const db = getDatabase(app, "https://yavebeerrating-default-rtdb.europe-west1.firebasedatabase.app/");

export { db };