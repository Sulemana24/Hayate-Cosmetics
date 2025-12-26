"use client";

import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import Image from "next/image";
import Link from "next/link";
import { FiHeart, FiTrash2 } from "react-icons/fi";
import { Favorite } from "@/types/favorite";
import { useAuth } from "@/context/AuthContext";

export default function Favorites() {
  const { setFavoritesCount } = useAuth(); // update navbar count
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      setFavoritesCount(0);
      return;
    }

    const favoritesRef = collection(db, "users", user.uid, "favorites");
    const q = query(favoritesRef, orderBy("addedAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const favs: Favorite[] = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<Favorite, "id">),
      }));

      setFavorites(favs);
      setFavoritesCount(snapshot.size); // <-- update navbar count
    });

    return () => unsubscribe();
  }, [setFavoritesCount]);

  const removeFavorite = async (favoriteId: string) => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;

    setFavorites((prev) =>
      prev.filter((favorite) => favorite.id !== favoriteId)
    );

    try {
      await deleteDoc(doc(db, "users", user.uid, "favorites", favoriteId));
      setFavoritesCount(favorites.length - 1);
    } catch (error) {
      console.error(error);
    }
  };

  /* =====================
     UI STATES
  ====================== */
  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-6 h-6 border-2 border-[#e39a89] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!favorites.length) {
    return (
      <div className="text-center py-20">
        <FiHeart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h2 className="text-lg font-semibold">No favorites yet</h2>
        <p className="text-gray-500 mb-4">Start adding products you love 💕</p>
        <Link
          href="/products"
          className="text-[#e39a89] font-medium hover:underline"
        >
          Browse products
        </Link>
      </div>
    );
  }

  /* =====================
     FAVORITES GRID
  ====================== */
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {favorites.map((favorite) => (
        <div
          key={favorite.id}
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-md border border-gray-100 dark:border-gray-800 overflow-hidden group"
        >
          <Link href={`/product/${favorite.productId}`}>
            <div className="relative h-56 bg-gray-50 dark:bg-gray-800">
              <Image
                src={favorite.imageUrl}
                alt={favorite.name}
                fill
                className="object-contain p-4 group-hover:scale-105 transition"
              />
            </div>
          </Link>

          <div className="p-4">
            <h3 className="font-semibold text-gray-800 dark:text-white line-clamp-1">
              {favorite.name}
            </h3>

            <p className="text-sm text-gray-500">{favorite.category}</p>

            <div className="flex items-center justify-between mt-3">
              <span className="font-bold text-gray-900 dark:text-white">
                ₵{favorite.price.toFixed(2)}
              </span>

              <button
                onClick={() => removeFavorite(favorite.id)}
                className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                aria-label="Remove favorite"
              >
                <FiTrash2 />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
