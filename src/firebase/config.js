/*
const firebaseConfig = {
    apiKey: "AIzaSyAIy8H0IISwoY0mDlL1Abz0ztYEoScqv80",
    authDomain: "o-que-voce-prefere-8bd2f.firebaseapp.com",
    projectId: "o-que-voce-prefere-8bd2f",
    storageBucket: "o-que-voce-prefere-8bd2f.appspot.com",
    messagingSenderId: "1024949863944",
    appId: "1:1024949863944:web:1ea67ca25d88005f0e73bd"
  }; */
  import { initializeApp } from "firebase/app";
  import {getAuth, GoogleAuthProvider} from "firebase/auth";
  import {getFirestore} from "firebase/firestore";
  import {getStorage} from "firebase/storage";
  
  const firebaseConfig = {
    apiKey: "AIzaSyAIy8H0IISwoY0mDlL1Abz0ztYEoScqv80",
    authDomain: "o-que-voce-prefere-8bd2f.firebaseapp.com",
    projectId: "o-que-voce-prefere-8bd2f",
    storageBucket: "o-que-voce-prefere-8bd2f.appspot.com",
    messagingSenderId: "1024949863944",
    appId: "1:1024949863944:web:1ea67ca25d88005f0e73bd"
  };
  
  const app = initializeApp(firebaseConfig);
  
  export const auth = getAuth(app);
  export const provider = new GoogleAuthProvider();
  export const db = getFirestore(app);
  export const storage = getStorage(app);