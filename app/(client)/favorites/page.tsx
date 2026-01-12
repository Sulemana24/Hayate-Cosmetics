"use client";

import { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  addDoc,
  query,
  where,
  getDoc,
  documentId,
  Timestamp,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Favorite } from "@/types/favorite";
import {
  FiHeart,
  FiShoppingCart,
  FiTrash2,
  FiArrowLeft,
  FiSearch,
  FiX,
  FiStar,
  FiClock,
  FiEye,
  FiChevronRight,
  FiGrid,
  FiList,
  FiPackage,
} from "react-icons/fi";
import Image from "next/image";

interface Product {
  id: string;
  name: string;
  description: string;
  originalPrice: number;
  discountedPrice: number;
  imageUrl?: string;
  category: string;
  quantity: number;
  status: "In Stock" | "Low Stock" | "Out of Stock";
  addedAt: Timestamp | Date;
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

        if (snapshot.empty) {
          setFavorites([]);
          return;
        }

        const favoriteDocs = snapshot.docs.map(
          (docSnap) =>
            ({
              id: docSnap.id,
              ...docSnap.data(),
            } as Favorite)
        );

        const productIds = favoriteDocs.map((f) => f.productId);

        const productBatches: string[][] = [];
        for (let i = 0; i < productIds.length; i += 10) {
          productBatches.push(productIds.slice(i, i + 10));
        }

        const productsData: Record<string, Partial<Product>> = {};

        for (const batch of productBatches) {
          const q = await getDocs(
            query(collection(db, "products"), where("__name__", "in", batch))
          );

          q.forEach((docSnap) => {
            productsData[docSnap.id] = docSnap.data();
          });
        }

        const favoritesList: Product[] = favoriteDocs.map((fav) => {
          const productData = productsData[fav.productId];

          const quantity = productData?.quantity ?? 0;

          const status: Product["status"] =
            quantity === 0
              ? "Out of Stock"
              : quantity <= 5
              ? "Low Stock"
              : "In Stock";

          return {
            id: fav.productId,
            name: productData?.name || fav.name,
            description: productData?.description || "",
            originalPrice: productData?.originalPrice || fav.price,
            discountedPrice: productData?.discountedPrice || fav.price,
            imageUrl: productData?.imageUrl || fav.imageUrl,
            category: productData?.category || fav.category,
            quantity,
            status,
            addedAt: fav.addedAt || Timestamp.now(),
          };
        });

