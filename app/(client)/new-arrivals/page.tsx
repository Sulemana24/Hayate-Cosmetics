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

// Shared tokens with the homepage: ink #1b3c35, clay #E39A89 (→ #c9614d
// for AA-safe text-on-cream), sage #8FA593, cream base #FBF6EF.

function CardSkeleton({ list = false }: { list?: boolean }) {
  return list ? (
    <div className="animate-pulse flex gap-6 p-4 sm:p-6 bg-white dark:bg-[#16302a] rounded-2xl ring-1 ring-black/5 dark:ring-white/5">
      <div className="w-32 h-32 sm:w-48 sm:h-48 shrink-0 bg-[#1b3c35]/[0.06] dark:bg-white/[0.06] rounded-xl" />
      <div className="flex-1 py-2 space-y-3">
        <div className="h-4 w-24 bg-[#1b3c35]/[0.06] dark:bg-white/[0.06] rounded" />
        <div className="h-4 w-3/4 bg-[#1b3c35]/[0.08] dark:bg-white/[0.08] rounded" />
        <div className="h-4 w-1/3 bg-[#1b3c35]/[0.06] dark:bg-white/[0.06] rounded" />
      </div>
    </div>
  ) : (
    <div className="animate-pulse">
      <div className="bg-[#1b3c35]/[0.06] dark:bg-white/[0.06] aspect-square rounded-2xl mb-3" />
      <div className="h-4 bg-[#1b3c35]/[0.08] dark:bg-white/[0.08] rounded mb-2 w-4/5" />
      <div className="h-3 bg-[#1b3c35]/[0.06] dark:bg-white/[0.06] rounded w-2/5" />
    </div>
  );
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
          new Set(productsData.map((p) => p.category)),
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
            (p) => p.category === selectedCategory,
          );
        }

        setProducts(sortedProducts);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory, sortBy]);

  return (
    <div className="min-h-screen bg-[#FBF6EF] dark:bg-[#0f1e1a]">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#1b3c35] to-[#254f45]">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
          aria-hidden="true"
        />
        <div className="relative container mx-auto px-4 sm:px-6 py-12 md:py-16">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm font-medium mb-8 transition-colors"
          >
            <FiArrowLeft /> Back to Home
          </Link>

          <div className="text-center max-w-2xl mx-auto">
            <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] uppercase text-[#E39A89] mb-4">
              <span className="h-px w-6 bg-[#E39A89]" />
              Fresh in store
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
              New Arrivals
            </h1>
            <p className="text-white/70">
              Discover the latest beauty products fresh in our store. Be the
              first to try new trends and innovations.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-8">
        {/* Toolbar */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-5 mb-10 pb-6 border-b border-[#1b3c35]/10 dark:border-white/10">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-2 text-[#1b3c35] dark:text-white shrink-0">
              <FiFilter className="w-4 h-4" />
              <span className="font-medium text-sm">Filter by:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                  selectedCategory === "all"
                    ? "bg-[#1b3c35] text-white"
                    : "bg-[#1b3c35]/[0.06] dark:bg-white/10 text-[#1b3c35] dark:text-white/80 hover:bg-[#1b3c35]/[0.12] dark:hover:bg-white/20"
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
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                      selectedCategory === category
                        ? "bg-[#1b3c35] text-white"
                        : "bg-[#1b3c35]/[0.06] dark:bg-white/10 text-[#1b3c35] dark:text-white/80 hover:bg-[#1b3c35]/[0.12] dark:hover:bg-white/20"
                    }`}
                  >
                    {category}
                  </button>
                ))}
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2">
              <label
                htmlFor="sort"
                className="font-medium text-sm text-[#1b3c35] dark:text-white sr-only sm:not-sr-only"
              >
                Sort by
              </label>
              <select
                id="sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 rounded-lg border border-[#1b3c35]/15 dark:border-white/15 bg-white dark:bg-[#16302a] text-[#1b3c35] dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#E39A89] cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>

            <div className="flex items-center gap-1 bg-[#1b3c35]/[0.06] dark:bg-white/10 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                aria-label="Grid view"
                aria-pressed={viewMode === "grid"}
                className={`p-2 rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E39A89] cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-white dark:bg-[#1b3c35] text-[#1b3c35] dark:text-white shadow-sm"
                    : "text-[#1b3c35]/50 dark:text-white/50 hover:text-[#1b3c35] dark:hover:text-white"
                }`}
              >
                <FiGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                aria-label="List view"
                aria-pressed={viewMode === "list"}
                className={`p-2 rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E39A89] cursor-pointer ${
                  viewMode === "list"
                    ? "bg-white dark:bg-[#1b3c35] text-[#1b3c35] dark:text-white shadow-sm"
                    : "text-[#1b3c35]/50 dark:text-white/50 hover:text-[#1b3c35] dark:hover:text-white"
                }`}
              >
                <FiList className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
                : "space-y-4 sm:space-y-6"
            }
          >
            {[...Array(viewMode === "grid" ? 8 : 4)].map((_, i) => (
              <CardSkeleton key={i} list={viewMode === "list"} />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
                : "space-y-4 sm:space-y-6"
            }
          >
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/product/${product.id}`}
                className={`group bg-white dark:bg-[#16302a] rounded-2xl overflow-hidden ring-1 ring-black/5 dark:ring-white/5 hover:ring-[#E39A89]/40 hover:shadow-xl transition-all duration-300 ${
                  viewMode === "list"
                    ? "flex flex-col sm:flex-row gap-4 sm:gap-6 p-4 sm:p-6"
                    : "p-3 sm:p-4"
                }`}
              >
                <div
                  className={`relative overflow-hidden rounded-xl bg-[#1b3c35]/5 ${
                    viewMode === "list"
                      ? "w-full sm:w-48 h-48 shrink-0"
                      : "aspect-square"
                  }`}
                >
                  <Image
                    src={product.imageUrl || "/api/placeholder/400/400"}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes={
                      viewMode === "list"
                        ? "192px"
                        : "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    }
                  />
                  <div className="absolute top-2.5 left-2.5 bg-[#1b3c35] text-white px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider">
                    NEW
                  </div>
                  {product.originalPrice > product.discountedPrice && (
                    <div className="absolute top-2.5 right-2.5 bg-[#c9614d] text-white px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider">
                      SALE
                    </div>
                  )}
                </div>

                <div
                  className={`flex-1 min-w-0 ${
                    viewMode === "list" ? "py-1" : "mt-4"
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-[#c9614d] dark:text-[#E39A89] bg-[#E39A89]/10 dark:bg-[#E39A89]/15 px-2 py-1 rounded-md">
                      <FiTag className="w-3 h-3" /> {product.category}
                    </span>
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-md ${
                        product.status === "In Stock"
                          ? "bg-[#8FA593]/15 text-[#4d6b56] dark:text-[#a9c2ae]"
                          : "bg-red-500/10 text-red-600 dark:text-red-400"
                      }`}
                    >
                      {product.status}
                    </span>
                  </div>

                  <h3 className="font-semibold text-[#1b3c35] dark:text-white mb-2 line-clamp-2">
                    {product.name}
                  </h3>

                  {viewMode === "list" && (
                    <p className="text-[#26261F]/60 dark:text-white/60 text-sm mb-4 line-clamp-2">
                      {product.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-xl font-bold text-[#1b3c35] dark:text-white">
                          ₵{product.discountedPrice.toFixed(2)}
                        </span>
                        {product.originalPrice > product.discountedPrice && (
                          <>
                            <span className="text-sm line-through text-[#26261F]/35 dark:text-white/35">
                              ₵{product.originalPrice.toFixed(2)}
                            </span>
                            <span className="text-sm text-[#c9614d] dark:text-[#E39A89] font-medium">
                              Save{" "}
                              {Math.round(
                                ((product.originalPrice -
                                  product.discountedPrice) /
                                  product.originalPrice) *
                                  100,
                              )}
                              %
                            </span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <FiStar className="w-4 h-4 text-[#E39A89] fill-[#E39A89]" />
                        <span className="text-sm text-[#26261F]/60 dark:text-white/60">
                          {product.rating?.toFixed(1) || "4.5"}
                        </span>
                      </div>
                    </div>

                    {viewMode === "list" && (
                      <span className="shrink-0 px-5 py-2 bg-[#1b3c35] text-white text-sm font-medium rounded-lg group-hover:bg-[#254f45] transition-colors">
                        View Product
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="bg-white dark:bg-[#16302a] rounded-2xl ring-1 ring-black/5 dark:ring-white/5 p-12 max-w-md mx-auto">
              <div className="w-16 h-16 bg-[#1b3c35]/[0.06] dark:bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiTag className="w-7 h-7 text-[#1b3c35]/40 dark:text-white/40" />
              </div>
              <h3 className="text-xl font-bold text-[#1b3c35] dark:text-white mb-2">
                No New Arrivals Found
              </h3>
              <p className="text-[#26261F]/60 dark:text-white/60 mb-6">
                {selectedCategory !== "all"
                  ? `No new products found in ${selectedCategory}. Try another category.`
                  : "Check back soon for new products!"}
              </p>
              {selectedCategory !== "all" && (
                <button
                  onClick={() => setSelectedCategory("all")}
                  className="px-6 py-2.5 bg-[#1b3c35] text-white text-sm font-medium rounded-lg hover:bg-[#254f45] transition-colors"
                >
                  View All Products
                </button>
              )}
            </div>
          </div>
        )}

        {/* Results Count */}
        <div className="mt-10 pt-6 border-t border-[#1b3c35]/10 dark:border-white/10">
          <p className="text-[#26261F]/60 dark:text-white/60 text-sm">
            Showing {products.length} new arrival
            {products.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>
    </div>
  );
}
