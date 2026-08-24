import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  User as FirebaseUser,
  Auth
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  Firestore
} from 'firebase/firestore';
import { UserRole } from '../types';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyC_XcfJLWyYbb7kR1alyeED4B2mCZn8y-s',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || `${import.meta.env.VITE_FIREBASE_PROJECT_ID || 'livebillboards-production'}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'livebillboards-production',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || `${import.meta.env.VITE_FIREBASE_PROJECT_ID || 'livebillboards-production'}.firebasestorage.app`,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '629783299757',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:629783299757:web:84f7cf53685c063eee6824',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || ''
};

// Initialize Firebase App safely
let app: FirebaseApp;
let authInstance: Auth;
let dbInstance: Firestore;

try {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
} catch (e) {
  console.warn('Firebase initializeApp warning:', e);
  app = getApps()[0] || initializeApp(firebaseConfig, 'fallback-app');
}

try {
  authInstance = getAuth(app);
} catch (e) {
  console.warn('Firebase getAuth warning:', e);
  authInstance = {} as Auth;
}

try {
  const databaseId = import.meta.env.VITE_FIREBASE_DATABASE_ID;
  dbInstance = databaseId && databaseId !== '(default)'
    ? getFirestore(app, databaseId)
    : getFirestore(app);
} catch (e) {
  console.warn('Firebase getFirestore warning:', e);
  dbInstance = {} as Firestore;
}

export const auth = authInstance;
export const googleProvider = new GoogleAuthProvider();
export const db = dbInstance;

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  walletBalanceCents: number;
  createdAt: string;
}

// Fetch or create user profile in Firestore
export async function syncUserProfile(user: FirebaseUser, defaultRole: UserRole = 'advertiser'): Promise<UserProfile> {
  const defaultProfile: UserProfile = {
    uid: user.uid,
    email: user.email || '',
    displayName: user.displayName || user.email?.split('@')[0] || 'User',
    photoURL: user.photoURL || undefined,
    role: defaultRole,
    walletBalanceCents: 25000, // $250 initial deposit
    createdAt: new Date().toISOString()
  };

  try {
    if (!db || !db.type) {
      return defaultProfile;
    }
    const userRef = doc(db, 'users', user.uid);
    const snap = await getDoc(userRef);

    if (snap.exists()) {
      const data = snap.data();
      return {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || user.email?.split('@')[0] || 'User',
        photoURL: user.photoURL || undefined,
        role: (data.role as UserRole) || defaultRole,
        walletBalanceCents: typeof data.walletBalanceCents === 'number' ? data.walletBalanceCents : 25000,
        createdAt: data.createdAt || new Date().toISOString()
      };
    }

    await setDoc(userRef, defaultProfile);
    return defaultProfile;
  } catch (err) {
    console.warn('Firestore syncUserProfile warning:', err);
    return defaultProfile;
  }
}

export async function updateUserRoleInDb(uid: string, newRole: UserRole): Promise<void> {
  try {
    if (db && db.type) {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, { role: newRole });
    }
  } catch (err) {
    console.warn('Firestore updateUserRoleInDb warning:', err);
  }
}

export async function updateUserWalletInDb(uid: string, newBalanceCents: number): Promise<void> {
  try {
    if (db && db.type) {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, { walletBalanceCents: newBalanceCents });
    }
  } catch (err) {
    console.warn('Firestore updateUserWalletInDb warning:', err);
  }
}

export {
  signInWithPopup,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  onSnapshot
};
