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

export function isUserAdmin(email?: string, role?: string): boolean {
  if (role === 'admin') return true;
  if (!email) return false;
  const cleanEmail = email.toLowerCase().trim();
  return cleanEmail === 'oweezyidi@gmail.com';
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

    if (snap && snap.exists()) {
      const data = snap.data();
      const bidsCount = typeof data.bidsPlacedCount === 'number' ? data.bidsPlacedCount : 0;
      const hasClaimed = Boolean(data.starterGrantClaimed || data.freeSlotClaimed || bidsCount > 0);
      
      // Accurately read true Firestore wallet balance ($6 = 600 cents, etc.)
      let walletBalanceCents = typeof data.walletBalanceCents === 'number'
        ? data.walletBalanceCents
        : (typeof data.tokensBalance === 'number' ? Math.round(data.tokensBalance / 10) : (isAnon || hasClaimed ? 0 : 100));
      let tokensBalance = typeof data.tokensBalance === 'number'
        ? data.tokensBalance
        : Math.round(walletBalanceCents * 10);

      const isAdmin = isUserAdmin(user.email || data.email, data.role);
      const finalRole: UserRole = isAdmin ? 'admin' : ((data.role as UserRole) || defaultRole);
      const resolvedEmail = user.email || data.email || '';
      const resolvedName = user.displayName || data.displayName || (isAnon ? 'Guest Advertiser' : resolvedEmail.split('@')[0] || 'User');

      // If document was previously saved without email or name, backfill it
      if (!isAnon && resolvedEmail && (!data.email || !data.displayName)) {
        setDoc(userRef, { email: resolvedEmail, displayName: resolvedName }, { merge: true }).catch(() => {});
      }

      return {
        uid: user.uid,
        email: resolvedEmail,
        displayName: resolvedName,
        photoURL: user.photoURL || data.photoURL || undefined,
        role: finalRole,
        walletBalanceCents,
        tokensBalance,
        hasClaimedFreeSlot: bidsCount > 0,
        isAnonymous: isAnon,
        createdAt: data.createdAt || new Date().toISOString()
      };
    }

    // Brand-new registered user: grant 1,000 starter tokens ($1.00 USD) ONLY on first signup
    if (!isAnon) {
      const isAdmin = isUserAdmin(user.email, defaultRole);
      const cleanDoc: Record<string, any> = {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || user.email?.split('@')[0] || 'User',
        role: isAdmin ? 'admin' : defaultRole,
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

      // Non-blocking write to avoid blocking UI return
      setDoc(userRef, cleanDoc, { merge: true }).catch((err) => console.warn('Background setDoc warning:', err));
      return cleanDoc as UserProfile;
    }

    // Anonymous user: no starter grant
    return baseProfile;
  } catch (err: any) {
    console.warn('Firestore syncUserProfile offline/read notice:', err);
    let fallbackCents = 0;
    if (typeof window !== 'undefined' && user?.uid) {
      const raw = localStorage.getItem(`vb_cached_balance_${user.uid}`);
      if (raw !== null && !isNaN(Number(raw))) {
        fallbackCents = Number(raw);
      }
    }
    const isAdmin = isUserAdmin(user.email, defaultRole);
    return {
      ...baseProfile,
      role: isAdmin ? 'admin' : defaultRole,
      walletBalanceCents: fallbackCents,
      tokensBalance: fallbackCents * 10,
      displayName: user.displayName || (isAnon ? 'Guest Advertiser' : user.email?.split('@')[0] || 'User')
    };
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
