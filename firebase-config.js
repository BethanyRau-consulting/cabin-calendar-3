import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { 
  getFirestore, collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, orderBy, where, serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyB9rOOglOPQ0pzOwuFq-P_Puo9lroDPU7A",
  authDomain: "cabincalendar3.firebaseapp.com",
  projectId: "cabincalendar3",
  storageBucket: "cabincalendar3.appspot.com",
  messagingSenderId: "373184478865",
  appId: "1:373184478865:web:cf1e0e816be89107538930"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export { 
  db, storage,
  collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, orderBy, where, serverTimestamp,
  ref, uploadBytes, getDownloadURL
};
