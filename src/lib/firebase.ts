import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInAnonymously,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
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
  authDomain: 'livebillboards-production.firebaseapp.com',
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

  // Base profile shell — walletBalanceCents deliberately left as 0 here
  // so App.tsx always calls server fetchWallet() as the authoritative source.
  const baseProfile: UserProfile = {
    uid: user.uid,
    email: user.email || '',
    displayName: user.displayName || (isAnon ? 'Guest Advertiser' : user.email?.split('@')[0] || 'User'),
    photoURL: user.photoURL || undefined,
    role: defaultRole,
    walletBalanceCents: 0,
    tokensBalance: 0,
    hasClaimedFreeSlot: isAnon,
    isAnonymous: isAnon,
    createdAt: new Date().toISOString()
  };

  try {
    if (!db) {
      return { ...baseProfile, walletBalanceCents: 0 };
    }
    const userRef = doc(db, 'users', user.uid);
    const snap = await getDoc(userRef);

    if (snap.exists()) {
      const data = snap.data();
      const bidsCount = typeof data.bidsPlacedCount === 'number' ? data.bidsPlacedCount : 0;
      const hasClaimed = Boolean(data.starterGrantClaimed || data.freeSlotClaimed || bidsCount > 0);
      let tokensBalance = typeof data.tokensBalance === 'number'
        ? data.tokensBalance
        : (typeof data.walletBalanceCents === 'number' ? data.walletBalanceCents * 10 : (isAnon || hasClaimed ? 0 : 1000));
      let walletBalanceCents = typeof data.walletBalanceCents === 'number'
        ? data.walletBalanceCents
        : Math.round(tokensBalance / 10);

      if (!isAnon && !hasClaimed && data.tokensBalance === undefined && bidsCount === 0) {
        tokensBalance = 1000;
        walletBalanceCents = 100;
      }

      return {
        uid: user.uid,
        email: user.email || data.email || '',
        displayName: user.displayName || data.displayName || (isAnon ? 'Guest Advertiser' : user.email?.split('@')[0] || 'User'),
        photoURL: user.photoURL || data.photoURL || undefined,
        role: (data.role as UserRole) || defaultRole,
        walletBalanceCents,
        tokensBalance,
        hasClaimedFreeSlot: bidsCount > 0,
        isAnonymous: isAnon,
        createdAt: data.createdAt || new Date().toISOString()
      };
    }

    // Brand-new registered user: grant 1,000 starter tokens ($1.00 USD)
    if (!isAnon) {
      const cleanDoc: Record<string, any> = {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || user.email?.split('@')[0] || 'User',
        role: defaultRole,
        walletBalanceCents: 100, // $1.00
        tokensBalance: 1000,
        starterGrantClaimed: true,
        freeSlotClaimed: true,
        bidsPlacedCount: 0,
        isAnonymous: false,
        createdAt: new Date().toISOString()
      };
      if (user.photoURL) {
        cleanDoc.photoURL = user.photoURL;
      }

      await setDoc(userRef, cleanDoc, { merge: true });
      return cleanDoc as UserProfile;
    }

    // Anonymous user: no starter grant
    return baseProfile;
  } catch (err: any) {
    console.error('syncUserProfile Firestore write error:', err);
    return { ...baseProfile, walletBalanceCents: isAnon ? 0 : 100, tokensBalance: isAnon ? 0 : 1000 };
  }
}


export async function updateUserRoleInDb(uid: string, newRole: UserRole): Promise<void> {
  try {
    if (db) {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, { role: newRole });
    }
  } catch (err) {
    console.warn('Firestore updateUserRoleInDb warning:', err);
  }
}

export async function updateUserWalletInDb(uid: string, newBalanceCents: number): Promise<void> {
  try {
    if (db) {
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
  sendPasswordResetEmail,
  onAuthStateChanged,
  onSnapshot
};
