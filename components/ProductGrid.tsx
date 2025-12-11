"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import ProductCard from "./ProductCard";
import { Product } from "@/types/product";
import { FiLoader, FiFilter, FiGrid, FiList } from "react-icons/fi";

interface ProductsGridProps {
  category?: string;
  limitCount?: number;
  showFilters?: boolean;
  layout?: "grid" | "list";
}

export default function ProductsGrid({
  category,
  limitCount = 12,
  showFilters = true,
  layout = "grid",
}: ProductsGridProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">(layout);
  const [sortBy, setSortBy] = useState("newest");

  // Fetch products from Firebase
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        let q = query(collection(db, "products"), orderBy("createdAt", "desc"));

        if (limitCount) {
          q = query(q, limit(limitCount));
        }

        const snapshot = await getDocs(q);
        let fetchedProducts = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Product[];

        // Filter by category if provided
        if (category) {
          fetchedProducts = fetchedProducts.filter(
            (product) =>
              product.category.toLowerCase() === category.toLowerCase()
          );
        }

        // Sort products
        fetchedProducts = sortProducts(fetchedProducts, sortBy);

        setProducts(fetchedProducts);
        setError(null);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load products. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category, limitCount, sortBy]);

  // Sort function
  const sortProducts = (products: Product[], sortType: string) => {
    const sorted = [...products];
    switch (sortType) {
      case "price-low":
        return sorted.sort((a, b) => a.discountedPrice - b.discountedPrice);
      case "price-high":
        return sorted.sort((a, b) => b.discountedPrice - a.discountedPrice);
      case "name":
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case "newest":
      default:
        return sorted.sort(
          (a, b) => b.createdAt.toMillis() - a.createdAt.toMillis()
        );
    }
  };

  // Handle add to cart
  const handleAddToCart = (product: Product) => {
    console.log("Added to cart:", product);
    // TODO: Implement cart functionality
    // You can connect this to your cart context/state
  };

  // Handle add to favorites
  const handleFavoriteToggle = (productId: string, isFavorite: boolean) => {
    console.log("Favorite toggled:", { productId, isFavorite });
    // TODO: Implement favorites toggle functionality
  };

  // Handle quick view
  const handleQuickView = (product: Product) => {
    console.log("Quick view:", product);
    // TODO: Implement quick view modal
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-center">
          <FiLoader className="w-12 h-12 text-[#e39a89] animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Loading products...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
          <FiLoader className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
          Unable to load products
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-[#e39a89] text-white rounded-lg hover:opacity-90 transition-opacity"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Empty state
  if (products.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <FiFilter className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
          No products found
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          {category
            ? `No products available in "${category}" category`
            : "No products available at the moment"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Filters Bar */}
      {showFilters && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing <span className="font-semibold">{products.length}</span>{" "}
            {category ? `products in ${category}` : "products"}
          </div>

          <div className="flex items-center gap-4">
            {/* View Toggle */}
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded transition-colors ${
                  viewMode === "grid"
                    ? "bg-white dark:bg-gray-600 text-gray-800 dark:text-white"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
                aria-label="Grid view"
              >
                <FiGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded transition-colors ${
                  viewMode === "list"
                    ? "bg-white dark:bg-gray-600 text-gray-800 dark:text-white"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
                aria-label="List view"
              >
                <FiList className="w-4 h-4" />
              </button>
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-2 pl-10 pr-8 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#e39a89]/20 focus:border-[#e39a89]"
              >
                <option value="newest">Newest Arrivals</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name: A to Z</option>
              </select>
              <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
          </div>
        </div>
      )}

      {/* Products Grid */}
      <div
        className={
          viewMode === "grid"
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            : "space-y-6"
        }
      >
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={handleAddToCart}
            onFavoriteToggle={handleFavoriteToggle}
            onQuickView={handleQuickView}
            showActions={true}
          />
        ))}
      </div>
    </div>
  );
}
