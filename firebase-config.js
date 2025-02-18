import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 🔥 Firebase の設定（Firebase Console から取得して置き換えてください）
const firebaseConfig = {
  apiKey: "AIzaSyBYtkWuK0sbCYyQcVhLeFWCPhU7GhMG8pg",
  authDomain: "exceldisplay-505fc.firebaseapp.com",
  projectId: "exceldisplay-505fc",
  storageBucket: "exceldisplay-505fc.firebasestorage.app",
  messagingSenderId: "491087347583",
  appId: "1:491087347583:web:64f812b63ad8b6ac0be44a",
  measurementId: "G-D5H647GG6L"
};

// Firebase の初期化
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
