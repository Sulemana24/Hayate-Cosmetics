"use client";

import { useState, useEffect } from "react";
import ProductCard from "@/components/ProductCard";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  query,
  orderBy,
  where,
  Timestamp,
} from "firebase/firestore";
import { Product } from "@/types/product";
import { FiFilter, FiX, FiGrid, FiList, FiChevronDown } from "react-icons/fi";
import Image from "next/image";
import skincareImg from "@/public/images/catcos.jpg";
import fragranceImg from "@/public/images/catp.jpg";
import accessoriesImg from "@/public/images/catb.jpg";
import makeupImg from "@/public/images/mak.jpg";
import Link from "next/link";

export default function AllProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [sortBy, setSortBy] = useState("featured");
  const [viewMode, setViewMode] = useState("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Categories with images
  const categories = [
    {
      id: 1,
      name: "Skincare",
      slug: "skincare",
      image: skincareImg,
      color: "from-[#e39a89] to-[#d87a6a]",
      link: "/category/skincare",
    },
    {
      id: 2,
      name: "Fragrance",
      slug: "fragrance",
      image: fragranceImg,
      color: "from-[#1b3c35] to-[#2a4d45]",
      link: "/category/fragrance",
    },
    {
      id: 3,
      name: "Accessories",
      slug: "accessories",
      image: accessoriesImg,
      color: "from-[#f8b195] to-[#f67280]",
      link: "/category/accessories",
    },
    {
      id: 4,
      name: "Makeup",
      slug: "makeup",
      image: makeupImg,
      color: "from-[#6a5acd] to-[#836fff]",
      link: "/category/makeup",
    },
  ];

  // Sort options
  const sortOptions = [
    { value: "featured", label: "Featured" },
    { value: "newest", label: "Newest First" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" },
    { value: "name-asc", label: "Name: A to Z" },
    { value: "name-desc", label: "Name: Z to A" },
  ];

  // Fetch all products
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

        setProducts(productsData);
        setFilteredProducts(productsData);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter and sort products
  useEffect(() => {
    let result = [...products];

    // Filter by category
    if (activeCategory !== "all") {
      result = result.filter(
        (product) =>
          product.category.toLowerCase() === activeCategory.toLowerCase()
      );
    }

    // Filter by price range
    result = result.filter(
      (product) =>
        product.discountedPrice >= priceRange.min &&
        product.discountedPrice <= priceRange.max
    );

    // Filter by search term
    if (searchTerm) {
      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          product.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort products
    switch (sortBy) {
      case "newest":
        result.sort((a, b) => {
          const getDate = (date: Timestamp | Date | undefined): Date => {
            if (!date) return new Date(0);
            if (date instanceof Date) return date;
            if ("toDate" in date) return date.toDate();
            return new Date(0);
          };

          const dateA = getDate(a.createdAt);
          const dateB = getDate(b.createdAt);
          return dateB.getTime() - dateA.getTime();
        });
        break;
      case "price-low":
        result.sort((a, b) => a.discountedPrice - b.discountedPrice);
        break;
      case "price-high":
        result.sort((a, b) => b.discountedPrice - a.discountedPrice);
        break;
      case "name-asc":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        break;
    }

    setFilteredProducts(result);
  }, [products, activeCategory, priceRange, sortBy, searchTerm]);

  // Get category count
  const getCategoryCount = (category: string) => {
    return products.filter(
      (p) => p.category.toLowerCase() === category.toLowerCase()
    ).length;
  };

  // Reset filters
  const resetFilters = () => {
    setActiveCategory("all");
    setPriceRange({ min: 0, max: 1000 });
    setSearchTerm("");
    setSortBy("featured");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#faf7f5] to-white">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#1b3c35] to-[#2a4d45]">
        <div className="absolute inset-0 bg-black/20"></div>

        <div className="container mx-auto px-4 md:px-6 py-16 md:py-24 relative z-10">
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              All Products
            </h1>

            <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl">
              Browse our complete collection of premium beauty products. Find
              everything you need for your beauty routine.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() =>
                  document
                    .getElementById("products")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="inline-flex items-center justify-center gap-2 bg-white text-gray-800 hover:bg-gray-50 px-8 py-3 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 shadow-lg"
              >
                Browse Products
              </button>

              <Link
                href="/category"
                className="inline-flex items-center justify-center gap-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-2 border-white/30 px-8 py-3 rounded-xl font-semibold text-lg transition-all duration-300"
              >
                Browse by Category
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <section className="py-8 bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4">
              <div className="text-2xl font-bold text-[#1b3c35] mb-1">
                {products.length}
              </div>
              <div className="text-sm text-gray-600">Total Products</div>
            </div>
            <div className="text-center p-4">
              <div className="text-2xl font-bold text-[#1b3c35] mb-1">
                {getCategoryCount("skincare")}
              </div>
              <div className="text-sm text-gray-600">Skincare Items</div>
            </div>
            <div className="text-center p-4">
              <div className="text-2xl font-bold text-[#1b3c35] mb-1">
                {getCategoryCount("fragrance")}
              </div>
              <div className="text-sm text-gray-600">Fragrances</div>
            </div>
            <div className="text-center p-4">
              <div className="text-2xl font-bold text-[#1b3c35] mb-1">
                {getCategoryCount("makeup") + getCategoryCount("accessories")}
              </div>
              <div className="text-sm text-gray-600">Makeup & Accessories</div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Quick Links */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Shop by Category
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={category.link}
                className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1"
              >
                <div className="relative h-40 md:h-48">
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div
                    className={`absolute inset-0 bg-gradient-to-t ${category.color} opacity-70`}
                  ></div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                    <h3 className="text-xl font-bold text-white mb-2">
                      {category.name}
                    </h3>
                    <p className="text-white/90 text-sm">
                      {getCategoryCount(category.slug)} products
                    </p>
                  </div>
                </div>
                <div className="absolute top-4 right-4 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full">
                  <span className="text-white text-sm font-medium">
                    Shop Now
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="py-12">
        <div className="container mx-auto px-4 md:px-6">
          {/* Controls Bar */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 p-4 bg-white rounded-2xl shadow-sm">
            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-black"
            >
              <FiFilter className="w-5 h-5" />
              Filters
              {activeCategory !== "all" && (
                <span className="ml-2 px-2 py-1 bg-[#e39a89] text-white text-xs rounded-full">
                  1
                </span>
              )}
            </button>

            {/* Search */}
            <div className="w-full md:w-auto">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e39a89] text-black"
              />
            </div>

            {/* View Controls */}
            <div className="flex items-center gap-4">
              {/* Sort Dropdown */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none px-4 py-2 pr-8 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e39a89] bg-white text-black"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      Sort: {option.label}
                    </option>
                  ))}
                </select>
                <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-black" />
              </div>

              {/* View Toggle */}
              <div className="hidden md:flex items-center gap-1 border border-gray-300 rounded-lg p-1 text-black">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded ${
                    viewMode === "grid" ? "bg-gray-100" : "hover:bg-gray-50"
                  }`}
                >
                  <FiGrid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded ${
                    viewMode === "list" ? "bg-gray-100" : "hover:bg-gray-50"
                  }`}
                >
                  <FiList className="w-5 h-5" />
                </button>
              </div>

              {/* Reset Filters */}
              {(activeCategory !== "all" ||
                priceRange.min > 0 ||
                priceRange.max < 1000 ||
                searchTerm) && (
                <button
                  onClick={resetFilters}
                  className="text-sm text-red-500 hover:text-red-600 font-medium"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          <div className="flex gap-8">
            {/* Filters Sidebar (Desktop) */}
            <div
              className={`hidden md:block w-64 shrink-0 ${
                showFilters ? "block" : "hidden"
              } md:block`}
            >
              <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-gray-800">Filters</h3>
                  <button
                    onClick={resetFilters}
                    className="text-sm text-[#e39a89] hover:text-[#d87a6a]"
                  >
                    Reset All
                  </button>
                </div>

                {/* Categories Filter */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-700 mb-3">
                    Categories
                  </h4>
                  <div className="space-y-2">
                    <button
                      onClick={() => setActiveCategory("all")}
                      className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        activeCategory === "all"
                          ? "bg-[#e39a89] text-white"
                          : "hover:bg-gray-100 text-black"
                      }`}
                    >
                      <div className="flex justify-between items-center ">
                        <span>All Products</span>
                        <span className="text-sm opacity-75">
                          {products.length}
                        </span>
                      </div>
                    </button>
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setActiveCategory(category.slug)}
                        className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          activeCategory === category.slug
                            ? "bg-[#e39a89] text-white"
                            : "hover:bg-gray-100 text-black"
                        }`}
                      >
                        <div className="flex justify-between items-center ">
                          <span>{category.name}</span>
                          <span className="text-sm opacity-75">
                            {getCategoryCount(category.slug)}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Filter */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-700 mb-3">
                    Price Range
                  </h4>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        ₵{priceRange.min}
                      </span>
                      <span className="text-sm text-gray-600">
                        ₵{priceRange.max}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1000"
                      step="10"
                      value={priceRange.min}
                      onChange={(e) =>
                        setPriceRange({
                          ...priceRange,
                          min: parseInt(e.target.value),
                        })
                      }
                      className="w-full"
                    />
                    <input
                      type="range"
                      min="0"
                      max="1000"
                      step="10"
                      value={priceRange.max}
                      onChange={(e) =>
                        setPriceRange({
                          ...priceRange,
                          max: parseInt(e.target.value),
                        })
                      }
                      className="w-full"
                    />
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={priceRange.min}
                        onChange={(e) =>
                          setPriceRange({
                            ...priceRange,
                            min: parseInt(e.target.value) || 0,
                          })
                        }
                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm text-black"
                        placeholder="Min"
                      />
                      <span className="self-center">-</span>
                      <input
                        type="number"
                        value={priceRange.max}
                        onChange={(e) =>
                          setPriceRange({
                            ...priceRange,
                            max: parseInt(e.target.value) || 1000,
                          })
                        }
                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm text-black"
                        placeholder="Max"
                      />
                    </div>
                  </div>
                </div>

                {/* Current Filters */}
                {(activeCategory !== "all" ||
                  priceRange.min > 0 ||
                  priceRange.max < 1000) && (
                  <div className="pt-4 border-t border-gray-200">
                    <h4 className="font-semibold text-gray-700 mb-2">
                      Active Filters
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {activeCategory !== "all" && (
                        <span className="px-3 py-1 bg-[#e39a89]/10 text-[#d87a6a] rounded-full text-sm">
                          {
                            categories.find((c) => c.slug === activeCategory)
                              ?.name
                          }
                          <button
                            onClick={() => setActiveCategory("all")}
                            className="ml-2 text-xs"
                          >
                            ×
                          </button>
                        </span>
                      )}
                      {(priceRange.min > 0 || priceRange.max < 1000) && (
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                          ₵{priceRange.min} - ₵{priceRange.max}
                          <button
                            onClick={() => setPriceRange({ min: 0, max: 1000 })}
                            className="ml-2 text-xs"
                          >
                            ×
                          </button>
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Products Grid */}
            <div className="flex-1">
              {/* Mobile Filters Overlay */}
              {showFilters && (
                <div
                  className="md:hidden fixed inset-0 bg-black/50 z-50"
                  onClick={() => setShowFilters(false)}
                >
                  <div
                    className="absolute right-0 top-0 h-full w-80 bg-white shadow-lg overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-800">
                          Filters
                        </h3>
                        <button onClick={() => setShowFilters(false)}>
                          <FiX className="w-6 h-6" />
                        </button>
                      </div>
                      {/* Same filter content as desktop */}
                      <div className="mb-6">
                        <h4 className="font-semibold text-gray-700 mb-3">
                          Categories
                        </h4>
                        <div className="space-y-2">
                          <button
                            onClick={() => {
                              setActiveCategory("all");
                              setShowFilters(false);
                            }}
                            className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
                              activeCategory === "all"
                                ? "bg-[#e39a89] text-white"
                                : "hover:bg-gray-100 text-black"
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <span>All Products</span>
                              <span className="text-sm opacity-75">
                                {products.length}
                              </span>
                            </div>
                          </button>
                          {categories.map((category) => (
                            <button
                              key={category.id}
                              onClick={() => {
                                setActiveCategory(category.slug);
                                setShowFilters(false);
                              }}
                              className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
                                activeCategory === category.slug
                                  ? "bg-[#e39a89] text-white"
                                  : "hover:bg-gray-100 text-black"
                              }`}
                            >
                              <div className="flex justify-between items-center">
                                <span>{category.name}</span>
                                <span className="text-sm opacity-75">
                                  {getCategoryCount(category.slug)}
                                </span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Results Summary */}
              <div className="mb-6 flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    {activeCategory === "all"
                      ? "All Products"
                      : categories.find((c) => c.slug === activeCategory)
                          ?.name + " Products"}
                  </h2>
                  <p className="text-gray-600">
                    Showing {filteredProducts.length} of {products.length}{" "}
                    products
                  </p>
                </div>
                {searchTerm && (
                  <div className="text-sm text-gray-600">
                    Search results for:{" "}
                    <span className="font-semibold">`${searchTerm}`</span>
                  </div>
                )}
              </div>

              {/* Loading State */}
              {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-gray-200 h-64 rounded-xl mb-3"></div>
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  ))}
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
                  <div className="text-5xl mb-4">😕</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    No products found
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {searchTerm
                      ? `No products match "${searchTerm}"`
                      : "Try adjusting your filters or browse by category"}
                  </p>
                  <button
                    onClick={resetFilters}
                    className="px-6 py-3 bg-[#e39a89] text-white rounded-lg font-semibold hover:bg-[#d87a6a] transition-colors"
                  >
                    Reset All Filters
                  </button>
                </div>
              ) : viewMode === "grid" ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      showActions={true}
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <Link
                        href={`/product/${product.id}`}
                        className="flex gap-4"
                      >
                        <div className="w-24 h-24 flex-shrink-0">
                          <Image
                            src={product.imageUrl || "/images/placeholder.jpg"}
                            alt={product.name}
                            width={96}
                            height={96}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800 mb-1">
                            {product.name}
                          </h3>
                          <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                            {product.description}
                          </p>
                          <div className="flex justify-between items-center">
                            <div>
                              <span className="text-lg font-bold text-[#1b3c35]">
                                ₵{product.discountedPrice.toFixed(2)}
                              </span>
                              {product.originalPrice >
                                product.discountedPrice && (
                                <span className="ml-2 text-sm line-through text-gray-400">
                                  ₵{product.originalPrice.toFixed(2)}
                                </span>
                              )}
                            </div>
                            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                              {product.category}
                            </span>
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Why Shop With Us */}
      <section className="py-16 bg-gradient-to-r from-[#faf7f5] to-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Why Shop With Us
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We&apos;re committed to providing the best beauty shopping
              experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl shadow-lg text-center transform hover:-translate-y-2 transition-all duration-300">
              <div className="w-16 h-16 rounded-full bg-[#e39a89]/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🚚</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                Fast Delivery
              </h3>
              <p className="text-gray-600">
                Nationwide delivery across Ghana. Get your beauty products
                delivered to your doorstep.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg text-center transform hover:-translate-y-2 transition-all duration-300">
              <div className="w-16 h-16 rounded-full bg-[#1b3c35]/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🛡️</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                Authentic Products
              </h3>
              <p className="text-gray-600">
                100% genuine products with quality guarantee. We source directly
                from trusted brands.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg text-center transform hover:-translate-y-2 transition-all duration-300">
              <div className="w-16 h-16 rounded-full bg-[#f67280]/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💝</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                Customer Support
              </h3>
              <p className="text-gray-600">
                Our team is here to help. Contact us for product recommendations
                or any questions.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
