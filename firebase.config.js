import { initializeApp } from 'firebase/app';
import { Platform } from 'react-native';
import { initializeAuth, getReactNativePersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase configuration
const firebaseConfig = {
  // Add your Firebase config here
  // You'll need to get this from your Firebase console
  apiKey: "AIzaSyDX1YYJhmHxY8lVjV1XO9V6TFGj_F8zKJU",
  authDomain: "futureself-d8e32.firebaseapp.com",
  projectId: "futureself-d8e32",
  storageBucket: "futureself-d8e32.firebasestorage.app",
  messagingSenderId: "362322545407",
  appId: "1:362322545407:web:9d3131166608b8ee149aca"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = initializeAuth(app, {
  persistence: Platform.OS === 'web'
    ? browserLocalPersistence
    : getReactNativePersistence(AsyncStorage)
});
const firestore = getFirestore(app);
const storage = getStorage(app);
const functions = getFunctions(app);

export { auth, firestore, storage, functions };
export default app;
