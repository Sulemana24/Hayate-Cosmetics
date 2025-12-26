"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { getAuth } from "firebase/auth";
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import Image from "next/image";
import { FiTrash2, FiPlus, FiMinus, FiShoppingCart } from "react-icons/fi";

interface CartItem {
  id: string;
  productId: string;
  name: string;
  imageUrl?: string;
  price: number;
  quantity: number;
}

export default function Cart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const auth = getAuth();

  // Get current user
  useEffect(() => {
    if (auth.currentUser) setCurrentUserId(auth.currentUser.uid);
  }, [auth.currentUser]);

  // Fetch cart items
  useEffect(() => {
    if (!currentUserId) return;

    const fetchCart = async () => {
      try {
        setLoading(true);
        const cartRef = collection(db, "users", currentUserId, "cart");
        const snapshot = await getDocs(cartRef);
        const items = snapshot.docs.map((docSnap) => {
          const data = docSnap.data() as CartItem;
          const { id: _, ...rest } = data;
          return {
            id: docSnap.id,
            ...rest,
          };
        });
        setCartItems(items);
      } catch (err) {
        console.error("Failed to fetch cart:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [currentUserId]);

  const handleUpdateQuantity = async (item: CartItem, delta: number) => {
    if (!currentUserId) return;
    const newQuantity = item.quantity + delta;
    if (newQuantity < 1) return;

    setCartItems((prev) =>
      prev.map((ci) =>
        ci.id === item.id ? { ...ci, quantity: newQuantity } : ci
      )
    );

    try {
      const itemRef = doc(db, "users", currentUserId, "cart", item.id);
      await updateDoc(itemRef, { quantity: newQuantity });
    } catch (err) {
      console.error("Failed to update quantity:", err);
    }
  };

  const handleRemoveItem = async (item: CartItem) => {
    if (!currentUserId) return;

    setCartItems((prev) => prev.filter((ci) => ci.id !== item.id));

    try {
      const itemRef = doc(db, "users", currentUserId, "cart", item.id);
      await deleteDoc(itemRef);
    } catch (err) {
      console.error("Failed to remove item:", err);
    }
  };

  const totalPrice = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  if (loading) return <p>Loading cart...</p>;
  if (!cartItems.length)
    return (
      <div className="text-center p-6 text-gray-500">
        <FiShoppingCart className="mx-auto mb-2 w-12 h-12" />
        Your cart is empty.
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Your Cart</h2>

      <div className="flex flex-col gap-4">
        {cartItems.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-4 p-4 border rounded-lg dark:border-gray-700"
          >
            {item.imageUrl && (
              <Image
                src={item.imageUrl}
                alt={item.name}
                width={80}
                height={80}
                className="object-contain rounded"
              />
            )}
            <div className="flex-1">
              <h3 className="font-semibold">{item.name}</h3>
              <p className="text-gray-600 dark:text-gray-400">
                ₵{item.price.toFixed(2)} each
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleUpdateQuantity(item, -1)}
                className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded"
              >
                <FiMinus />
              </button>
              <span>{item.quantity}</span>
              <button
                onClick={() => handleUpdateQuantity(item, 1)}
                className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded"
              >
                <FiPlus />
              </button>
            </div>

            <button
              onClick={() => handleRemoveItem(item)}
              className="text-red-500 hover:text-red-700"
            >
              <FiTrash2 />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 text-right">
        <span className="text-lg font-bold">
          Total: ₵{totalPrice.toFixed(2)}
        </span>
      </div>
    </div>
  );
}
