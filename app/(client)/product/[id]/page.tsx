"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Product } from "@/types/product";
import { db } from "@/lib/firebase";
import { getAuth } from "firebase/auth";
import { useToast } from "@/components/ToastProvider";
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  serverTimestamp,
  collection,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import {
  FiHeart,
  FiShoppingCart,
  FiTag,
  FiPackage,
  FiArrowLeft,
  FiTruck,
  FiShield,
  FiRepeat,
  FiStar,
  FiChevronRight,
  FiCheck,
  FiShare2,
} from "react-icons/fi";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoadingFavorite, setIsLoadingFavorite] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const { showToast } = useToast();

  const handleBuyNow = async () => {
    if (!currentUserId || !product) {
      showToast({
        title: "Error",
        message: "You must be logged in to buy products.",
        type: "error",
      });
      return;
    }

    try {
      setIsAddingToCart(true);

      const cartCollectionRef = collection(db, "users", currentUserId, "cart");
      showToast({
        title: "Success",
        message: "Proceeding to checkout...",
        type: "success",
      });

      const cartSnapshot = await getDocs(cartCollectionRef);
      const deletePromises = cartSnapshot.docs.map((docSnap) =>
        deleteDoc(docSnap.ref)
      );
      await Promise.all(deletePromises);

      const cartItemRef = doc(db, "users", currentUserId, "cart", product.id);

      await setDoc(cartItemRef, {
        productId: product.id,
        name: product.name,
        imageUrl: product.imageUrl,
        price: product.discountedPrice,
        category: product.category,
        quantity,
        addedAt: serverTimestamp(),
        buyNow: true,
      });

      router.push("/checkout");
    } catch (error) {
      showToast({
        title: "Error",
        message: "Failed to proceed to checkout. Please try again.",
        type: "error",
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleAddToCart = async () => {
    if (!currentUserId || !product) {
      showToast({
        title: "Error",
        message: "You must be logged in to add products to cart.",
        type: "error",
      });
      return;
    }
    setIsAddingToCart(true);

    try {
      const cartRef = doc(db, "users", currentUserId, "cart", product.id);
      const cartSnap = await getDoc(cartRef);

      if (cartSnap.exists()) {
        await updateDoc(cartRef, {
          quantity: (cartSnap.data().quantity || 1) + quantity,
          updatedAt: serverTimestamp(),
        });
      } else {
        await setDoc(cartRef, {
          productId: product.id,
          name: product.name,
          imageUrl: product.imageUrl,
          price: product.discountedPrice,
          category: product.category,
          quantity,
          addedAt: serverTimestamp(),
        });
      }

      showToast({
        title: "Success",
        message: "Added to cart!",
        type: "success",
      });
    } catch (err) {
      showToast({
        title: "Error",
        message: "Failed to add to cart. Please try again.",
        type: "error",
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  useEffect(() => {
    const auth = getAuth();
    if (auth.currentUser) setCurrentUserId(auth.currentUser.uid);
  }, []);

  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      try {
        const productRef = doc(db, "products", id as string);
        const productSnap = await getDoc(productRef);
        const data = productSnap.data() as Product;

        if (productSnap.exists()) {
          const productData = {
            ...data,
            id: data.id ?? productSnap.id,
          };
          setProduct(productData);
          if (data.imageUrl) {
            setSelectedImage(data.imageUrl);
          }
        }
      } catch (err) {
        showToast({
          title: "Error",
          message: "Failed to load product. Please try again.",
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  useEffect(() => {
    const fetchFavoriteStatus = async () => {
      if (!currentUserId || !id) return;

      try {
        const favoriteRef = doc(db, "users", currentUserId, "favorites", id);
        const favoriteSnap = await getDoc(favoriteRef);
        if (favoriteSnap.exists()) setIsFavorite(true);
      } catch (err) {
        showToast({
          title: "Error",
          message: "Failed to load favorite status. Please try again.",
          type: "error",
        });
      }
    };

    fetchFavoriteStatus();
  }, [currentUserId, id]);

  const handleToggleFavorite = async () => {
    if (!currentUserId || !product) return;

    const favoriteRef = doc(
      db,
      "users",
      currentUserId,
      "favorites",
      product.id
    );
    const nextFavoriteState = !isFavorite;
    setIsFavorite(nextFavoriteState);
    setIsLoadingFavorite(true);

    try {
      if (nextFavoriteState) {
        await setDoc(favoriteRef, {
          productId: product.id,
          name: product.name,
          imageUrl: product.imageUrl,
          price: product.discountedPrice,
          category: product.category,
          addedAt: serverTimestamp(),
        });
        showToast({
          title: "Success",
          message: "Added to favorites!",
          type: "success",
        });
      } else {
        await deleteDoc(favoriteRef);
        showToast({
          title: "Success",
          message: "Removed from favorites!",
          type: "success",
        });
      }
    } catch (err) {
      setIsFavorite(!nextFavoriteState);
      showToast({
        title: "Error",
        message: "Failed to update favorite. Please try again.",
        type: "error",
      });
    } finally {
      setIsLoadingFavorite(false);
    }
  };

  const productImages = [product?.imageUrl || ""].filter(Boolean);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#e39a89]"></div>
      </div>
    );
  if (!product)
    return (
      <div className="max-w-6xl mx-auto p-6 text-center">
        <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-12">
          <FiPackage className="w-20 h-20 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Product Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The product you&apos;re looking for doesn&apos;t exist or has been
            removed.
          </p>
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-gradient-to-r from-[#e39a89] to-[#d87a6a] text-white rounded-lg hover:opacity-90"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );

  const discountPercentage = Math.round(
    ((product.originalPrice - product.discountedPrice) /
      product.originalPrice) *
      100
  );

  const reviews = [
    {
      rating: 5,
      comment: "Excellent product, highly recommend!",
      user: "Alex M.",
    },
    { rating: 4, comment: "Good quality, fast shipping", user: "Sarah T." },
  ];

  const averageRating = 4.5;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-4">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-[#e39a89] dark:hover:text-[#e39a89] font-medium"
          >
            <FiArrowLeft className="w-5 h-5" />
            Back
          </button>
        </div>
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-6">
          <button
            onClick={() => router.back()}
            className="hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Products
          </button>
          <FiChevronRight className="w-4 h-4" />
          <span className="text-gray-900 dark:text-white font-medium">
            {product.category}
          </span>
          <FiChevronRight className="w-4 h-4" />
          <span className="text-gray-900 dark:text-white font-medium truncate">
            {product.name}
          </span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery Section */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
              <div className="relative aspect-square overflow-hidden rounded-xl">
                {selectedImage ? (
                  <Image
                    src={selectedImage}
                    alt={product.name}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <FiPackage className="w-24 h-24 mb-4" />
                    <p>No image available</p>
                  </div>
                )}

                {product.originalPrice > product.discountedPrice && (
                  <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    -{discountPercentage}%
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2">
              {productImages.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(img)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === img
                      ? "border-[#e39a89]"
                      : "border-transparent hover:border-gray-300"
                  }`}
                >
                  <div className="relative w-full h-full bg-gray-100 dark:bg-gray-700">
                    {img ? (
                      <Image
                        src={img}
                        alt={`Thumbnail ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <FiPackage className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-3 mt-6">
              <div className="flex items-center gap-2 p-3 bg-white dark:bg-gray-800 rounded-lg">
                <FiTruck className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium">Nationwide Shipping</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-white dark:bg-gray-800 rounded-lg">
                <FiShield className="w-5 h-5 text-blue-500" />
                <span className="text-sm font-medium">Quality Granted</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-white dark:bg-gray-800 rounded-lg">
                <FiRepeat className="w-5 h-5 text-purple-500" />
                <span className="text-sm font-medium">
                  24/7 Customer Support
                </span>
              </div>
            </div>
          </div>

          {/* Product Info Section */}
          <div className="space-y-6">
            {/* Header with Share Button */}
            <div className="flex justify-between items-start">
              <div>
                <div className="inline-flex items-center gap-2 mb-3">
                  <span className="text-sm font-medium px-3 py-1 rounded-full bg-[#e39a89]/10 text-[#e39a89]">
                    <FiTag className="inline mr-1" /> {product.category}
                  </span>
                  <span
                    className={`text-sm font-medium px-3 py-1 rounded-full ${
                      product.status === "In Stock"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : product.status === "Low Stock"
                        ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    }`}
                  >
                    {product.status}
                  </span>
                </div>
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3">
                  {product.name}
                </h1>

                {/* Ratings */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <FiStar
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.floor(averageRating)
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-gray-600 dark:text-gray-400">
                    {averageRating} · {reviews.length} reviews
                  </span>
                </div>
              </div>
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                <FiShare2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            {/* Price Section */}
            <div className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 p-6 rounded-2xl">
              <div className="flex items-end gap-4 mb-2">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">
                  ₵{product.discountedPrice.toFixed(2)}
                </span>
                {product.originalPrice > product.discountedPrice && (
                  <>
                    <span className="text-xl line-through text-gray-400">
                      ₵{product.originalPrice.toFixed(2)}
                    </span>
                    <span className="text-sm font-bold bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 px-3 py-1 rounded-full">
                      Save ₵
                      {(
                        product.originalPrice - product.discountedPrice
                      ).toFixed(2)}
                    </span>
                  </>
                )}
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Price exclude shipping fees
              </p>
            </div>

            {/* Product Description */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                Product Description
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {product.description}
              </p>

              {/* Features List */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  "No side effects",
                  "Easy to use",
                  "Eco-friendly",
                  "Original product",
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <FiCheck className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700 dark:text-gray-300">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Quantity
              </label>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 text-lg font-medium">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    +
                  </button>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Total:{" "}
                  <span className="font-bold text-lg">
                    ₵{(product.discountedPrice * quantity).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="sticky bottom-6 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl">
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={isAddingToCart}
                  className="flex-1 flex items-center justify-center gap-3 bg-gradient-to-r from-[#e39a89] to-[#d87a6a] text-white px-6 py-4 rounded-xl font-semibold hover:opacity-90 transition-opacity shadow-lg hover:shadow-xl cursor-pointer"
                >
                  <FiShoppingCart className="w-5 h-5" />
                  {isAddingToCart
                    ? "Adding..."
                    : `Add to Cart · ₵${(
                        product.discountedPrice * quantity
                      ).toFixed(2)}`}
                </button>

                <button
                  onClick={handleToggleFavorite}
                  disabled={isLoadingFavorite}
                  className={`flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold border transition-all cursor-pointer ${
                    isFavorite
                      ? "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                      : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  <FiHeart
                    className={`w-5 h-5 ${isFavorite ? "fill-red-500" : ""}`}
                  />
                  {isFavorite ? "Favorited" : "Favorite"}
                </button>
              </div>

              <button
                onClick={handleBuyNow}
                className="w-full mt-3 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold rounded-xl hover:opacity-90 transition-opacity cursor-pointer"
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-12 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
          <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">
            Customer Reviews ({reviews.length})
          </h3>
          <div className="space-y-4">
            {reviews.map((review, index) => (
              <div
                key={index}
                className="border-b border-gray-100 dark:border-gray-700 pb-4 last:border-0"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {[...Array(5)].map((_, i) => (
                      <FiStar
                        key={i}
                        className={`w-4 h-4 ${
                          i < review.rating
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">{review.user}</span>
                </div>
                <p className="text-gray-700 dark:text-gray-300">
                  {review.comment}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
