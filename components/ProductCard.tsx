"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { FiHeart, FiPackage, FiTag } from "react-icons/fi";
import { Product } from "@/types/product";
import { db } from "@/lib/firebase";
import { getAuth } from "firebase/auth";
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
  userId?: string | null;
  layout?: "grid" | "list";
}

export default function ProductCard({
  product,
  onFavoriteToggle,
  showActions = true,
  isFavoriteInitially = false,
  userId = null,
  layout = "grid",
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(isFavoriteInitially);
  const [imageError, setImageError] = useState(false);
  const [isLoadingFavorite, setIsLoadingFavorite] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({
    width: 400,
    height: 400,
  });
  const [currentUserId, setCurrentUserId] = useState<string | null>(userId);

  useEffect(() => {
    const auth = getAuth();
    if (auth.currentUser) setCurrentUserId(auth.currentUser.uid);
  }, []);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (!currentUserId) return;
    const fetchFavoriteStatus = async () => {
      try {
        const favoriteRef = doc(
          db,
          "users",
          currentUserId,
          "favorites",
          product.id,
        );
        const favoriteSnap = await getDoc(favoriteRef);
        setIsFavorite(favoriteSnap.exists());
      } catch (err) {
        console.error("Error fetching favorite status:", err);
      }
    };
    fetchFavoriteStatus();
  }, [currentUserId, product.id]);

  // Preload image
  useEffect(() => {
    if (product.imageUrl && !imageError) {
      const img = new window.Image();
      img.src = product.imageUrl;
      img.onload = () =>
        setImageDimensions({
          width: img.naturalWidth,
          height: img.naturalHeight,
        });
    }
  }, [product.imageUrl, imageError]);

  const discountPercentage = Math.round(
    ((product.originalPrice - product.discountedPrice) /
      product.originalPrice) *
      100,
  );

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

  const aspectRatio = imageDimensions.width / imageDimensions.height;
  const isPortrait = aspectRatio < 1;
  const isLandscape = aspectRatio > 1.5;

  const getImageHeight = () => {
    if (layout === "list") return "h-48 sm:h-56 md:h-64 lg:h-72";
    if (isPortrait) return "h-56 sm:h-64 md:h-72 lg:h-80 xl:h-96";
    if (isLandscape) return "h-48 sm:h-52 md:h-56 lg:h-60 xl:h-64";
    return "h-52 sm:h-60 md:h-68 lg:h-72 xl:h-80";
  };

  const handleAddToFavorites = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      alert("You must be logged in to add favorites");
      return;
    }

    const favoriteRef = doc(db, "users", user.uid, "favorites", product.id);
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
      } else {
        await deleteDoc(favoriteRef);
      }
      onFavoriteToggle?.(product.id, nextFavoriteState);
    } catch (err) {
      console.error("Favorite update failed:", err);
      setIsFavorite(!nextFavoriteState);
      alert("Failed to update favorite. Try again.");
    } finally {
      setIsLoadingFavorite(false);
    }
  };

  const handleTouchStart = () => setIsHovered(true);
  const handleTouchEnd = () => setTimeout(() => setIsHovered(false), 1500);

  return (
    <div
      className={`group relative ${layout === "list" ? "sm:flex" : ""}`}
      onMouseEnter={() => !isMobile && setIsHovered(true)}
      onMouseLeave={() => !isMobile && setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {showActions && (
        <button
          onClick={handleAddToFavorites}
          disabled={isLoadingFavorite}
          className="absolute top-3 right-3 md:top-4 md:right-4 z-20 p-2 md:p-3 rounded-lg md:rounded-xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm hover:scale-110 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
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

      <Link
        href={`/product/${product.id}`}
        className={`
          block rounded-2xl shadow-lg dark:shadow-black/40

          hover:shadow-2xl transition-all duration-500 overflow-hidden
          border border-gray-100 dark:border-gray-800
          ${layout === "list" ? "sm:flex sm:items-stretch" : "h-full"}
          transform group-hover:-translate-y-2
        `}
      >
        <div
          className={`
            bg-white dark:bg-gray-900 rounded-2xl shadow-lg dark:shadow-black/40
 hover:shadow-2xl 
            transition-all duration-500 overflow-hidden border border-gray-100 dark:border-gray-800 
            ${
              layout === "list"
                ? "sm:flex-1 sm:flex sm:items-stretch"
                : "h-full"
            }
            transform group-hover:-translate-y-2
          `}
        >
          {/* Image & Status */}
          <div
            className={`
              relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 
              dark:from-gray-800 dark:to-gray-900
              ${layout === "list" ? "sm:w-1/3 sm:flex-shrink-0 sm:h-auto" : ""}
            `}
          >
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

            <div className="relative aspect-square w-full overflow-hidden cursor-pointer">
              {product.imageUrl && !imageError ? (
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  width={100}
                  height={100}
                  className={`object-cover w-full h-full transition-transform duration-300 ${
                    isMobile
                      ? "group-active:scale-105"
                      : "group-hover:scale-105"
                  }`}
                  sizes="(max-width: 768px) 100vw, 25vw"
                  onError={() => setImageError(true)}
                  quality={90}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                  <FiPackage className="w-12 h-12 text-gray-400" />
                </div>
              )}

              {/* Status badge */}
              <div className="absolute bottom-3 left-3">
                <span
                  className={`text-xs font-medium px-3 py-1 rounded-full ${getStatusColor()} backdrop-blur-sm`}
                >
                  {product.status}
                </span>
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div
            className={`p-4 md:p-6 ${
              layout === "list"
                ? "sm:flex-1 sm:flex sm:flex-col sm:justify-between"
                : ""
            }`}
          >
            <div className={layout === "list" ? "sm:mb-4" : ""}>
              <div className="mb-2 md:mb-3">
                <span className="inline-flex items-center gap-1.5 md:gap-2 text-xs font-medium text-[#e39a89] bg-[#e39a89]/10 dark:bg-[#e39a89]/20 px-2.5 py-1 md:px-3 md:py-1.5 rounded-full">
                  <FiTag className="w-2.5 h-2.5 md:w-3 md:h-3" />
                  {product.category}
                </span>
              </div>
              <div className="flex items-start justify-between gap-3 md:gap-4 mb-2 md:mb-3">
                <h3 className="font-bold text-gray-800 dark:text-white text-base md:text-lg line-clamp-1 flex-1">
                  {product.name}
                </h3>
              </div>

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
            </div>
          </div>
        </div>
      </Link>

      {!isMobile && (
        <div className="absolute -inset-1 bg-gradient-to-r from-[#e39a89]/10 via-[#d87a6a]/5 to-[#c86a5a]/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500 -z-10"></div>
      )}
    </div>
  );
}
