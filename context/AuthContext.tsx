"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isLoggedIn: boolean;
  cartItemsCount: number;
  favoritesCount: number;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, name?: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (displayName?: string, photoURL?: string) => Promise<void>;
  setCartItemsCount: (count: number) => void;
  setFavoritesCount: (count: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [cartItemsCount, setCartItemsCount] = useState(0);
  const [favoritesCount, setFavoritesCount] = useState(0);

  const isLoggedIn = !!user;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);

      // Reset counts when user logs out
      if (!firebaseUser) {
        setCartItemsCount(0);
        setFavoritesCount(0);
      }
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const signup = async (email: string, password: string, name?: string) => {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    // Update Auth profile
    if (name && userCredential.user) {
      await updateProfile(userCredential.user, { displayName: name });
    }

    // Save user data in Firestore
    await setDoc(doc(db, "users", userCredential.user.uid), {
      uid: userCredential.user.uid,
      email,
      displayName: name || null,
      role: "client", // mark as client
      createdAt: serverTimestamp(),
    });
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const updateUserProfile = async (displayName?: string, photoURL?: string) => {
    if (!user) throw new Error("No user logged in");

    await updateProfile(user, {
      displayName: displayName || null,
      photoURL: photoURL || null,
    });

    setUser({
      ...user,
      displayName: displayName || null,
      photoURL: photoURL || null,
    });
  };

  const value: AuthContextType = {
    user,
    loading,
    isLoggedIn,
    cartItemsCount,
    favoritesCount,
    login,
    logout,
    signup,
    resetPassword,
    updateUserProfile,
    setCartItemsCount,
    setFavoritesCount,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
