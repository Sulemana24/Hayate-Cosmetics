"use client";

import { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  query,
  where,
  addDoc,
  Timestamp,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import {
  FiHeart,
  FiShoppingCart,
  FiTrash2,
  FiArrowLeft,
  FiShare2,
  FiFilter,
  FiSearch,
  FiX,
  FiStar,
  FiClock,
  FiEye,
  FiChevronRight,
  FiGrid,
  FiList,
  FiShoppingBag,
  FiPackage,
  FiTrendingUp,
} from "react-icons/fi";
import Image from "next/image";

interface Product {
  id: string;
  productId: string;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  category?: string;
  rating?: number;
  reviewCount?: number;
  stock?: number;
  isOnSale?: boolean;
  addedAt: Date | Timestamp;
  inStock?: boolean;
  discountPercentage?: number;
  colors?: string[];
  sizes?: string[];
}

const getTimestampValue = (timestamp: Date | Timestamp): number => {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate().getTime();
  }
  if (timestamp instanceof Date) {
    return timestamp.getTime();
  }

  const date = new Date((timestamp as Timestamp).toDate());
  return date.getTime();
};

export default function Favorites() {
  const router = useRouter();
  const auth = getAuth();
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<string>("recent");

  // Fetch favorites from Firebase
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUserId(user.uid);
      } else {
        router.push("/login?redirect=/favorites");
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (!currentUserId) return;

    const fetchFavorites = async () => {
      try {
        setLoading(true);
        const favoritesRef = collection(
          db,
          "users",
          currentUserId,
          "favorites"
        );
        const snapshot = await getDocs(favoritesRef);

        const favoritesList: Product[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();

          let addedAt: Date | Timestamp;

          if (data.addedAt instanceof Timestamp) {
            addedAt = data.addedAt;
          } else if (data.addedAt?.toDate) {
            // Handle case where it's a Firestore timestamp object
            addedAt = data.addedAt;
          } else if (data.addedAt) {
            addedAt = new Date(data.addedAt);
          } else {
            addedAt = Timestamp.now();
          }

          favoritesList.push({
            id: doc.id,
            productId: data.productId || doc.id,
            name: data.name || "Unnamed Product",
            description: data.description || "",
            price: data.price || 0,
            originalPrice: data.originalPrice || data.price,
            imageUrl: data.imageUrl || data.image || "/placeholder-product.jpg",
            category: data.category || "",
            rating: data.rating || 0,
            reviewCount: data.reviewCount || 0,
            stock: data.stock || 0,
            isOnSale: data.isOnSale || false,
            inStock:
              data.inStock !== undefined ? data.inStock : (data.stock || 0) > 0,
            discountPercentage: data.discountPercentage || 0,
            colors: data.colors || [],
            sizes: data.sizes || [],
            addedAt: addedAt,
          });
        });

        // Apply sorting using the helper function
        const sortedFavorites = sortProducts(favoritesList, sortBy);
        setFavorites(sortedFavorites);
      } catch (error) {
        console.error("Error fetching favorites:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [currentUserId, sortBy]);

  // Sort products based on selected criteria
  const sortProducts = (products: Product[], sortType: string): Product[] => {
    const sorted = [...products];

    switch (sortType) {
      case "recent":
        return sorted.sort(
          (a, b) => getTimestampValue(b.addedAt) - getTimestampValue(a.addedAt)
        );
      case "price-low":
        return sorted.sort((a, b) => a.price - b.price);
      case "price-high":
        return sorted.sort((a, b) => b.price - a.price);
      case "name":
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case "rating":
        return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      default:
        return sorted;
    }
  };

  // Remove item from favorites
  const removeFromFavorites = async (productId: string) => {
    if (!currentUserId) return;

    try {
      setRemovingId(productId);
      await deleteDoc(doc(db, "users", currentUserId, "favorites", productId));
      setFavorites(favorites.filter((item) => item.id !== productId));
      setSelectedItems(selectedItems.filter((id) => id !== productId));
    } catch (error) {
      console.error("Error removing from favorites:", error);
    } finally {
      setRemovingId(null);
    }
  };

  // Remove multiple items
  const removeMultipleFromFavorites = async () => {
    if (!currentUserId || selectedItems.length === 0) return;

    try {
      const promises = selectedItems.map((itemId) =>
        deleteDoc(doc(db, "users", currentUserId, "favorites", itemId))
      );
      await Promise.all(promises);
      setFavorites(
        favorites.filter((item) => !selectedItems.includes(item.id))
      );
      setSelectedItems([]);
    } catch (error) {
      console.error("Error removing multiple favorites:", error);
    }
  };

  // Toggle select item
  const toggleSelectItem = (productId: string) => {
    if (selectedItems.includes(productId)) {
      setSelectedItems(selectedItems.filter((id) => id !== productId));
    } else {
      setSelectedItems([...selectedItems, productId]);
    }
  };

  // Select all items
  const selectAllItems = () => {
    if (selectedItems.length === filteredFavorites.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredFavorites.map((item) => item.id));
    }
  };

  // Move to cart
  const moveToCart = async (product: Product) => {
    if (!currentUserId) {
      router.push("/login");
      return;
    }

    try {
      // Add to cart in Firebase
      const cartRef = collection(db, "users", currentUserId, "cart");
      await addDoc(cartRef, {
        productId: product.productId,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        quantity: 1,
        addedAt: Timestamp.now(),
      });

      // Remove from favorites
      await removeFromFavorites(product.id);

      // Optional: Show success message or redirect
      router.push("/cart");
    } catch (error) {
      console.error("Error moving to cart:", error);
    }
  };

  // Format date for display
  const formatAddedDate = (timestamp: Date | Timestamp): string => {
    try {
      let date: Date;

      if (timestamp instanceof Timestamp) {
        date = timestamp.toDate();
      } else if (timestamp instanceof Date) {
        date = timestamp;
      } else {
        date = (timestamp as Timestamp).toDate();
      }

      if (isNaN(date.getTime())) return "Recently added";

      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return "Today";
      if (diffDays === 1) return "Yesterday";
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;

      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch (error) {
      return "Recently added";
    }
  };

  // Filter and search favorites
  const filteredFavorites = favorites.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      false ||
      product.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      false;

    if (selectedFilter === "all") return matchesSearch;
    if (selectedFilter === "in-stock") return matchesSearch && product.inStock;
    if (selectedFilter === "on-sale") return matchesSearch && product.isOnSale;
    if (selectedFilter === "out-of-stock")
      return matchesSearch && !product.inStock;

    return matchesSearch;
  });

  // Calculate total value
  const totalValue = filteredFavorites.reduce(
    (sum, item) => sum + item.price,
    0
  );
  const totalSavings = filteredFavorites.reduce((sum, item) => {
    if (item.originalPrice && item.originalPrice > item.price) {
      return sum + (item.originalPrice - item.price);
    }
    return sum;
  }, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded-lg w-64 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-96 bg-gray-100 dark:bg-gray-800 rounded-2xl"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
      {/* Header Section */}
      <div className="py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl shadow-lg">
                  <FiHeart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                    My Favorites
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    {favorites.length} saved item
                    {favorites.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/")}
                className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <FiArrowLeft className="w-4 h-4" />
                <span className="font-medium text-sm">Continue Shopping</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
        {/* Stats Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total Items
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {favorites.length}
                </p>
              </div>
              <div className="p-3 bg-pink-50 dark:bg-pink-900/20 rounded-xl">
                <FiHeart className="w-6 h-6 text-pink-600 dark:text-pink-400" />
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total Value
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ₵{totalValue.toFixed(2)}
                </p>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <FiTrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Potential Savings
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ₵{totalSavings.toFixed(2)}
                </p>
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                <FiPackage className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  In Stock
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {favorites.filter((item) => item.inStock).length}
                </p>
              </div>
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
                <FiShoppingBag className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Controls Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 mb-8 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search favorites..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {["all", "in-stock", "on-sale", "out-of-stock"].map(
                  (filter) => (
                    <button
                      key={filter}
                      onClick={() => setSelectedFilter(filter)}
                      className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                        selectedFilter === filter
                          ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                      }`}
                    >
                      {filter
                        .replace("-", " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* View and Sort Controls */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-900 p-1 rounded-lg">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === "grid"
                      ? "bg-white dark:bg-gray-800 text-pink-600 shadow-sm"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  <FiGrid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === "list"
                      ? "bg-white dark:bg-gray-800 text-pink-600 shadow-sm"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  <FiList className="w-5 h-5" />
                </button>
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
              >
                <option value="recent">Most Recent</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name: A to Z</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedItems.length > 0 && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedItems.length === filteredFavorites.length}
                    onChange={selectAllItems}
                    className="w-5 h-5 text-pink-600 rounded focus:ring-pink-500"
                  />
                  <span className="font-medium text-gray-900 dark:text-white">
                    {selectedItems.length} selected
                  </span>
                </div>
                <button
                  onClick={removeMultipleFromFavorites}
                  className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                >
                  <FiTrash2 className="w-4 h-4" />
                  Remove Selected
                </button>
              </div>
              <button
                onClick={() => setSelectedItems([])}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                Clear Selection
              </button>
            </div>
          )}
        </div>

        {/* Favorites Content */}
        {filteredFavorites.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-pink-100 to-rose-100 dark:from-pink-900/20 dark:to-rose-900/20 flex items-center justify-center">
                <FiHeart className="w-12 h-12 text-pink-400 dark:text-pink-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                {searchQuery
                  ? "No matches found"
                  : "Your favorites list is empty"}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-sm mx-auto">
                {searchQuery
                  ? "Try adjusting your search or filter to find what you're looking for"
                  : "Start adding items you love to see them here!"}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => router.push("/")}
                  className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
                >
                  Start Shopping
                </button>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Products Grid/List */}
            <div
              className={`${
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  : "space-y-4"
              }`}
            >
              {filteredFavorites.map((product) => (
                <div
                  key={product.id}
                  className={`group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 ${
                    viewMode === "list" ? "flex" : ""
                  }`}
                >
                  {/* Select Checkbox */}
                  <div className="absolute top-4 left-4 z-10">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(product.id)}
                      onChange={() => toggleSelectItem(product.id)}
                      className="w-5 h-5 text-pink-600 rounded focus:ring-pink-500 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                    />
                  </div>

                  {/* Image Container */}
                  <div
                    className={`relative overflow-hidden ${
                      viewMode === "list" ? "w-1/3 md:w-1/4" : "w-full h-64"
                    }`}
                  >
                    <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                      <button
                        onClick={() => removeFromFavorites(product.id)}
                        disabled={removingId === product.id}
                        className="p-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg hover:bg-white dark:hover:bg-gray-700 transition-colors shadow-lg"
                      >
                        <FiTrash2
                          className={`w-4 h-4 text-red-500 ${
                            removingId === product.id ? "animate-pulse" : ""
                          }`}
                        />
                      </button>
                      <button className="p-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg hover:bg-white dark:hover:bg-gray-700 transition-colors shadow-lg">
                        <FiShare2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </button>
                    </div>

                    <div className="relative w-full h-full">
                      <Image
                        src={product.imageUrl || "/placeholder-product.jpg"}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes={
                          viewMode === "list"
                            ? "33vw"
                            : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        }
                      />
                      {product.isOnSale && (
                        <div className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                          SALE
                        </div>
                      )}
                      {!product.inStock && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="text-white font-bold bg-black/70 px-4 py-2 rounded-lg">
                            Out of Stock
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Product Info */}
                  <div
                    className={`p-5 ${
                      viewMode === "list" ? "w-2/3 md:w-3/4" : ""
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors line-clamp-2">
                          {product.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          {product.category && (
                            <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                              {product.category}
                            </span>
                          )}
                          <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                            <FiClock className="w-3 h-3" />
                            {formatAddedDate(product.addedAt)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <FiStar className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {product.rating?.toFixed(1) || "4.5"}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          ({product.reviewCount || 0})
                        </span>
                      </div>
                    </div>

                    {viewMode === "list" && product.description && (
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                        {product.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-gray-900 dark:text-white">
                          ₵{product.price.toFixed(2)}
                        </span>
                        {product.originalPrice &&
                          product.originalPrice > product.price && (
                            <>
                              <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                                ₵{product.originalPrice.toFixed(2)}
                              </span>
                              <span className="text-xs font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded">
                                Save ₵
                                {(
                                  product.originalPrice - product.price
                                ).toFixed(2)}
                              </span>
                            </>
                          )}
                      </div>
                      {product.stock !== undefined && (
                        <div className="flex items-center gap-1 text-sm">
                          <FiPackage className="w-4 h-4 text-gray-400" />
                          <span
                            className={`font-medium ${
                              product.stock > 10
                                ? "text-green-600 dark:text-green-400"
                                : product.stock > 0
                                ? "text-yellow-600 dark:text-yellow-400"
                                : "text-red-600 dark:text-red-400"
                            }`}
                          >
                            {product.stock > 10
                              ? "In Stock"
                              : product.stock > 0
                              ? `${product.stock} left`
                              : "Out of Stock"}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {product.colors?.slice(0, 3).map((color, index) => (
                        <div
                          key={index}
                          className="w-6 h-6 rounded-full border border-gray-300 dark:border-gray-600"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                      {product.sizes?.slice(0, 3).map((size, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded"
                        >
                          {size}
                        </span>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => moveToCart(product)}
                        disabled={!product.inStock || removingId === product.id}
                        className={`flex-1 min-w-[120px] px-4 py-3 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                          product.inStock
                            ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:opacity-90"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        <FiShoppingCart className="w-4 h-4" />
                        {product.inStock ? "Add to Cart" : "Out of Stock"}
                      </button>
                      <button
                        onClick={() =>
                          router.push(`/product/${product.productId}`)
                        }
                        className="px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl font-medium text-sm transition-colors flex items-center gap-2"
                      >
                        <FiEye className="w-4 h-4" />
                        View
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination or Load More */}
            {filteredFavorites.length > 12 && (
              <div className="flex justify-center mt-12">
                <button className="px-6 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium flex items-center gap-2">
                  Load More
                  <FiChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
