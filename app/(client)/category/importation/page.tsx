"use client";

import { useState, useEffect } from "react";
import BackToTop from "@/components/BackToTopButton";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from "firebase/firestore";
import Image from "next/image";
import Link from "next/link";
import {
  FiSearch,
  FiFilter,
  FiX,
  FiGrid,
  FiList,
  FiStar,
  FiClock,
  FiTrendingUp,
  FiMapPin,
} from "react-icons/fi";
import { IoMdClose } from "react-icons/io";

// Helper function to normalize timestamps
const getTimestamp = (value: unknown): number => {
  if (!value) return 0;
  if (typeof value === "object" && value !== null && "toMillis" in value) {
    return (value as Timestamp).toMillis();
  }
  if (typeof value === "number") return value;
  if (value instanceof Date) return value.getTime();
  if (typeof value === "string") {
    const parsed = Date.parse(value);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

interface Product {
  id: string;
  name: string;
  price: number;
  discountedPrice: number;
  imageUrl: string;
  category: string;
  subCategory: string;
  status: string;
  description: string;
  originalPrice: number;
  quantity: number;
  rating?: number;
  discountPercentage: number;
  origin?: string;
  importDate?: string;
  isImported?: boolean;
  createdAt?: Timestamp | number;
  updatedAt?: Timestamp | number;
  categorySlug?: string;
  subCategorySlug?: string;
  popularity?: number;
}

// Filter options - dynamically populated from products
const SORT_OPTIONS = [
  { label: "Newest First", value: "newest" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Rating: High to Low", value: "rating" },
  { label: "Most Popular", value: "popular" },
];

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] uppercase text-[#8FA593] dark:text-[#a9c2ae] mb-3">
      <span className="h-px w-6 bg-[#8FA593] dark:bg-[#a9c2ae]" />
      {children}
    </span>
  );
}

function CardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="bg-[#1b3c35]/[0.06] dark:bg-white/[0.06] aspect-square rounded-2xl mb-3" />
      <div className="h-4 bg-[#1b3c35]/[0.08] dark:bg-white/[0.08] rounded mb-2 w-4/5" />
      <div className="h-3 bg-[#1b3c35]/[0.06] dark:bg-white/[0.06] rounded w-2/5" />
    </div>
  );
}

