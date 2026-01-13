"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { getAuth } from "firebase/auth";
import { useToast } from "@/components/ToastProvider";
import {
  collection,
  doc,
  getDocs,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import Image from "next/image";
import { FiTrash2, FiPlus, FiMinus, FiShoppingBag } from "react-icons/fi";

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
  const [isRemoving, setIsRemoving] = useState<string | null>(null);
  const router = useRouter();
  const { showToast } = useToast();
  const auth = getAuth();

  useEffect(() => {
    if (auth.currentUser) setCurrentUserId(auth.currentUser.uid);
  }, [auth.currentUser]);

  const handleClick = () => {
    setLoading(true);

    setTimeout(() => {
      router.push("/checkout");
      setLoading(false);
    }, 2000);
  };

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
        showToast({
          message: "Failed to load cart items. Please try again.",
          type: "error",
        });
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
      showToast({
        message: "Failed to update item quantity. Please try again.",
        type: "error",
      });
    }
  };

  const handleRemoveItem = async (item: CartItem) => {
    if (!currentUserId) return;

    setIsRemoving(item.id);

    setTimeout(async () => {
      setCartItems((prev) => prev.filter((ci) => ci.id !== item.id));
      setIsRemoving(null);

      try {
        const itemRef = doc(db, "users", currentUserId, "cart", item.id);
        showToast({
          title: "Item Removed",
          message: `${item.name} removed from your cart.`,
          type: "info",
        });
        await deleteDoc(itemRef);
      } catch (err) {
        showToast({
          title: "Error",
          message: "Failed to remove item. Please try again.",
          type: "error",
        });
      }
    }, 300);
  };

  const totalPrice = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const itemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#d87a6a] mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">
          Proceeding to checkout...
        </p>
      </div>
    );
  }

  if (!cartItems.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] p-8 text-center">
        <div className="relative w-32 h-32 mb-6">
          <div className="absolute inset-0 bg-[#d87a6a] rounded-full"></div>
          <FiShoppingBag className="absolute inset-0 m-auto w-16 h-16 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-3">
          Your cart is empty
        </h3>
        <p className="text-gray-600 dark:text-gray-400 max-w-md mb-8">
          Looks like you haven&apos;t added any items to your cart yet. Start
          shopping to see items here!
        </p>
        <button
          onClick={() => router.push("/")}
          className="px-6 py-3 bg-[#d87a6a] text-white font-medium rounded-full transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart Items Section */}
        <div className="lg:w-2/3">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Shopping Cart
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                {itemCount} {itemCount === 1 ? "item" : "items"} in your cart
              </p>
            </div>
            <div className="hidden sm:block px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-800 rounded-full">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Total:{" "}
                <span className="text-lg font-bold text-[#d87a6a] dark:text-[#d87a6a]">
                  ₵{totalPrice.toFixed(2)}
                </span>
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 transition-all duration-300 ${
                  isRemoving === item.id
                    ? "opacity-0 scale-95"
                    : "opacity-100 scale-100"
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                  <div className="relative flex-shrink-0">
                    {item.imageUrl ? (
                      <div className="relative w-24 h-24 sm:w-28 sm:h-28 overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-700">
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          fill
                          className="object-contain p-2"
                        />
                      </div>
                    ) : (
                      <div className="w-24 h-24 sm:w-28 sm:h-28 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-800 rounded-xl flex items-center justify-center">
                        <FiShoppingBag className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2">
                      {item.name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-4 mb-4">
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        ₵{item.price.toFixed(2)}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400 text-sm">
                        each
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleUpdateQuantity(item, -1)}
                          className="w-10 h-10 flex items-center justify-center bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors duration-200 cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <FiMinus className="w-4 h-4" />
                        </button>
                        <div className="w-12 text-center">
                          <span className="text-lg font-semibold text-gray-900 dark:text-white">
                            {item.quantity}
                          </span>
                        </div>
                        <button
                          onClick={() => handleUpdateQuantity(item, 1)}
                          className="w-10 h-10 flex items-center justify-center bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors duration-200 cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          <FiPlus className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                          ₵{(item.price * item.quantity).toFixed(2)}
                        </div>
                        <button
                          onClick={() => handleRemoveItem(item)}
                          className="flex items-center gap-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-200 cursor-pointer"
                        >
                          <FiTrash2 className="w-5 h-5" />
                          <span className="text-sm font-medium">Remove</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:w-1/3">
          <div className="sticky top-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Order Summary
            </h2>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Subtotal ({itemCount} items)</span>
                <span className="font-medium">₵{totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Shipping</span>
                <span className="font-medium">₵0.00</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Tax</span>
                <span className="font-medium">₵0.00</span>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white">
                  <span>Total</span>
                  <span className="text-2xl">₵{totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleClick}
              disabled={loading}
              className={`w-full py-4 text-white font-bold rounded-xl transition-all duration-300 shadow-lg mb-4 cursor-pointer ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#d87a6a] hover:shadow-xl transform hover:-translate-y-0.5"
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    ></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                "Proceed to Checkout"
              )}
            </button>

            <div className="text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Shipping fees varies based on location and it&apos;s to be added
                during delivery process.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
