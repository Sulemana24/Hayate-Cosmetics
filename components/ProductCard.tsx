"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  FiShoppingCart,
  FiHeart,
  FiEye,
  FiStar,
  FiPackage,
  FiChevronRight,
  FiTag,
  FiTruck,
  FiShield,
} from "react-icons/fi";
import { Product } from "@/types/product";
import { db } from "@/lib/firebase";
import {
  doc,
  setDoc,
  deleteDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  onFavoriteToggle?: (productId: string, isFavorite: boolean) => void;
  onQuickView?: (product: Product) => void;
  showActions?: boolean;
  isFavoriteInitially?: boolean;
  userId?: string | null; // Pass userId as prop
}

export default function ProductCard({
  product,
  onAddToCart,
  onFavoriteToggle,
  onQuickView,
  showActions = true,
  isFavoriteInitially = false,
  userId = null, // Receive userId as prop
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(isFavoriteInitially);
  const [imageError, setImageError] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);
  const [isLoadingFavorite, setIsLoadingFavorite] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Fetch favorite status from Firebase on component mount
  useEffect(() => {
    const fetchFavoriteStatus = async () => {
      if (!userId) return;

      try {
        const favoriteRef = doc(db, "users", userId, "favorites", product.id);
        const favoriteSnap = await getDoc(favoriteRef);

        if (favoriteSnap.exists()) {
          setIsFavorite(true);
        }
      } catch (error) {
        console.error("Error fetching favorite status:", error);
      }
    };

    fetchFavoriteStatus();
  }, [userId, product.id]);

  // Calculate discount percentage
  const discountPercentage = Math.round(
    ((product.originalPrice - product.discountedPrice) /
      product.originalPrice) *
      100
  );

  // Get status color
  const getStatusColor = () => {
    switch (product.status) {
      case "In Stock":
        return "bg-green-500/10 text-green-600 dark:text-green-400";
      case "Low Stock":
        return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400";
      case "Out of Stock":
        return "bg-red-500/10 text-red-600 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  // Generate random rating for demo
  const rating = Math.random() * (5 - 3.5) + 3.5;
  const reviewCount = Math.floor(Math.random() * 100) + 10;

  // Save favorite to Firebase
  const saveFavoriteToFirebase = async (productId: string) => {
    if (!userId) {
      // Redirect to login or show login modal
      alert("Please login to add favorites");
      return;
    }

    setIsLoadingFavorite(true);
    try {
      const favoriteRef = doc(db, "users", userId, "favorites", productId);

      if (isFavorite) {
        // Remove from favorites
        await deleteDoc(favoriteRef);
        setIsFavorite(false);
        if (onFavoriteToggle) onFavoriteToggle(productId, false);
      } else {
        // Add to favorites
        await setDoc(favoriteRef, {
          productId,
          name: product.name,
          imageUrl: product.imageUrl,
          price: product.discountedPrice,
          category: product.category,
          addedAt: serverTimestamp(),
        });
        setIsFavorite(true);
        if (onFavoriteToggle) onFavoriteToggle(productId, true);
      }
    } catch (error) {
      console.error("Error updating favorite:", error);
      alert("Failed to update favorite. Please try again.");
      setIsFavorite(!isFavorite); // Revert UI state on error
    } finally {
      setIsLoadingFavorite(false);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product);
    }
  };

  const handleAddToFavorites = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!userId) {
      // Show login modal or redirect
      window.location.href = "/login?redirect=/products";
      return;
    }

    await saveFavoriteToFirebase(product.id);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onQuickView) {
      onQuickView(product);
    }
  };

  const handleViewDetails = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.location.href = `/product/${product.id}`;
  };

  const handleImageClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isMobile) {
      // On mobile, open full image modal directly
      setShowFullImage(true);
    } else {
      // On desktop, toggle zoom
      setShowFullImage(!showFullImage);
    }
  };

  const handleTouchStart = () => {
    setIsHovered(true);
  };

  const handleTouchEnd = () => {
    setTimeout(() => setIsHovered(false), 1500);
  };

  return (
    <>
      <div
        className="group relative"
        onMouseEnter={() => !isMobile && setIsHovered(true)}
        onMouseLeave={() => !isMobile && setIsHovered(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <Link href={`/product/${product.id}`} className="block">
          {/* Product Card Container */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 dark:border-gray-800 h-full transform group-hover:-translate-y-2">
            {/* Image Container - Responsive */}
            <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
              {/* Discount Badge - Responsive */}
              {discountPercentage > 0 && (
                <div className="absolute top-3 left-3 md:top-4 md:left-4 z-20">
                  <div className="relative">
                    <div className="bg-gradient-to-r from-[#ff6b6b] to-[#ee5a52] text-white text-xs md:text-sm font-bold px-3 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl shadow-xl flex items-center gap-1 md:gap-1.5">
                      <FiTag className="w-2.5 h-2.5 md:w-3 md:h-3" />-
                      {discountPercentage}%
                    </div>
                    <div className="absolute -bottom-0.5 md:-bottom-1 left-3 md:left-4 w-2 h-2 md:w-3 md:h-3 bg-gradient-to-r from-[#ff6b6b] to-[#ee5a52] transform rotate-45"></div>
                  </div>
                </div>
              )}

              {/* Favorite Button - Responsive */}
              {showActions && (
                <button
                  onClick={handleAddToFavorites}
                  disabled={isLoadingFavorite}
                  className="absolute top-3 right-3 md:top-4 md:right-4 z-20 p-2 md:p-3 rounded-lg md:rounded-xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 hover:scale-110 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label={
                    isFavorite ? "Remove from favorites" : "Add to favorites"
                  }
                >
                  {isLoadingFavorite ? (
                    <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-[#e39a89] border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <FiHeart
                      className={`w-4 h-4 md:w-5 md:h-5 transition-all duration-300 ${
                        isFavorite
                          ? "text-red-500 fill-red-500 scale-110"
                          : "text-gray-600 dark:text-gray-400 group-hover:text-red-500"
                      }`}
                    />
                  )}
                </button>
              )}

              {/* Product Image - Responsive Height */}
              <div
                className={`relative ${
                  isMobile ? "h-64" : "h-64 md:h-72 lg:h-80"
                } cursor-pointer`}
                onClick={handleImageClick}
              >
                {product.imageUrl && !imageError ? (
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    className={`object-cover transition-all duration-700 ${
                      isMobile
                        ? "group-active:scale-105"
                        : "group-hover:scale-110"
                    }`}
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    onError={() => setImageError(true)}
                    priority={false}
                    quality={85}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center p-4 md:p-8">
                      <FiPackage className="w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 text-gray-300 dark:text-gray-700 mx-auto mb-2 md:mb-4" />
                      <p className="text-xs md:text-sm text-gray-400 dark:text-gray-500">
                        No image available
                      </p>
                    </div>
                  </div>
                )}

                {/* Image Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                {/* View Full Image Indicator - Only on desktop */}
                {isHovered && !isMobile && (
                  <div className="absolute bottom-3 right-3 md:bottom-4 md:right-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-lg px-2 py-1 md:px-3 md:py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Click to zoom
                  </div>
                )}

                {/* Mobile Touch Indicator */}
                {isMobile && (
                  <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm rounded-lg px-2 py-1 text-xs font-medium text-white">
                    Tap to view
                  </div>
                )}
              </div>

              {/* Status Badge - Responsive */}
              <div className="absolute bottom-3 left-3 md:bottom-4 md:left-4">
                <span
                  className={`text-xs font-medium px-2 py-1 md:px-3 md:py-1.5 rounded-full ${getStatusColor()} backdrop-blur-sm`}
                >
                  {product.status}
                </span>
              </div>
            </div>

            {/* Product Info */}
            <div className="p-4 md:p-6">
              {/* Category Badge */}
              <div className="mb-2 md:mb-3">
                <span className="inline-flex items-center gap-1.5 md:gap-2 text-xs font-medium text-[#e39a89] bg-[#e39a89]/10 dark:bg-[#e39a89]/20 px-2.5 py-1 md:px-3 md:py-1.5 rounded-full">
                  <FiTag className="w-2.5 h-2.5 md:w-3 md:h-3" />
                  {product.category}
                </span>
              </div>

              {/* Product Name with View Details */}
              <div className="flex items-start justify-between gap-3 md:gap-4 mb-2 md:mb-3">
                <h3 className="font-bold text-gray-800 dark:text-white text-base md:text-lg line-clamp-1 flex-1">
                  {product.name}
                </h3>
                <button
                  onClick={handleViewDetails}
                  className="flex items-center gap-1 text-xs md:text-sm text-[#e39a89] hover:text-[#d87a6a] font-medium group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap"
                >
                  View details
                  <FiChevronRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
                </button>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 md:mb-4 line-clamp-2 min-h-[2.5rem] md:min-h-[3rem]">
                {product.description}
              </p>

              {/* Rating and Reviews */}
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <FiStar
                        key={i}
                        className={`w-3.5 h-3.5 md:w-4 md:h-4 ${
                          i < Math.floor(rating)
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300 dark:text-gray-700"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-gray-800 dark:text-white">
                    {rating.toFixed(1)}
                  </span>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {reviewCount} reviews
                </span>
              </div>

              {/* Price Section */}
              <div className="mb-3 md:mb-4">
                <div className="flex flex-wrap items-baseline gap-2 mb-2">
                  <span className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white">
                    ₵{product.discountedPrice.toFixed(2)}
                  </span>
                  {product.originalPrice > product.discountedPrice && (
                    <>
                      <span className="text-xs md:text-sm text-gray-400 line-through">
                        ₵{product.originalPrice.toFixed(2)}
                      </span>
                      <span className="text-xs font-medium text-green-600 bg-green-50 dark:bg-green-900/30 px-1.5 py-0.5 md:px-2 md:py-0.5 rounded">
                        Save ₵
                        {(
                          product.originalPrice - product.discountedPrice
                        ).toFixed(2)}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Primary Action Button - Mobile optimized */}
              {showActions && (
                <button
                  onClick={handleAddToCart}
                  disabled={
                    product.status === "Out of Stock" || product.quantity === 0
                  }
                  className={`w-full py-3 md:py-3.5 rounded-xl font-medium flex items-center justify-center gap-2 md:gap-3 transition-all duration-300 text-sm md:text-base ${
                    product.status === "Out of Stock" || product.quantity === 0
                      ? "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-[#e39a89] to-[#d87a6a] text-white hover:opacity-90 hover:shadow-xl active:scale-95"
                  }`}
                >
                  <FiShoppingCart className="w-4 h-4 md:w-5 md:h-5" />
                  {product.status === "Out of Stock" || product.quantity === 0
                    ? "Out of Stock"
                    : isMobile
                    ? "Add to Cart"
                    : `Add to Cart `}
                </button>
              )}
            </div>
          </div>
        </Link>

        {/* Glow Effect - Only on desktop */}
        {!isMobile && (
          <div className="absolute -inset-1 bg-gradient-to-r from-[#e39a89]/10 via-[#d87a6a]/5 to-[#c86a5a]/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500 -z-10"></div>
        )}
      </div>

      {/* Full Image Modal */}
      {showFullImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-sm"
          onClick={() => setShowFullImage(false)}
        >
          <button
            onClick={() => setShowFullImage(false)}
            className="absolute top-4 right-4 z-50 p-3 bg-white/10 backdrop-blur-sm rounded-xl text-white hover:bg-white/20 transition-colors duration-200"
          >
            ✕
          </button>

          <div
            className="relative w-full max-w-4xl h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {product.imageUrl && !imageError ? (
              <div className="relative w-full h-full">
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  className="object-contain rounded-2xl"
                  sizes="100vw"
                  priority
                />
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-900 rounded-2xl">
                <div className="text-center">
                  <FiPackage className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 text-gray-600 mx-auto mb-4" />
                  <p className="text-base sm:text-lg text-gray-400">
                    No image available
                  </p>
                </div>
              </div>
            )}

            {/* Image Info Overlay - Responsive */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 sm:p-6 rounded-b-2xl">
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
                {product.name}
              </h3>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
                <div>
                  <span className="text-lg font-bold text-white">
                    ₵{product.discountedPrice.toFixed(2)}
                  </span>
                  {product.originalPrice > product.discountedPrice && (
                    <span className="ml-2 text-sm text-gray-300 line-through">
                      ₵{product.originalPrice.toFixed(2)}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => {
                    setShowFullImage(false);
                    window.location.href = `/product/${product.id}`;
                  }}
                  className="bg-gradient-to-r from-[#e39a89] to-[#d87a6a] text-white px-4 py-2 sm:px-6 sm:py-2 rounded-xl font-medium hover:opacity-90 transition-opacity duration-200 text-sm sm:text-base w-full sm:w-auto"
                >
                  View Product Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
