import { initializeApp } from 'firebase/app';
import {
  collection,
  getDocs,
  getFirestore,
  limit,
  query,
  where,
} from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// TODO: Add SDKs for Firebase products that you want to use

// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration

// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {
  apiKey: 'AIzaSyB0na94vbnMfDUwMj4rsmNnlIFnFBOXZyk',
  authDomain: 'next-firebase-c2e3e.firebaseapp.com',
  projectId: 'next-firebase-c2e3e',
  storageBucket: 'next-firebase-c2e3e.appspot.com',
  messagingSenderId: '221766498975',
  appId: '1:221766498975:web:4c7fe17d9efbe5907b40aa',
  measurementId: 'G-3K3VV0BTFB',
};

// Initialize Firebase

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleAuthProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);

export const getUserWithUsername = async (username) => {
  const q = query(
    collection(db, 'users'),
    where('username', '==', username),
    limit(1)
  );
  const userDoc = (await getDocs(q)).docs[0];
  return userDoc;
};

export const postToJSON = (doc) => {
  const data = doc.data();
  return {
    ...data,
    createdAt: data?.createdAt.toMillis() || 0,
    updatedAt: data?.updatedAt.toMillis() || 0,
  };
};
