"use client";

import { useState, useMemo, useEffect } from "react";
import ProductCard from "@/components/ProductCard";
import { Product } from "@/types/product";
import { FiSearch, FiX, FiChevronDown } from "react-icons/fi";

interface SkincareProductsClientProps {
  initialProducts: Product[];
  subcategories: { id: number; name: string; count: string; slug: string }[];
}

export default function SkincareProductsClient({
  initialProducts,
  subcategories,
}: SkincareProductsClientProps) {
  const [products] = useState(initialProducts);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Derive filtered products and active filters during render
  const { filteredProducts, activeFilters } = useMemo(() => {
    let result = [...products];

    // Subcategory filter
    if (selectedSubcategory !== "all") {
      result = result.filter(
        (product) =>
          product.subCategory?.toLowerCase().replace(/\s+/g, "-") ===
          selectedSubcategory,
      );
    }

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(term) ||
          product.description?.toLowerCase().includes(term) ||
          product.subCategory?.toLowerCase().includes(term),
      );
    }

    // Price filter
    const min = parseFloat(minPrice) || 0;
    const max = parseFloat(maxPrice) || Infinity;
    result = result.filter((product) => {
      const price = product.discountedPrice || product.originalPrice || 0;
      return price >= min && price <= max;
    });

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((product) => product.status === statusFilter);
    }

    // Sorting
    switch (sortBy) {
      case "newest":
        result.sort((a, b) => {
          const getTime = (value: unknown): number => {
            if (!value) return 0;

            // JavaScript Date
            if (value instanceof Date) {
              return value.getTime();
            }

            // Firestore Timestamp
            if (
              typeof value === "object" &&
              value !== null &&
              "toMillis" in value &&
              typeof (value as { toMillis?: unknown }).toMillis === "function"
            ) {
              return (value as { toMillis: () => number }).toMillis();
            }

            // Firestore Timestamp converted to a plain object
            if (
              typeof value === "object" &&
              value !== null &&
              "seconds" in value
            ) {
              const seconds = (value as { seconds?: number }).seconds;
              return typeof seconds === "number" ? seconds * 1000 : 0;
            }

            // String date
            if (typeof value === "string") {
              const time = new Date(value).getTime();
              return Number.isNaN(time) ? 0 : time;
            }

            return 0;
          };

          return getTime(b.createdAt) - getTime(a.createdAt);
        });
        break;
      case "price-low":
        result.sort(
          (a, b) =>
            (a.discountedPrice || a.originalPrice || 0) -
            (b.discountedPrice || b.originalPrice || 0),
        );
        break;
      case "price-high":
        result.sort(
          (a, b) =>
            (b.discountedPrice || b.originalPrice || 0) -
            (a.discountedPrice || a.originalPrice || 0),
        );
        break;
      case "rating":
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "name":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }

    // Build active filters
    const filters: string[] = [];
    if (selectedSubcategory !== "all") {
      const sub = subcategories.find((s) => s.slug === selectedSubcategory);
      filters.push(`Category: ${sub?.name || selectedSubcategory}`);
    }
    if (searchTerm.trim()) filters.push(`Search: ${searchTerm}`);
    if (minPrice || maxPrice) {
      filters.push(`Price: ₵${minPrice || "0"} - ₵${maxPrice || "∞"}`);
    }
    if (statusFilter !== "all") filters.push(`Status: ${statusFilter}`);

    return {
      filteredProducts: result,
      activeFilters: filters,
    };
  }, [
    products,
    searchTerm,
    selectedSubcategory,
    sortBy,
    minPrice,
    maxPrice,
    statusFilter,
    subcategories,
  ]);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedSubcategory("all");
    setSortBy("newest");
    setMinPrice("");
    setMaxPrice("");
    setStatusFilter("all");
  };

  const removeFilter = (filter: string) => {
    if (filter.startsWith("Category:")) {
      setSelectedSubcategory("all");
    } else if (filter.startsWith("Search:")) {
      setSearchTerm("");
    } else if (filter.startsWith("Price:")) {
      setMinPrice("");
      setMaxPrice("");
    } else if (filter.startsWith("Status:")) {
      setStatusFilter("all");
    }
  };

  return (
    <div>
      {/* Subcategories */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Shop by Type
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {subcategories.map((subcat) => {
              const isActive = selectedSubcategory === subcat.slug;
              return (
                <button
                  key={subcat.id}
                  onClick={() => setSelectedSubcategory(subcat.slug)}
                  className={`group p-4 rounded-xl transition-all duration-300 transform hover:-translate-y-1 ${
                    isActive
                      ? "bg-gradient-to-r from-[#e39a89] to-[#d87a6a] text-white shadow-lg"
                      : "bg-gray-50 hover:bg-gradient-to-r hover:from-[#e39a89] hover:to-[#d87a6a]"
                  }`}
                >
                  <h3
                    className={`font-semibold mb-1 ${
                      isActive
                        ? "text-white"
                        : "text-gray-800 group-hover:text-white"
                    }`}
                  >
                    {subcat.name}
                  </h3>
                  <p
                    className={`text-sm ${
                      isActive
                        ? "text-white/80"
                        : "text-gray-500 group-hover:text-white/80"
                    }`}
                  >
                    {subcat.count}
                  </p>
                  {isActive && (
                    <div className="mt-2 w-6 h-0.5 bg-white/60 mx-auto rounded-full"></div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-16 bg-gradient-to-b from-[#1b3c35] to-[#2a4d45]">
        <div className="container mx-auto px-4 md:px-6">
          {/* Search and Filter Bar */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              {/* Search */}
              <div className="flex-1 w-full lg:w-auto">
                <div className="relative">
                  <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search skincare products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full lg:w-80 px-4 py-3 pl-12 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#e39a89] text-white placeholder-white/50"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
                    >
                      <FiX className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-3 w-full lg:w-auto">
                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#e39a89] cursor-pointer"
                >
                  <option value="newest" className="text-gray-900">
                    Sort: Newest
                  </option>
                  <option value="price-low" className="text-gray-900">
                    Price: Low to High
                  </option>
                  <option value="price-high" className="text-gray-900">
                    Price: High to Low
                  </option>
                  <option value="rating" className="text-gray-900">
                    Rating: High to Low
                  </option>
                  <option value="name" className="text-gray-900">
                    Name: A to Z
                  </option>
                </select>

                {/* Price Range */}
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-20 px-3 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#e39a89]"
                  />
                  <span className="text-white/50">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-20 px-3 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#e39a89]"
                  />
                </div>

                {/* Status */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#e39a89] cursor-pointer"
                >
                  <option value="all" className="text-gray-900">
                    All Status
                  </option>
                  <option value="In Stock" className="text-gray-900">
                    In Stock
                  </option>
                  <option value="Low Stock" className="text-gray-900">
                    Low Stock
                  </option>
                  <option value="Out of Stock" className="text-gray-900">
                    Out of Stock
                  </option>
                </select>

                {/* Clear Filters */}
                <button
                  onClick={clearFilters}
                  className="px-4 py-3 bg-[#e39a89] hover:bg-[#d87a6a] text-white rounded-xl transition-colors font-medium"
                >
                  Clear Filters
                </button>
              </div>
            </div>

            {/* Active Filters */}
            {activeFilters.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {activeFilters.map((filter, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-[#e39a89]/20 text-[#e39a89] rounded-full text-sm"
                  >
                    {filter}
                    <button
                      onClick={() => removeFilter(filter)}
                      className="hover:text-[#d87a6a]"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Products Grid */}
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-white">
              All Skincare Products
            </h2>
            <span className="text-gray-300">
              {filteredProducts.length} Products
            </span>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-300 text-lg">
                No skincare products match your filters.
              </p>
              <button
                onClick={clearFilters}
                className="mt-4 inline-block text-[#e39a89] hover:text-[#d87a6a] font-semibold"
              >
                Clear all filters →
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  showActions={true}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
