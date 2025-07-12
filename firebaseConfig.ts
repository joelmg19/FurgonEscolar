import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCDLfOC8WG1JBKUXYTNLgX7BYrweC6MP3A",
  projectId: "furgonescolar-e41e8",
  storageBucket: "furgonescolar-e41e8.firebasestorage.app",
  messagingSenderId: "160554863054",
  appId: "1:160554863054:android:225973d8bd44fb34d6039f",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
