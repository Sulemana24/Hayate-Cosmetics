"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import Image from "next/image";
import Link from "next/link";
import {
  FiArrowLeft,
  FiFilter,
  FiGrid,
  FiList,
  FiStar,
  FiTag,
} from "react-icons/fi";

interface Product {
  id: string;
  name: string;
  price: number;
  discountedPrice: number;
  imageUrl: string;
  category: string;
  status: string;
  description: string;
  originalPrice: number;
  rating?: number;
  createdAt?: Date;
}

export default function NewArrivalsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [categories, setCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>("newest");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const productsRef = collection(db, "products");

        const q = query(productsRef, orderBy("createdAt", "desc"));

        const snapshot = await getDocs(q);
        const productsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Product[];

        const uniqueCategories = Array.from(
          new Set(productsData.map((p) => p.category))
        );
        setCategories(["all", ...uniqueCategories]);

        let sortedProducts = [...productsData];
        if (sortBy === "price-low") {
          sortedProducts.sort((a, b) => a.discountedPrice - b.discountedPrice);
        } else if (sortBy === "price-high") {
          sortedProducts.sort((a, b) => b.discountedPrice - a.discountedPrice);
        } else if (sortBy === "rating") {
          sortedProducts.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        }

        if (selectedCategory !== "all") {
          sortedProducts = sortedProducts.filter(
            (p) => p.category === selectedCategory
          );
        }

        setProducts(sortedProducts);
      } catch (error) {
        console.error("Error fetching new arrivals:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory, sortBy]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#e39a89]/10 to-[#1b3c35]/10 dark:from-[#e39a89]/20 dark:to-[#1b3c35]/20">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center gap-4 mb-6">
            <Link
              href="/"
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-[#e39a89]"
            >
              <FiArrowLeft /> Back to Home
            </Link>
          </div>

          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-[#1b3c35] dark:text-white mb-4">
              New Arrivals
            </h1>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Discover the latest beauty products fresh in our store. Be the
              first to try new trends and innovations.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <FiFilter className="text-gray-600 dark:text-gray-400" />
              <span className="font-medium">Filter by:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === "all"
                    ? "bg-[#e39a89] text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                All Products
              </button>
              {categories
                .filter((cat) => cat !== "all")
                .map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedCategory === category
                        ? "bg-[#e39a89] text-white"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                    }`}
                  >
                    {category}
                  </button>
                ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="font-medium">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#e39a89]"
              >
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg ${
                  viewMode === "grid"
                    ? "bg-[#e39a89] text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                <FiGrid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg ${
                  viewMode === "list"
                    ? "bg-[#e39a89] text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                <FiList className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 dark:bg-gray-700 h-64 rounded-xl mb-3"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                : "space-y-6"
            }
          >
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/product/${product.id}`}
                className={`group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 ${
                  viewMode === "list" ? "flex gap-6 p-6" : "p-4"
                }`}
              >
                <div
                  className={`relative overflow-hidden rounded-xl ${
                    viewMode === "list"
                      ? "w-48 h-48 flex-shrink-0"
                      : "aspect-square"
                  }`}
                >
                  <Image
                    src={product.imageUrl || "/api/placeholder/400/400"}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes={
                      viewMode === "list"
                        ? "192px"
                        : "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    }
                  />
                  <div className="absolute top-2 left-2 bg-[#e39a89] text-white px-3 py-1 rounded-full text-xs font-bold">
                    NEW
                  </div>
                  {product.originalPrice > product.discountedPrice && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                      SALE
                    </div>
                  )}
                </div>

                <div
                  className={`flex-1 ${viewMode === "list" ? "py-2" : "mt-4"}`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center gap-1 text-sm text-[#e39a89] bg-[#e39a89]/10 dark:bg-[#e39a89]/20 px-2 py-1 rounded">
                      <FiTag className="w-3 h-3" /> {product.category}
                    </span>
                    <span
                      className={`text-sm px-2 py-1 rounded ${
                        product.status === "In Stock"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      }`}
                    >
                      {product.status}
                    </span>
                  </div>

                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                    {product.name}
                  </h3>

                  {viewMode === "list" && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                      {product.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl font-bold text-[#1b3c35] dark:text-white">
                          ₵{product.discountedPrice.toFixed(2)}
                        </span>
                        {product.originalPrice > product.discountedPrice && (
                          <>
                            <span className="text-sm line-through text-gray-400">
                              ₵{product.originalPrice.toFixed(2)}
                            </span>
                            <span className="text-sm text-red-500 font-medium">
                              Save{" "}
                              {Math.round(
                                ((product.originalPrice -
                                  product.discountedPrice) /
                                  product.originalPrice) *
                                  100
                              )}
                              %
                            </span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <FiStar className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {product.rating?.toFixed(1) || "4.5"}
                        </span>
                      </div>
                    </div>

                    {viewMode === "list" && (
                      <button className="px-6 py-2 bg-gradient-to-r from-[#e39a89] to-[#d87a6a] text-white rounded-lg hover:opacity-90 transition-opacity">
                        View Product
                      </button>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 max-w-md mx-auto">
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiTag className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">No New Arrivals Found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {selectedCategory !== "all"
                  ? `No new products found in ${selectedCategory}. Try another category.`
                  : "Check back soon for new products!"}
              </p>
              {selectedCategory !== "all" && (
                <button
                  onClick={() => setSelectedCategory("all")}
                  className="px-6 py-3 bg-gradient-to-r from-[#e39a89] to-[#d87a6a] text-white rounded-lg hover:opacity-90"
                >
                  View All Products
                </button>
              )}
            </div>
          </div>
        )}

        {/* Results Count */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400">
            Showing {products.length} new arrival
            {products.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>
    </div>
  );
}
