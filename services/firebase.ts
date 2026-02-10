// FIREBASE DISABLED FOR DEMO MODE
// Using localStorage instead for simplified demo experience.

/*
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCC_NQNSLGTzEV4o3DFSwl00vSKFo6lXi4",
  authDomain: "myhomework-d5af2.firebaseapp.com",
  projectId: "myhomework-d5af2",
  storageBucket: "myhomework-d5af2.firebasestorage.app",
  messagingSenderId: "267103207607",
  appId: "1:267103207607:web:895c0d557090fefad94d32",
  measurementId: "G-0Q8BJZ0BLM"
};

// Initialize Firebase only if not already initialized
const app = !firebase.apps.length 
  ? firebase.initializeApp(firebaseConfig) 
  : firebase.app();

export const auth = firebase.auth();
export const db = firebase.firestore();
export const storage = firebase.storage();
export const googleProvider = new firebase.auth.GoogleAuthProvider();
*/

export const auth = {} as any;
export const db = {} as any;
export const storage = {} as any;
export const googleProvider = {} as any;
