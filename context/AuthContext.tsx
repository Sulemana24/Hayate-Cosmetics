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
import {
  doc,
  setDoc,
  deleteDoc,
  serverTimestamp,
  collection,
  onSnapshot,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Favorite } from "@/types/favorite";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isLoggedIn: boolean;
  cartItemsCount: number;
  favoritesCount: number;
  favorites: Favorite[];
  toggleFavorite: (product: Favorite) => Promise<void>;
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
  const [favorites, setFavorites] = useState<Favorite[]>([]);

  const isLoggedIn = !!user;

  useEffect(() => {
    let unsubscribeCart: (() => void) | undefined;
    let unsubscribeFav: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);

      if (firebaseUser) {
        const cartRef = collection(db, "users", firebaseUser.uid, "cart");
        unsubscribeCart = onSnapshot(cartRef, (snapshot) => {
          const total = snapshot.docs.reduce(
            (acc, doc) => acc + (doc.data().quantity || 1),
            0
          );
          setCartItemsCount(total);
        });

        const favRef = collection(db, "users", firebaseUser.uid, "favorites");
        unsubscribeFav = onSnapshot(favRef, (snapshot) => {
          const favs = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...(docSnap.data() as Omit<Favorite, "id">),
          }));
          setFavorites(favs);
          setFavoritesCount(snapshot.size);
        });
      } else {
        setCartItemsCount(0);
        setFavoritesCount(0);
        setFavorites([]);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeCart) unsubscribeCart();
      if (unsubscribeFav) unsubscribeFav();
    };
  }, []);

  const toggleFavorite = async (product: Favorite) => {
    if (!user) return;

    const favoriteRef = doc(db, "users", user.uid, "favorites", product.id);
    const exists = favorites.find((fav) => fav.id === product.id);

    try {
      if (exists) {
        await deleteDoc(favoriteRef);
      } else {
        await setDoc(favoriteRef, {
          productId: product.productId,
          name: product.name,
          imageUrl: product.imageUrl,
          price: product.price,
          category: product.category,
          addedAt: serverTimestamp(),
        });
      }
    } catch (err) {
      console.error("Failed to toggle favorite:", err);
    }
  };

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

    if (name && userCredential.user) {
      await updateProfile(userCredential.user, { displayName: name });
    }

    await setDoc(doc(db, "users", userCredential.user.uid), {
      uid: userCredential.user.uid,
      email,
      displayName: name || null,
      role: "client",
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
    favorites,
    toggleFavorite,
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