        setFavorites(sortProducts(favoritesList, sortBy));
      } catch (error) {
        console.error("Error fetching favorites:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [currentUserId, sortBy]);

  const sortProducts = (products: Product[], sortType: string): Product[] => {
    const sorted = [...products];

    switch (sortType) {
      case "recent":
        return sorted.sort(
          (a, b) => getTimestampValue(b.addedAt) - getTimestampValue(a.addedAt)
        );
      case "price-low":
        return sorted.sort((a, b) => a.discountedPrice - b.discountedPrice);
      case "price-high":
        return sorted.sort((a, b) => b.discountedPrice - a.discountedPrice);
      case "name":
        return sorted.sort((a, b) => a.name.localeCompare(b.name));

      default:
        return sorted;
    }
  };

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

  const toggleSelectItem = (productId: string) => {
    if (selectedItems.includes(productId)) {
      setSelectedItems(selectedItems.filter((id) => id !== productId));
    } else {
      setSelectedItems([...selectedItems, productId]);
    }
  };

  const selectAllItems = () => {
    if (selectedItems.length === filteredFavorites.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredFavorites.map((item) => item.id));
    }
  };

  const moveToCart = async (product: Product) => {
    if (!currentUserId) {
      router.push("/login");
      return;
    }

    try {
      const cartRef = collection(db, "users", currentUserId, "cart");
      await addDoc(cartRef, {
        productId: product.id,
        name: product.name,
        price: product.discountedPrice,

        imageUrl: product.imageUrl,
        quantity: 1,
        addedAt: Timestamp.now(),
      });

      await removeFromFavorites(product.id);

      router.push("/cart");
    } catch (error) {
      console.error("Error moving to cart:", error);
    }
  };

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
    if (selectedFilter === "in-stock")
      return matchesSearch && product.status !== "Out of Stock";
    if (selectedFilter === "on-sale") return matchesSearch && product.status;
    if (selectedFilter === "out-of-stock")
      return matchesSearch && product.status !== "Out of Stock";

    return matchesSearch;
  });

  // Calculate total value
  const totalValue = filteredFavorites.reduce(
    (sum, item) => sum + item.discountedPrice,
    0
  );
  const totalSavings = filteredFavorites.reduce((sum, item) => {
    if (item.originalPrice && item.originalPrice > item.discountedPrice) {
      return sum + (item.originalPrice - item.discountedPrice);
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
                <div className="p-3 bg-[#e39a89] rounded-xl shadow-lg">
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
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 mb-8 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search favorites..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#e39a89] focus:border-transparent"
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
                          ? "bg-[#e39a89] text-white"
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

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-900 p-1 rounded-lg">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === "grid"
                      ? "bg-white dark:bg-gray-800 text-[#e39a89] shadow-sm"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  <FiGrid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === "list"
                      ? "bg-white dark:bg-gray-800 text-[#e39a89] shadow-sm"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  <FiList className="w-5 h-5" />
                </button>
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:border-transparent text-sm"
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
                    className="w-5 h-5 text-[#e39a89] rounded focus:ring-[#e39a89]"
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
                <FiHeart className="w-12 h-12 text-[#e39a89] dark:text-[#e39a89" />
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
                  className="px-6 py-3 bg-[#e39a89] text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
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
                      className="w-5 h-5 text-[#e39a89] rounded focus:ring-[#e39a89] bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
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

                      <div className="absolute top-4 left-4 bg-[#e39a89] text-white px-3 py-1 rounded-full text-xs font-bold">
                        SALE
                      </div>

                      {/* {product.status !== "Out of Stock" && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="text-white font-bold bg-black/70 px-4 py-2 rounded-lg">
                            Out of Stock
                          </span>
                        </div>
                      )} */}
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
                        <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-[#e39a89] dark:group-hover:text-[#e39a89] transition-colors line-clamp-2">
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
                    </div>

                    {viewMode === "list" && product.description && (
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                        {product.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-gray-900 dark:text-white">
                          ₵{product.discountedPrice.toFixed(2)}
                        </span>
                        {product.originalPrice &&
                          product.originalPrice > product.discountedPrice && (
                            <>
                              <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                                ₵{product.originalPrice.toFixed(2)}
                              </span>
                              <span className="text-xs font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded">
                                Save ₵
                                {(
                                  product.originalPrice -
                                  product.discountedPrice
                                ).toFixed(2)}
                              </span>
                            </>
                          )}
                      </div>
                      {product.quantity !== undefined && (
                        <div className="flex items-center gap-1 text-sm">
                          <FiPackage className="w-4 h-4 text-gray-400" />
                          <span
                            className={`font-medium ${
                              product.quantity > 10
                                ? "text-green-600 dark:text-green-400"
                                : product.quantity > 0
                                ? "text-yellow-600 dark:text-yellow-400"
                                : "text-red-600 dark:text-red-400"
                            }`}
                          >
                            {product.quantity > 10
                              ? "In Stock"
                              : product.quantity > 0
                              ? `${product.quantity} left`
                              : "Out of Stock"}
                          </span>
                        </div>
                      )}
                    </div>

                    {/*  <div className="flex flex-wrap gap-2 mb-4">
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
                    </div> */}

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => moveToCart(product)}
                        disabled={
                          product.status !== "Out of Stock" ||
                          removingId === product.id
                        }
                        className={`flex-1 min-w-[120px] px-4 py-3 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                          product.status !== "Out of Stock"
                            ? "bg-[#e39a89] text-white hover:opacity-90"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        <FiShoppingCart className="w-4 h-4" />
                        {product.status !== "Out of Stock"
                          ? "Add to Cart"
                          : "Out of Stock"}
                      </button>
                      <button
                        onClick={() => router.push(`/product/${product.id}`)}
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
