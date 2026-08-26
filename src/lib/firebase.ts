import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInAnonymously,
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
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyABGBRrkBpZHLExneNqGbQd-JqbYP6IvsI',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || `${import.meta.env.VITE_FIREBASE_PROJECT_ID || 'livebillboards-production'}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'livebillboards-production',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || `${import.meta.env.VITE_FIREBASE_PROJECT_ID || 'livebillboards-production'}.firebasestorage.app`,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '956720374475',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:956720374475:web:72b781216f12df6ef2314e',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-MRYQR4FRBJ'
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
googleProvider.setCustomParameters({ prompt: 'select_account' });
export const db = dbInstance;

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  walletBalanceCents: number;
  tokensBalance?: number;
  hasClaimedFreeSlot?: boolean;
  isAnonymous?: boolean;
  createdAt: string;
}

// Fetch or create user profile in Firestore (1,000 Tokens = $1.00 USD Starter / 1 Free 15s Slot for verified accounts)
export async function syncUserProfile(user: FirebaseUser, defaultRole: UserRole = 'advertiser'): Promise<UserProfile> {
  const isAnon = user.isAnonymous ?? false;
  const initialTokens = isAnon ? 0 : 1000; // $1.00 USD (1,000 Tokens) starter bonus for registered accounts
  const initialCents = isAnon ? 0 : 100;

  const defaultProfile: UserProfile = {
    uid: user.uid,
    email: user.email || '',
    displayName: user.displayName || (isAnon ? 'Guest Advertiser' : user.email?.split('@')[0] || 'User'),
    photoURL: user.photoURL || undefined,
    role: defaultRole,
    walletBalanceCents: initialCents,
    tokensBalance: initialTokens,
    hasClaimedFreeSlot: isAnon,
    isAnonymous: isAnon,
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
      const tokensBalance = typeof data.tokensBalance === 'number'
        ? data.tokensBalance
        : (typeof data.walletBalanceCents === 'number' ? data.walletBalanceCents * 10 : 0);
      const walletBalanceCents = typeof data.walletBalanceCents === 'number'
        ? data.walletBalanceCents
        : Math.round(tokensBalance / 10);

      return {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || data.displayName || (isAnon ? 'Guest Advertiser' : user.email?.split('@')[0] || 'User'),
        photoURL: user.photoURL || data.photoURL || undefined,
        role: (data.role as UserRole) || defaultRole,
        walletBalanceCents,
        tokensBalance,
        hasClaimedFreeSlot: data.hasClaimedFreeSlot ?? (tokensBalance <= 0),
        isAnonymous: isAnon,
        createdAt: data.createdAt || new Date().toISOString()
      };
    }

    const initialProfile: UserProfile = {
      ...defaultProfile
    };

    await setDoc(userRef, initialProfile, { merge: true });
    return initialProfile;
  } catch (err: any) {
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
      await updateDoc(userRef, {
        walletBalanceCents: newBalanceCents,
        tokensBalance: Math.round(newBalanceCents * 10)
      });
    }
  } catch (err) {
    console.warn('Firestore updateUserWalletInDb warning:', err);
  }
}

export {
  signInWithPopup,
  signInAnonymously,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  onSnapshot
};
