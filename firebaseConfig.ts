import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc, where, query, collection, onSnapshot } from "firebase/firestore";
import { initializeAuth, getReactNativePersistence, getAuth } from "firebase/auth";
import AsyncStorage, { AsyncStorageStatic } from '@react-native-async-storage/async-storage';
import { Platform } from "react-native";


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
import { apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId, measurementId } from "./firebase_secrets";
const firebaseConfig = {
    apiKey: apiKey,
    authDomain: authDomain,
    projectId: projectId,
    storageBucket: storageBucket,
    messagingSenderId: messagingSenderId,
    appId: appId,
    measurementId: measurementId
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
const db = getFirestore(app);
// Initialize Auth with AsyncStorage persistence
// const auth = initializeAuth(app, {
//     persistence: getReactNativePersistence(AsyncStorage),
// });

let auth;

if (Platform.OS === "web") {
    // Web: Use Firebase Auth
    auth = getAuth(app);
} else {
    // React Native: Use Firebase Auth with AsyncStorage
    auth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage),
    });
}

export { app, db, auth, doc, setDoc, getDoc, where, query, collection, onSnapshot };