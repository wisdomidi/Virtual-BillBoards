import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { UserRole } from '../types';

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Firestore Database using specific database ID
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

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

  const newProfile: UserProfile = {
    uid: user.uid,
    email: user.email || '',
    displayName: user.displayName || user.email?.split('@')[0] || 'User',
    photoURL: user.photoURL || undefined,
    role: defaultRole,
    walletBalanceCents: 25000, // $250 initial deposit
    createdAt: new Date().toISOString()
  };

  await setDoc(userRef, newProfile);
  return newProfile;
}

export async function updateUserRoleInDb(uid: string, newRole: UserRole): Promise<void> {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, { role: newRole });
}

export async function updateUserWalletInDb(uid: string, newBalanceCents: number): Promise<void> {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, { walletBalanceCents: newBalanceCents });
}

export {
  signInWithPopup,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged
};