export default function ImportedGoodsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] =
    useState("All Sub-Categories");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [maxPrice, setMaxPrice] = useState(1000);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [onSaleOnly, setOnSaleOnly] = useState(false);

  // Get unique sub-categories from imported products
  const getSubCategories = () => {
    const subCategories = new Set<string>();
    products.forEach((product) => {
      if (product.subCategory) {
        subCategories.add(product.subCategory);
      }
    });
    return ["All Sub-Categories", ...Array.from(subCategories)];
  };

  const subCategoryOptions = getSubCategories();

  // Fetch imported goods (products with category "Importation")
  useEffect(() => {
    const fetchImportedGoods = async () => {
      try {
        setLoading(true);
        const productsRef = collection(db, "products");

        // Query for products where category is "Importation"
        const q = query(
          productsRef,
          where("category", "==", "Importation"),
          orderBy("createdAt", "desc"),
          limit(50),
        );

        const snapshot = await getDocs(q);
        const productsList = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            // Calculate discount percentage if not present
            discountPercentage:
              data.discountPercentage ||
              (data.originalPrice > data.discountedPrice
                ? Math.round(
                    ((data.originalPrice - data.discountedPrice) /
                      data.originalPrice) *
                      100,
                  )
                : 0),
            // Set origin based on sub-category or default
            origin: "Pre-order",
          };
        }) as Product[];

        setProducts(productsList);
      } catch (error) {
        console.error("Error fetching pre-ordered goods:", error);

        // Fallback: Fetch all products and filter client-side
        try {
          const allProductsRef = collection(db, "products");
          const allSnapshot = await getDocs(allProductsRef);
          const allProducts = allSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            discountPercentage:
              doc.data().discountPercentage ||
              (doc.data().originalPrice > doc.data().discountedPrice
                ? Math.round(
                    ((doc.data().originalPrice - doc.data().discountedPrice) /
                      doc.data().originalPrice) *
                      100,
                  )
                : 0),
          })) as Product[];

          // Filter products with category "Importation"
          const imported = allProducts.filter(
            (p) => p.category === "Importation",
          );
          setProducts(imported);
        } catch (fallbackError) {
          console.error("Fallback error:", fallbackError);
          setProducts([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchImportedGoods();
  }, []);

  // Calculate max price for range
  useEffect(() => {
    if (products.length > 0) {
      const max = Math.max(
        ...products.map((p) => p.discountedPrice || p.price || 0),
      );
      setMaxPrice(Math.ceil(max));
      setPriceRange([0, Math.ceil(max)]);
    }
  }, [products]);

  // Filter and sort products
  useEffect(() => {
    let result = [...products];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.description?.toLowerCase().includes(query) ||
          product.category?.toLowerCase().includes(query) ||
          product.subCategory?.toLowerCase().includes(query) ||
          product.origin?.toLowerCase().includes(query),
      );
    }

    // Sub-Category filter
    if (selectedSubCategory !== "All Sub-Categories") {
      result = result.filter(
        (product) => product.subCategory === selectedSubCategory,
      );
    }

    // Price range filter
    result = result.filter((product) => {
      const price = product.discountedPrice || product.price || 0;
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // In stock filter
    if (inStockOnly) {
      result = result.filter((product) => product.status === "In Stock");
    }

    // On sale filter
    if (onSaleOnly) {
      result = result.filter(
        (product) =>
          product.discountPercentage > 0 ||
          (product.originalPrice &&
            product.originalPrice > (product.discountedPrice || product.price)),
      );
    }

    // Sorting
    switch (sortBy) {
      case "newest":
        result.sort((a, b) => {
          const dateA = getTimestamp(a.createdAt);
          const dateB = getTimestamp(b.createdAt);
          return dateB - dateA;
        });
        break;
      case "price_asc":
        result.sort(
          (a, b) =>
            (a.discountedPrice || a.price || 0) -
            (b.discountedPrice || b.price || 0),
        );
        break;
      case "price_desc":
        result.sort(
          (a, b) =>
            (b.discountedPrice || b.price || 0) -
            (a.discountedPrice || a.price || 0),
        );
        break;
      case "rating":
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "popular":
        result.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
        break;
      default:
        break;
    }

    setFilteredProducts(result);
  }, [
    products,
    searchQuery,
    selectedSubCategory,
    sortBy,
    priceRange,
    inStockOnly,
    onSaleOnly,
  ]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedSubCategory("All Sub-Categories");
    setPriceRange([0, maxPrice]);
    setInStockOnly(false);
    setOnSaleOnly(false);
    setSortBy("newest");
  };

  const hasActiveFilters = () => {
    return (
      searchQuery !== "" ||
      selectedSubCategory !== "All Sub-Categories" ||
      inStockOnly ||
      onSaleOnly ||
      priceRange[0] > 0 ||
      priceRange[1] < maxPrice
    );
  };

  return (
    <div className="min-h-screen bg-[#FBF6EF] dark:bg-[#0f1e1a]">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#1b3c35] to-[#2a5a4f] dark:from-[#0f1e1a] dark:to-[#1b3c35] py-12 md:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-3xl">
            <SectionEyebrow>Global Beauty</SectionEyebrow>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-4">
              Pre-Ordered Goods
            </h1>
            <p className="text-lg md:text-xl text-white/70 max-w-2xl">
              Discover premium products sourced from around the world. From
              household essentials to luxury items.
            </p>
            <div className="flex flex-wrap gap-3 mt-6">
              <div className="flex items-center gap-2 text-white/60 text-sm">
                <FiMapPin className="w-4 h-4" />
                <span>Global Sourcing</span>
              </div>
              <div className="flex items-center gap-2 text-white/60 text-sm">
                <FiTrendingUp className="w-4 h-4" />
                <span>Premium Quality</span>
              </div>
              <div className="flex items-center gap-2 text-white/60 text-sm">
                <FiClock className="w-4 h-4" />
                <span>Authentic Products</span>
              </div>
            </div>
          </div>
        </div>
        {/* Decorative element */}
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#FBF6EF] dark:from-[#0f1e1a] to-transparent" />
      </section>

      {/* Search and Filters */}
      <section className="py-6 sticky top-0 bg-[#FBF6EF] dark:bg-[#0f1e1a] z-30 border-b border-[#1b3c35]/10 dark:border-white/10">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1b3c35]/40 dark:text-white/40 w-5 h-5" />
              <input
                type="text"
                placeholder="Search pre-ordered goods by name, category, or origin..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white dark:bg-[#16302a] rounded-xl ring-1 ring-[#1b3c35]/15 dark:ring-white/15 focus:ring-[#E39A89] focus:outline-none transition-all text-[#1b3c35] dark:text-white placeholder-[#1b3c35]/40 dark:placeholder-white/40"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1b3c35]/40 dark:text-white/40 hover:text-[#E39A89] transition-colors"
                >
                  <FiX className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* View Toggle & Filter Button */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex bg-white dark:bg-[#16302a] rounded-xl ring-1 ring-[#1b3c35]/15 dark:ring-white/15 p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === "grid"
                      ? "bg-[#E39A89] text-white"
                      : "text-[#1b3c35]/60 dark:text-white/60 hover:text-[#1b3c35] dark:hover:text-white"
                  }`}
                  aria-label="Grid view"
                >
                  <FiGrid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === "list"
                      ? "bg-[#E39A89] text-white"
                      : "text-[#1b3c35]/60 dark:text-white/60 hover:text-[#1b3c35] dark:hover:text-white"
                  }`}
                  aria-label="List view"
                >
                  <FiList className="w-5 h-5" />
                </button>
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-[#16302a] rounded-xl ring-1 ring-[#1b3c35]/15 dark:ring-white/15 hover:ring-[#E39A89] transition-all text-[#1b3c35] dark:text-white"
              >
                <FiFilter className="w-5 h-5" />
                <span className="hidden sm:inline">Filters</span>
                {hasActiveFilters() && (
                  <span className="w-2 h-2 rounded-full bg-[#E39A89]"></span>
                )}
              </button>
            </div>
          </div>

          {/* Active Filters */}
          {hasActiveFilters() && (
            <div className="flex flex-wrap gap-2 mt-4">
              {selectedSubCategory !== "All Sub-Categories" && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#E39A89]/15 text-[#E39A89] rounded-full text-sm">
                  {selectedSubCategory}
                  <button
                    onClick={() => setSelectedSubCategory("All Sub-Categories")}
                    className="hover:text-[#d48776]"
                  >
                    <IoMdClose className="w-4 h-4" />
                  </button>
                </span>
              )}

              {(priceRange[0] > 0 || priceRange[1] < maxPrice) && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#1b3c35]/10 dark:bg-white/10 rounded-full text-sm">
                  ₵{priceRange[0]} - ₵{priceRange[1]}
                  <button
                    onClick={() => setPriceRange([0, maxPrice])}
                    className="hover:text-[#E39A89]"
                  >
                    <IoMdClose className="w-4 h-4" />
                  </button>
                </span>
              )}
              <button
                onClick={clearFilters}
                className="text-sm text-[#E39A89] hover:text-[#d48776] font-medium"
              >
                Clear All
              </button>
            </div>
          )}

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-4 p-4 sm:p-6 bg-white dark:bg-[#16302a] rounded-2xl ring-1 ring-[#1b3c35]/10 dark:ring-white/10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Sub-Category Filter */}
              <div>
                <label className="block text-sm font-medium text-[#1b3c35] dark:text-white mb-2">
                  Sub-Category
                </label>
                <select
                  value={selectedSubCategory}
                  onChange={(e) => setSelectedSubCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FBF6EF] dark:bg-[#0f1e1a] rounded-lg ring-1 ring-[#1b3c35]/15 dark:ring-white/15 focus:ring-[#E39A89] focus:outline-none text-[#1b3c35] dark:text-white"
                >
                  {subCategoryOptions.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-[#1b3c35] dark:text-white mb-2">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FBF6EF] dark:bg-[#0f1e1a] rounded-lg ring-1 ring-[#1b3c35]/15 dark:ring-white/15 focus:ring-[#E39A89] focus:outline-none text-[#1b3c35] dark:text-white"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-[#1b3c35] dark:text-white mb-2">
                  Price Range: ₵{priceRange[0]} - ₵{priceRange[1]}
                </label>
                <div className="space-y-2">
                  <input
                    type="range"
                    min={0}
                    max={maxPrice}
                    value={priceRange[1]}
                    onChange={(e) =>
                      setPriceRange([priceRange[0], parseInt(e.target.value)])
                    }
                    className="w-full accent-[#E39A89]"
                  />
                  <div className="flex justify-between text-xs text-[#1b3c35]/60 dark:text-white/60">
                    <span>₵0</span>
                    <span>₵{maxPrice}</span>
                  </div>
                </div>
              </div>

              {/* Toggle Filters */}
              <div className="md:col-span-2 lg:col-span-4 flex flex-wrap gap-4 pt-2 border-t border-[#1b3c35]/10 dark:border-white/10">
                <label className="flex items-center gap-2 text-sm text-[#1b3c35] dark:text-white">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="w-4 h-4 rounded border-[#1b3c35]/30 dark:border-white/30 text-[#E39A89] focus:ring-[#E39A89]"
                  />
                  In Stock Only
                </label>
                <label className="flex items-center gap-2 text-sm text-[#1b3c35] dark:text-white">
                  <input
                    type="checkbox"
                    checked={onSaleOnly}
                    onChange={(e) => setOnSaleOnly(e.target.checked)}
                    className="w-4 h-4 rounded border-[#1b3c35]/30 dark:border-white/30 text-[#E39A89] focus:ring-[#E39A89]"
                  />
                  On Sale Only
                </label>
                <button
                  onClick={clearFilters}
                  className="ml-auto text-sm text-[#E39A89] hover:text-[#d48776] font-medium"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Results Count */}
      <section className="py-4">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center">
            <p className="text-sm text-[#1b3c35]/60 dark:text-white/60">
              {loading
                ? "Loading..."
                : `Showing ${filteredProducts.length} pre-ordered products`}
            </p>
            {!loading && filteredProducts.length === 0 && (
              <p className="text-sm text-[#E39A89]">
                No pre-ordered products found matching your criteria
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Product Grid */}
      <section className="py-8 pb-20">
        <div className="container mx-auto px-4 sm:px-6">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {[...Array(8)].map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
                  : "space-y-4"
              }
            >
              {filteredProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/product/${product.id}`}
                  className={`group bg-white dark:bg-[#16302a] rounded-2xl p-3 sm:p-4 ring-1 ring-black/5 dark:ring-white/5 hover:ring-[#E39A89]/40 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${
                    viewMode === "list" ? "flex gap-4 items-center" : ""
                  }`}
                >
                  <div
                    className={`relative overflow-hidden rounded-xl bg-[#1b3c35]/5 ${
                      viewMode === "list"
                        ? "w-32 h-32 sm:w-40 sm:h-40 flex-shrink-0"
                        : "aspect-square mb-4"
                    }`}
                  >
                    <Image
                      src={product.imageUrl || "/api/placeholder/400/400"}
                      alt={product.name}
                      width={400}
                      height={400}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* Pre-Order Badge */}
                    <div className="absolute top-2.5 left-2.5 bg-[#1b3c35] text-white px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider flex items-center gap-1">
                      <FiMapPin className="w-3 h-3" />
                      Pre-Order
                    </div>
                    {product.discountPercentage > 0 && (
                      <div className="absolute top-2.5 right-2.5 bg-[#E39A89] text-white px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider">
                        -{product.discountPercentage}%
                      </div>
                    )}
                    {product.rating && (
                      <div className="absolute bottom-2.5 left-2.5 bg-black/60 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-xs flex items-center gap-1">
                        <FiStar className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        {product.rating.toFixed(1)}
                      </div>
                    )}
                  </div>

                  <div
                    className={`flex-1 ${viewMode === "list" ? "min-w-0" : ""}`}
                  >
                    <h3
                      className={`font-semibold text-[#1b3c35] dark:text-white mb-1 truncate ${
                        viewMode === "list" ? "text-base" : "text-sm"
                      }`}
                    >
                      {product.name}
                    </h3>
                    {viewMode === "list" && product.description && (
                      <p className="text-sm text-[#1b3c35]/60 dark:text-white/60 line-clamp-2 mb-2">
                        {product.description}
                      </p>
                    )}
                    {viewMode === "list" && product.subCategory && (
                      <p className="text-xs text-[#1b3c35]/40 dark:text-white/40 mb-2">
                        {product.subCategory}
                      </p>
                    )}
                    <div
                      className={`flex items-center gap-2 ${
                        viewMode === "list" ? "flex-wrap" : ""
                      }`}
                    >
                      <span className="text-lg font-bold text-[#1b3c35] dark:text-white">
                        ₵
                        {(
                          product.discountedPrice ||
                          product.price ||
                          0
                        ).toFixed(2)}
                      </span>
                      {product.originalPrice &&
                        product.originalPrice >
                          (product.discountedPrice || product.price) && (
                          <span className="text-sm line-through text-[#26261F]/35 dark:text-white/35">
                            ₵{product.originalPrice.toFixed(2)}
                          </span>
                        )}
                      {viewMode === "list" && (
                        <span className="ml-auto text-sm text-[#E39A89] font-medium">
                          View Details →
                        </span>
                      )}
                    </div>
                    {viewMode === "grid" && product.status === "In Stock" && (
                      <div className="mt-2 text-xs text-green-600 dark:text-green-400 font-medium">
                        In Stock
                      </div>
                    )}
                    {viewMode === "grid" && product.status === "Low Stock" && (
                      <div className="mt-2 text-xs text-yellow-600 dark:text-yellow-400 font-medium">
                        Low Stock
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🌍</div>
              <h3 className="text-2xl font-semibold text-[#1b3c35] dark:text-white mb-2">
                No pre-ordered products found
              </h3>
              <p className="text-[#1b3c35]/60 dark:text-white/60">
                We&apos;re currently sourcing new products. Check back soon!
              </p>
              <button
                onClick={clearFilters}
                className="mt-4 px-6 py-2 bg-[#E39A89] text-white rounded-xl hover:bg-[#d48776] transition-colors"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </section>

      <BackToTop />
    </div>
  );
}
