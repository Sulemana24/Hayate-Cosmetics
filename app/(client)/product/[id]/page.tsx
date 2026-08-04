"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Product } from "@/types/product";
import { db } from "@/lib/firebase";
import { getAuth } from "firebase/auth";
import { useToast } from "@/components/ToastProvider";
import { useProductReviews } from "@/hooks/useProductReviews";
import ReviewCard from "@/components/ReviewCard";
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  serverTimestamp,
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
  FiMessageSquare,
  FiEdit2,
  FiGlobe,
  FiClock,
  FiInfo,
} from "react-icons/fi";

// Shared tokens with the rest of the storefront: ink #1b3c35, clay #E39A89
// (→ #c9614d for AA-safe text-on-light), sage #8FA593, cream base #FBF6EF.

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
  const [isPreOrder, setIsPreOrder] = useState(false);
  const { showToast } = useToast();

  const {
    reviews,
    loading: reviewsLoading,
    error: reviewsError,
    averageRating,
    totalReviews,
  } = useProductReviews(id as string, 10);

  const auth = getAuth();

  // Check if product is imported and set pre-order status
  useEffect(() => {
    if (product) {
      // Check if product is imported
      const isImported =
        product.category === "Importation" || product.isImported === true;

      if (isImported) {
        setIsPreOrder(
          product.isPreOrder || product.status === "Out of Stock" || false,
        );
      } else {
        setIsPreOrder(false);
      }
    }
  }, [product]);

  // Calculate pre-order estimated delivery date (2 months from now)
  const getEstimatedDeliveryDate = () => {
    const now = new Date();
    const deliveryDate = new Date(now);
    deliveryDate.setMonth(deliveryDate.getMonth() + 2);
    return deliveryDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleBuyNow = async () => {
    if (!currentUserId || !product) {
      showToast({
        title: "Error",
        message: "You must be logged in to buy products.",
        type: "error",
      });
      return;
    }

    setIsAddingToCart(true);

    try {
      const cartRef = doc(db, "users", currentUserId, "cart", product.id);
      const cartSnap = await getDoc(cartRef);

      if (!cartSnap.exists()) {
        await setDoc(cartRef, {
          productId: product.id,
          name: product.name,
          imageUrl: product.imageUrl,
          price: product.discountedPrice,
          category: product.category,
          quantity,
          addedAt: serverTimestamp(),
          buyNow: true,
          isPreOrder: isPreOrder,
          preOrderDate: isPreOrder ? serverTimestamp() : null,
          estimatedDelivery: isPreOrder ? getEstimatedDeliveryDate() : null,
        });
      }

      showToast({
        title: "Success",
        message: isPreOrder
          ? "Pre-order placed! Proceeding to checkout..."
          : "Proceeding to checkout...",
        type: "success",
      });

      router.push("/checkout");
    } catch (err) {
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
        showToast({
          title: "Info",
          message: "This product is already in your cart.",
          type: "info",
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
          isPreOrder: isPreOrder,
          preOrderDate: isPreOrder ? serverTimestamp() : null,
          estimatedDelivery: isPreOrder ? getEstimatedDeliveryDate() : null,
        });

        showToast({
          title: "Success",
          message: isPreOrder
            ? `Pre-ordered ${quantity} item(s)! Expected delivery: ${getEstimatedDeliveryDate()}`
            : `Added ${quantity} item(s) to cart.`,
          type: "success",
        });
      }
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

  const handleToggleFavorite = async () => {
    if (!currentUserId || !product) {
      showToast({
        title: "Error",
        message: "Please sign in to add favorites.",
        type: "error",
      });
      return;
    }

    const favoriteRef = doc(
      db,
      "users",
      currentUserId,
      "favorites",
      product.id,
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

  useEffect(() => {
    if (auth.currentUser) {
      setCurrentUserId(auth.currentUser.uid);
    }
  }, [auth.currentUser]);

  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      try {
        const productRef = doc(db, "products", id as string);
        const productSnap = await getDoc(productRef);

        if (productSnap.exists()) {
          const data = productSnap.data();
          const productData = {
            ...data,
            id: data.id ?? productSnap.id,
            rating: data.rating || 0,
            reviewCount: data.reviewCount || 0,
          } as Product;
          setProduct(productData);
          if (data.imageUrl) {
            setSelectedImage(data.imageUrl);
          }
        } else {
          showToast({
            title: "Error",
            message: "Product not found.",
            type: "error",
          });
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
  }, [id, showToast]);

  useEffect(() => {
    const fetchFavoriteStatus = async () => {
      if (!currentUserId || !id) return;

      try {
        const favoriteRef = doc(db, "users", currentUserId, "favorites", id);
        const favoriteSnap = await getDoc(favoriteRef);
        setIsFavorite(favoriteSnap.exists());
      } catch (err) {
        showToast({
          title: "Error",
          message: "Failed to fetch favorite status. Please try again.",
          type: "error",
        });
      }
    };

    fetchFavoriteStatus();
  }, [currentUserId, id]);

  // Calculate display values
  const displayRating = product?.rating || averageRating || 0;
  const displayReviewCount = product?.reviewCount || totalReviews || 0;

  // Check if product is imported
  const isImported =
    product?.category === "Importation" || product?.isImported === true;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FBF6EF] dark:bg-[#0f1e1a]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E39A89]"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#FBF6EF] dark:bg-[#0f1e1a] flex items-center px-4">
        <div className="max-w-lg mx-auto text-center w-full">
          <div className="bg-white dark:bg-[#16302a] ring-1 ring-black/5 dark:ring-white/5 rounded-2xl p-10 sm:p-12">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#1b3c35]/[0.06] dark:bg-white/10 flex items-center justify-center">
              <FiPackage className="w-7 h-7 text-[#1b3c35]/40 dark:text-white/40" />
            </div>
            <h2 className="text-2xl font-bold text-[#1b3c35] dark:text-white mb-2">
              Product Not Found
            </h2>
            <p className="text-[#26261F]/60 dark:text-white/60 mb-6">
              The product you&apos;re looking for doesn&apos;t exist or has been
              removed.
            </p>
            <button
              onClick={() => router.push("/")}
              className="px-6 py-2.5 bg-[#1b3c35] hover:bg-[#254f45] text-white rounded-lg font-medium transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  const discountPercentage = Math.round(
    ((product.originalPrice - product.discountedPrice) /
      product.originalPrice) *
      100,
  );

  const productImages = [product?.imageUrl || ""].filter(Boolean);

  return (
    <div className="min-h-screen bg-[#FBF6EF] dark:bg-[#0f1e1a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-4">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-[#1b3c35]/70 dark:text-white/70 hover:text-[#c9614d] dark:hover:text-[#E39A89] font-medium transition-colors cursor-pointer"
          >
            <FiArrowLeft className="w-5 h-5" />
            Back
          </button>
        </div>

        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-sm text-[#26261F]/55 dark:text-white/55 mb-6 flex-wrap">
          <button
            onClick={() => router.push("/")}
            className="hover:text-[#1b3c35] dark:hover:text-white transition-colors cursor-pointer"
          >
            Home
          </button>
          <FiChevronRight className="w-4 h-4" />
          <button
            onClick={() => router.push(`/category/${product.category}`)}
            className="hover:text-[#1b3c35] dark:hover:text-white transition-colors cursor-pointer"
          >
            {product.category}
          </button>
          <FiChevronRight className="w-4 h-4" />
          <span className="text-[#1b3c35] dark:text-white font-medium truncate">
            {product.name}
          </span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery Section */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="bg-white dark:bg-[#16302a] ring-1 ring-black/5 dark:ring-white/5 rounded-2xl p-6">
              <div className="relative aspect-square overflow-hidden rounded-xl bg-[#1b3c35]/5">
                {selectedImage ? (
                  <Image
                    src={selectedImage}
                    alt={product.name}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-[#1b3c35]/30 dark:text-white/30">
                    <FiPackage className="w-24 h-24 mb-4" />
                    <p>No image available</p>
                  </div>
                )}

                {product.originalPrice > product.discountedPrice && (
                  <div className="absolute top-4 left-4 bg-[#c9614d] text-white px-3 py-1 rounded-full text-sm font-bold">
                    -{discountPercentage}%
                  </div>
                )}

                {/* Imported Badge */}
                {isImported && (
                  <div className="absolute top-4 right-4 bg-[#bc0686] text-white px-3 py-1.5 rounded-full text-xs font-bold tracking-wider flex items-center gap-1.5 shadow-lg">
                    <FiGlobe className="w-3.5 h-3.5" />
                    Pre-Order
                  </div>
                )}

                {/* Pre-Order Badge */}
                {isPreOrder && (
                  <div className="absolute bottom-4 left-4 right-4 bg-[#1b3c35]/90 backdrop-blur-sm text-white px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 justify-center">
                    <FiClock className="w-4 h-4" />
                    <span>Pre-Order: Ships in 2 months</span>
                  </div>
                )}
              </div>
            </div>

            {/* Thumbnails */}
            <div className="flex gap-3 overflow-x-auto pb-2">
              {productImages.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(img)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === img
                      ? "border-[#E39A89]"
                      : "border-transparent hover:border-[#1b3c35]/20 dark:hover:border-white/20"
                  }`}
                >
                  <div className="relative w-full h-full bg-[#1b3c35]/5 dark:bg-white/5">
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
                        <FiPackage className="w-6 h-6 text-[#1b3c35]/30 dark:text-white/30" />
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Shipping Info */}
            <div className="grid grid-cols-1 xs:grid-cols-3 sm:grid-cols-3 gap-3 mt-6">
              <div className="flex items-center gap-2.5 p-3 bg-white dark:bg-[#16302a] ring-1 ring-black/5 dark:ring-white/5 rounded-lg">
                <FiTruck className="w-5 h-5 text-[#8FA593] flex-shrink-0" />
                <span className="text-sm font-medium text-[#1b3c35] dark:text-white/90">
                  {isPreOrder ? "Pre-order Shipping" : "Nationwide Shipping"}
                </span>
              </div>
              <div className="flex items-center gap-2.5 p-3 bg-white dark:bg-[#16302a] ring-1 ring-black/5 dark:ring-white/5 rounded-lg">
                <FiShield className="w-5 h-5 text-[#8FA593] flex-shrink-0" />
                <span className="text-sm font-medium text-[#1b3c35] dark:text-white/90">
                  {isImported ? "Imported Quality" : "Quality Granted"}
                </span>
              </div>
              <div className="flex items-center gap-2.5 p-3 bg-white dark:bg-[#16302a] ring-1 ring-black/5 dark:ring-white/5 rounded-lg">
                <FiRepeat className="w-5 h-5 text-[#8FA593] flex-shrink-0" />
                <span className="text-sm font-medium text-[#1b3c35] dark:text-white/90">
                  24/7 Support
                </span>
              </div>
            </div>
          </div>

          {/* Product Info Section */}
          <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start gap-4">
              <div>
                <div className="inline-flex items-center gap-2 mb-3 flex-wrap">
                  <span className="text-sm font-medium px-3 py-1 rounded-full bg-[#E39A89]/10 text-[#c9614d] dark:text-[#E39A89]">
                    <FiTag className="inline mr-1" /> {product.category}
                  </span>

                  {/* Imported Tag */}
                  {isImported && (
                    <span className="text-sm font-medium px-3 py-1 rounded-full bg-[#bc0686]/10 text-[#bc0686] dark:bg-[#bc0686]/20 dark:text-[#d47a9e] flex items-center gap-1">
                      <FiGlobe className="w-3 h-3" />
                      Pre-Order
                    </span>
                  )}

                  <span
                    className={`text-sm font-medium px-3 py-1 rounded-full ${
                      product.status === "In Stock"
                        ? "bg-[#8FA593]/15 text-[#4d6b56] dark:text-[#a9c2ae]"
                        : product.status === "Low Stock"
                          ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    }`}
                  >
                    {isPreOrder ? "Pre-Order" : product.status}
                  </span>
                </div>
                <h1 className="text-3xl lg:text-4xl font-bold text-[#1b3c35] dark:text-white tracking-tight mb-3">
                  {product.name}
                </h1>

                {/* Ratings */}
                <div className="flex items-center gap-3 mb-4 flex-wrap">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <FiStar
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.floor(displayRating)
                            ? "text-[#E39A89] fill-[#E39A89]"
                            : i < displayRating
                              ? "text-[#E39A89] fill-[#E39A89] opacity-50"
                              : "text-[#1b3c35]/15 dark:text-white/20"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[#26261F]/60 dark:text-white/60">
                    {displayRating.toFixed(1)} ({displayReviewCount} reviews)
                  </span>
                  {currentUserId && (
                    <button
                      onClick={() => router.push("/orders")}
                      className="text-sm text-[#c9614d] dark:text-[#E39A89] hover:opacity-80 font-medium transition-opacity flex items-center gap-1"
                    >
                      <FiEdit2 className="w-3 h-3" />
                      Write Review
                    </button>
                  )}
                </div>
              </div>
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: product.name,
                      text: `Check out ${product.name} on Ama-X`,
                      url: window.location.href,
                    });
                  }
                }}
                className="p-2 hover:bg-[#1b3c35]/[0.06] dark:hover:bg-white/10 rounded-lg transition-colors cursor-pointer shrink-0"
                aria-label="Share product"
              >
                <FiShare2 className="w-5 h-5 text-[#1b3c35]/60 dark:text-white/60" />
              </button>
            </div>

            {/* Pre-Order Info Banner */}
            {isPreOrder && (
              <div className="bg-gradient-to-r from-[#E39A89]/10 to-[#bc0686]/10 dark:from-[#E39A89]/20 dark:to-[#bc0686]/20 rounded-xl p-4 border border-[#E39A89]/20 dark:border-[#E39A89]/30">
                <div className="flex items-start gap-3">
                  <FiClock className="w-5 h-5 text-[#bc0686] dark:text-[#d47a9e] mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-[#1b3c35] dark:text-white text-sm">
                      Pre-Order Available
                    </h4>
                    <p className="text-sm text-[#26261F]/70 dark:text-white/70">
                      This product is on pre-order. Orders will ship
                      approximately
                      <strong className="text-[#bc0686] dark:text-[#d47a9e]">
                        {" "}
                        {getEstimatedDeliveryDate()}
                      </strong>
                      .
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-[#26261F]/50 dark:text-white/50">
                      <FiInfo className="w-3 h-3" />
                      <span>
                        Secure your order now to be among the first to receive
                        it
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Price Section */}
            <div className="bg-white dark:bg-[#16302a] ring-1 ring-black/5 dark:ring-white/5 p-6 rounded-2xl">
              <div className="flex items-end gap-3 flex-wrap mb-2">
                <span className="text-4xl font-bold text-[#1b3c35] dark:text-white">
                  ₵{product.discountedPrice.toFixed(2)}
                </span>
                {product.originalPrice > product.discountedPrice && (
                  <>
                    <span className="text-xl line-through text-[#26261F]/35 dark:text-white/35">
                      ₵{product.originalPrice.toFixed(2)}
                    </span>
                    <span className="text-sm font-bold bg-[#E39A89]/10 text-[#c9614d] dark:text-[#E39A89] px-3 py-1 rounded-full">
                      Save ₵
                      {(
                        product.originalPrice - product.discountedPrice
                      ).toFixed(2)}
                    </span>
                  </>
                )}
              </div>
              <p className="text-[#26261F]/55 dark:text-white/55 text-sm">
                {isPreOrder
                  ? "Pre-order price (pay now, ship later)"
                  : "Price excludes shipping fees"}
              </p>
            </div>

            {/* Product Description */}
            <div className="bg-white dark:bg-[#16302a] ring-1 ring-black/5 dark:ring-white/5 rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-3 text-[#1b3c35] dark:text-white">
                Product Description
              </h3>
              <p className="text-[#26261F]/75 dark:text-white/75 leading-relaxed">
                {product.description}
              </p>

              {/* Imported product features */}
              {isImported && (
                <div className="mt-4 p-3 bg-[#bc0686]/5 dark:bg-[#bc0686]/10 rounded-lg border border-[#bc0686]/10 dark:border-[#bc0686]/20">
                  <p className="text-sm text-[#26261F]/70 dark:text-white/70 flex items-center gap-2">
                    <FiGlobe className="w-4 h-4 text-[#bc0686] dark:text-[#d47a9e]" />
                    <span>
                      This product is sourced from international markets,
                      ensuring premium quality and authenticity.
                    </span>
                  </p>
                </div>
              )}

              {/* Features */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  "No side effects",
                  "Easy to use",
                  "Eco-friendly",
                  isImported ? "Internationally Sourced" : "Original product",
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <FiCheck className="w-5 h-5 text-[#8FA593] flex-shrink-0" />
                    <span className="text-[#26261F]/75 dark:text-white/75 text-sm">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="bg-white dark:bg-[#16302a] ring-1 ring-black/5 dark:ring-white/5 rounded-2xl p-6">
              <label className="block text-sm font-medium text-[#1b3c35] dark:text-white/90 mb-3">
                Quantity
              </label>
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center border border-[#1b3c35]/15 dark:border-white/15 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 text-[#1b3c35]/70 dark:text-white/70 hover:bg-[#1b3c35]/[0.06] dark:hover:bg-white/10 transition-colors cursor-pointer"
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 text-lg font-medium text-[#1b3c35] dark:text-white min-w-[3rem] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 py-2 text-[#1b3c35]/70 dark:text-white/70 hover:bg-[#1b3c35]/[0.06] dark:hover:bg-white/10 transition-colors cursor-pointer"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
                <div className="text-sm text-[#26261F]/60 dark:text-white/60">
                  Total:{" "}
                  <span className="font-bold text-lg text-[#1b3c35] dark:text-white">
                    ₵{(product.discountedPrice * quantity).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="sticky bottom-6 bg-white dark:bg-[#16302a] rounded-2xl p-6 shadow-xl ring-1 ring-black/5 dark:ring-white/10">
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={isAddingToCart}
                  className="flex-1 flex items-center justify-center gap-3 bg-[#1b3c35] hover:bg-[#254f45] text-white px-6 py-4 rounded-xl font-semibold transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <FiShoppingCart className="w-5 h-5" />
                  {isAddingToCart
                    ? "Adding..."
                    : isPreOrder
                      ? `Pre-Order Now · ₵${(product.discountedPrice * quantity).toFixed(2)}`
                      : `Add to Cart · ₵${(product.discountedPrice * quantity).toFixed(2)}`}
                </button>

                <button
                  onClick={handleToggleFavorite}
                  disabled={isLoadingFavorite}
                  className={`flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold border transition-all cursor-pointer ${
                    isFavorite
                      ? "border-[#c9614d]/30 bg-[#E39A89]/10 text-[#c9614d] dark:text-[#E39A89]"
                      : "border-[#1b3c35]/15 dark:border-white/15 text-[#1b3c35] dark:text-white/80 hover:bg-[#1b3c35]/[0.06] dark:hover:bg-white/10"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <FiHeart
                    className={`w-5 h-5 ${
                      isFavorite ? "fill-[#c9614d] text-[#c9614d]" : ""
                    }`}
                  />
                  {isFavorite ? "Favorited" : "Favorite"}
                </button>
              </div>

              <button
                onClick={handleBuyNow}
                disabled={isAddingToCart}
                className="w-full mt-3 py-3 bg-[#E39A89] hover:bg-[#d9866f] text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isPreOrder ? "Pre-Order Now" : "Buy Now"}
              </button>

              {isPreOrder && (
                <p className="text-xs text-center text-[#26261F]/50 dark:text-white/50 mt-2">
                  <FiClock className="inline w-3 h-3 mr-1" />
                  Estimated delivery: {getEstimatedDeliveryDate()}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-12 bg-white dark:bg-[#16302a] ring-1 ring-black/5 dark:ring-white/5 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <h3 className="text-xl font-bold text-[#1b3c35] dark:text-white flex items-center gap-2">
              <FiMessageSquare className="w-5 h-5" />
              Customer Reviews ({displayReviewCount})
            </h3>

            {currentUserId && displayReviewCount > 0 && (
              <button
                onClick={() => router.push("/orders")}
                className="flex items-center gap-2 px-4 py-2 bg-[#E39A89]/10 text-[#c9614d] dark:text-[#E39A89] hover:bg-[#E39A89]/20 rounded-lg transition-colors font-medium"
              >
                <FiEdit2 className="w-4 h-4" />
                Write a Review
              </button>
            )}
          </div>

          {/* Review Summary */}
          {displayReviewCount > 0 && (
            <div className="flex items-center gap-6 mb-6 p-4 bg-[#1b3c35]/[0.03] dark:bg-white/5 rounded-xl flex-wrap">
              <div className="text-center">
                <div className="text-3xl font-bold text-[#1b3c35] dark:text-white">
                  {displayRating.toFixed(1)}
                </div>
                <div className="flex items-center justify-center mt-1">
                  {[...Array(5)].map((_, i) => (
                    <FiStar
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(displayRating)
                          ? "text-[#E39A89] fill-[#E39A89]"
                          : "text-[#1b3c35]/15 dark:text-white/20"
                      }`}
                    />
                  ))}
                </div>
                <div className="text-xs text-[#26261F]/55 dark:text-white/55 mt-1">
                  {displayReviewCount} reviews
                </div>
              </div>
              <div className="flex-1 min-w-[180px]">
                <div className="space-y-1">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = reviews.filter(
                      (r) => Math.floor(r.rating) === star,
                    ).length;
                    const percentage =
                      displayReviewCount > 0
                        ? (count / displayReviewCount) * 100
                        : 0;
                    return (
                      <div key={star} className="flex items-center gap-2">
                        <span className="text-sm text-[#26261F]/55 dark:text-white/55 w-6">
                          {star}
                        </span>
                        <FiStar className="w-3 h-3 text-[#E39A89] fill-[#E39A89]" />
                        <div className="flex-1 h-2 bg-[#1b3c35]/[0.08] dark:bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#E39A89] rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-xs text-[#26261F]/55 dark:text-white/55 w-8">
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Reviews List */}
          {reviewsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-[#1b3c35]/[0.08] dark:bg-white/10"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-[#1b3c35]/[0.08] dark:bg-white/10 rounded w-32 mb-2"></div>
                      <div className="h-3 bg-[#1b3c35]/[0.06] dark:bg-white/[0.08] rounded w-48"></div>
                    </div>
                  </div>
                  <div className="h-12 bg-[#1b3c35]/[0.06] dark:bg-white/[0.08] rounded w-full"></div>
                </div>
              ))}
            </div>
          ) : reviewsError ? (
            <div className="text-center py-8">
              <FiMessageSquare className="w-12 h-12 mx-auto text-[#1b3c35]/25 dark:text-white/25 mb-3" />
              <p className="text-[#26261F]/60 dark:text-white/60">
                Unable to load reviews. Please try again later.
              </p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12 bg-[#1b3c35]/[0.03] dark:bg-white/5 rounded-xl border border-dashed border-[#1b3c35]/15 dark:border-white/15">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white dark:bg-white/10 flex items-center justify-center">
                <FiStar className="w-8 h-8 text-[#1b3c35]/30 dark:text-white/40" />
              </div>
              <h4 className="text-lg font-semibold text-[#1b3c35] dark:text-white mb-2">
                No Reviews Yet
              </h4>
              <p className="text-[#26261F]/60 dark:text-white/60 max-w-sm mx-auto">
                Be the first to share your experience with this product!
              </p>
              {currentUserId && (
                <button
                  onClick={() => router.push("/orders")}
                  className="mt-4 px-6 py-2 bg-[#1b3c35] hover:bg-[#254f45] text-white rounded-lg transition-colors cursor-pointer"
                >
                  Write a Review
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}

              {/* Show more reviews button */}
              {reviews.length < displayReviewCount && (
                <div className="text-center pt-4">
                  <button
                    onClick={() => {
                      showToast({
                        title: "Info",
                        message: "Loading more reviews...",
                        type: "info",
                      });
                    }}
                    className="text-[#c9614d] dark:text-[#E39A89] hover:opacity-80 font-medium transition-opacity cursor-pointer"
                  >
                    View More Reviews
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
