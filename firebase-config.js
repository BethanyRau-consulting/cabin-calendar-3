(function(){
  // Use same config everywhere
  const firebaseConfig = {
    apiKey: "AIzaSyB9rOOglOPQ0pzOwuFq-P_Puo9lroDPU7A",
    authDomain: "cabincalendar3.firebaseapp.com",
    projectId: "cabincalendar3",
    storageBucket: "cabincalendar3.appspot.com",
    messagingSenderId: "373184478865",
    appId: "1:373184478865:web:cf1e0e816be89107538930"
  };

  if (!window.firebase) {
    console.error("Firebase SDK not loaded. Make sure firebase-app-compat.js is included before firebase-config.js");
    return;
  }

  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }

  window.db = firebase.firestore();
  window.storage = firebase.storage();
})();
