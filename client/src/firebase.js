// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "mern-blog2-7a1cc.firebaseapp.com",
  projectId: "mern-blog2-7a1cc",
  storageBucket: "mern-blog2-7a1cc.appspot.com",
  messagingSenderId: "748864185959",
  appId: "1:748864185959:web:4e05cd4d7ccc698ade16c2"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
