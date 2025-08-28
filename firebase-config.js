mport { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyB9rOOglOPQ0pzOwuFq-P_Puo9lroDPU7A",
  authDomain: "cabincalendar3.firebaseapp.com",
  projectId: "cabincalendar3",
  storageBucket: "cabincalendar3.appspot.com",
  messagingSenderId: "373184478865",
  appId: "1:373184478865:web:cf1e0e816be89107538930"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export {
  db,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  orderBy
};
