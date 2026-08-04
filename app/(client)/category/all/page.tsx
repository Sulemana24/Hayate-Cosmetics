"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/ToastProvider";
import ProductCard from "@/components/ProductCard";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  query,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { Product } from "@/types/product";
import {
  FiFilter,
  FiX,
  FiGrid,
  FiList,
  FiChevronDown,
  FiTruck,
  FiShield,
  FiHeart,
  FiSearch,
  FiPackage,
  FiSmile,
  FiShoppingBag,
} from "react-icons/fi";
import Image from "next/image";
import skincareImg from "@/public/images/catcos.jpg";
import fragranceImg from "@/public/images/catp.jpg";
import accessoriesImg from "@/public/images/catb.jpg";
import makeupImg from "@/public/images/Import.jpg";
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
  const { showToast } = useToast();

  const categories = [
    {
      id: 1,
      name: "Skincare",
      slug: "skincare",
      image: skincareImg,
      color: "from-[#E39A89] to-[#c9614d]",
      chip: "bg-[#E39A89]/15 text-[#c9614d]",
      link: "/category/skincare",
    },
    {
      id: 2,
      name: "Fragrance",
      slug: "fragrance",
      image: fragranceImg,
      color: "from-[#1b3c35] to-[#2a4d45]",
      chip: "bg-[#1b3c35]/10 text-[#1b3c35]",
      link: "/category/fragrance",
    },
    {
      id: 3,
      name: "Accessories",
      slug: "accessories",
      image: accessoriesImg,
      color: "from-[#8FA593] to-[#4d6b56]",
      chip: "bg-[#8FA593]/20 text-[#4d6b56]",
      link: "/category/accessories",
    },
    {
      id: 4,
      name: "Importation",
      slug: "importation",
      image: makeupImg,
      color: "from-[#C9A15A] to-[#a87f3f]",
      chip: "bg-[#C9A15A]/15 text-[#8a6a34]",
      link: "/category/importation",
    },
  ];

  const sortOptions = [
    { value: "featured", label: "Featured" },
    { value: "newest", label: "Newest First" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" },
    { value: "name-asc", label: "Name: A to Z" },
    { value: "name-desc", label: "Name: Z to A" },
  ];

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
        showToast({
          type: "error",
          message: "Failed to fetch products.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    let result = [...products];

    if (activeCategory !== "all") {
      result = result.filter(
        (product) =>
          product.category.toLowerCase() === activeCategory.toLowerCase(),
      );
    }

    result = result.filter(
      (product) =>
        product.discountedPrice >= priceRange.min &&
        product.discountedPrice <= priceRange.max,
    );

    if (searchTerm) {
      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          product.category.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

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

  const getCategoryCount = (category: string) => {
    return products.filter(
      (p) => p.category.toLowerCase() === category.toLowerCase(),
    ).length;
  };

  const resetFilters = () => {
    setActiveCategory("all");
    setPriceRange({ min: 0, max: 1000 });
    setSearchTerm("");
    setSortBy("featured");
  };

  const hasActiveFilters =
    activeCategory !== "all" ||
    priceRange.min > 0 ||
    priceRange.max < 1000 ||
    searchTerm;

  const CategoryFilterList = ({ onSelect }: { onSelect?: () => void }) => (
    <div className="space-y-1.5">
      <button
        onClick={() => {
          setActiveCategory("all");
          onSelect?.();
        }}
        className={`block w-full text-left px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
          activeCategory === "all"
            ? "bg-[#1b3c35] text-white"
            : "hover:bg-[#1b3c35]/[0.06] text-[#26261F]"
        }`}
      >
        <div className="flex justify-between items-center">
          <span>All Products</span>
          <span className="text-xs opacity-75">{products.length}</span>
        </div>
      </button>
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => {
            setActiveCategory(category.slug);
            onSelect?.();
          }}
          className={`block w-full text-left px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
            activeCategory === category.slug
              ? "bg-[#1b3c35] text-white"
              : "hover:bg-[#1b3c35]/[0.06] text-[#26261F]"
          }`}
        >
          <div className="flex justify-between items-center">
            <span>{category.name}</span>
            <span className="text-xs opacity-75">
              {getCategoryCount(category.slug)}
            </span>
          </div>
        </button>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FBF6EF]">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#1b3c35] to-[#254f45]">
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
          aria-hidden="true"
        />

        <div className="container mx-auto px-4 md:px-6 py-14 md:py-24 relative z-10">
          <div className="max-w-4xl">
            <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] uppercase text-[#E39A89] mb-5">
              <span className="h-px w-6 bg-[#E39A89]" />
              The full collection
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight tracking-tight">
              All Products
            </h1>

            <p className="text-lg md:text-xl text-white/75 mb-8 max-w-2xl">
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
                className="inline-flex items-center justify-center gap-2 bg-[#E39A89] hover:bg-[#d9866f] text-white px-8 py-3 rounded-xl font-semibold text-lg transition-colors shadow-lg"
              >
                <FiShoppingBag className="w-5 h-5" />
                Browse Products
              </button>

              <Link
                href="/category"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 backdrop-blur-sm text-white border border-white/20 px-8 py-3 rounded-xl font-semibold text-lg transition-colors"
              >
                <FiPackage className="w-5 h-5" />
                Browse by Category
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <section className="py-8 bg-white border-b border-[#1b3c35]/10">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4">
              <div className="text-2xl font-bold text-[#1b3c35] mb-1">
                {products.length}
              </div>
              <div className="text-sm text-[#26261F]/55">Total Products</div>
            </div>
            <div className="text-center p-4">
              <div className="text-2xl font-bold text-[#1b3c35] mb-1">
                {getCategoryCount("skincare")}
              </div>
              <div className="text-sm text-[#26261F]/55">Skincare Items</div>
            </div>
            <div className="text-center p-4">
              <div className="text-2xl font-bold text-[#1b3c35] mb-1">
                {getCategoryCount("fragrance")}
              </div>
              <div className="text-sm text-[#26261F]/55">Fragrances</div>
            </div>
            <div className="text-center p-4">
              <div className="text-2xl font-bold text-[#1b3c35] mb-1">
                {getCategoryCount("importation") +
                  getCategoryCount("accessories")}
              </div>
              <div className="text-sm text-[#26261F]/55">
                Importation &amp; Accessories
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Quick Links */}
      <section className="py-12 bg-[#1b3c35]/[0.03]">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-2xl font-bold text-[#1b3c35] mb-6 tracking-tight">
            Shop by Category
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={category.link}
                className="group relative overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1"
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
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 p-4 bg-white rounded-2xl ring-1 ring-black/5">
            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden flex items-center gap-2 px-4 py-2 bg-[#1b3c35]/[0.06] hover:bg-[#1b3c35]/10 rounded-lg text-[#1b3c35] font-medium"
            >
              <FiFilter className="w-5 h-5" />
              Filters
              {activeCategory !== "all" && (
                <span className="ml-1 px-2 py-0.5 bg-[#E39A89] text-white text-xs rounded-full">
                  1
                </span>
              )}
            </button>

            {/* Search */}
            <div className="w-full md:w-auto">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#1b3c35]/40 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full md:w-64 pl-10 pr-4 py-2 border border-[#1b3c35]/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E39A89] text-[#26261F] placeholder:text-[#26261F]/40"
                />
              </div>
            </div>

            {/* View Controls */}
            <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
              {/* Sort Dropdown */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none px-4 py-2 pr-8 border border-[#1b3c35]/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E39A89] bg-white text-[#26261F] text-sm"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      Sort: {option.label}
                    </option>
                  ))}
                </select>
                <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#1b3c35]/50 w-4 h-4" />
              </div>

              {/* View Toggle */}
              <div className="hidden md:flex items-center gap-1 bg-[#1b3c35]/[0.06] rounded-lg p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  aria-label="Grid view"
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === "grid"
                      ? "bg-white text-[#1b3c35] shadow-sm"
                      : "text-[#1b3c35]/50 hover:text-[#1b3c35]"
                  }`}
                >
                  <FiGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  aria-label="List view"
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === "list"
                      ? "bg-white text-[#1b3c35] shadow-sm"
                      : "text-[#1b3c35]/50 hover:text-[#1b3c35]"
                  }`}
                >
                  <FiList className="w-4 h-4" />
                </button>
              </div>

              {/* Reset Filters */}
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="text-sm text-[#c9614d] hover:opacity-80 font-medium"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          <div className="flex gap-8">
            {/* Filters Sidebar (Desktop) */}
            <div className="hidden md:block w-64 shrink-0">
              <div className="bg-white rounded-2xl ring-1 ring-black/5 p-6 sticky top-24">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-[#1b3c35]">Filters</h3>
                  <button
                    onClick={resetFilters}
                    className="text-sm text-[#c9614d] hover:opacity-80"
                  >
                    Reset All
                  </button>
                </div>

                {/* Categories Filter */}
                <div className="mb-6">
                  <h4 className="font-semibold text-[#1b3c35] mb-3 text-sm uppercase tracking-wide">
                    Categories
                  </h4>
                  <CategoryFilterList />
                </div>

                {/* Price Filter */}
                <div className="mb-6">
                  <h4 className="font-semibold text-[#1b3c35] mb-3 text-sm uppercase tracking-wide">
                    Price Range
                  </h4>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-[#26261F]/60">
                        ₵{priceRange.min}
                      </span>
                      <span className="text-sm text-[#26261F]/60">
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
                      className="w-full accent-[#E39A89]"
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
                      className="w-full accent-[#E39A89]"
                    />
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={priceRange.min}
                        onChange={(e) =>
                          setPriceRange({
                            ...priceRange,
                            min: parseInt(e.target.value) || 0,
                          })
                        }
                        className="w-full px-3 py-2 border border-[#1b3c35]/15 rounded-lg text-sm text-[#26261F] focus:outline-none focus:ring-2 focus:ring-[#E39A89]"
                        placeholder="Min"
                      />
                      <span className="text-[#1b3c35]/40 shrink-0">–</span>
                      <input
                        type="number"
                        value={priceRange.max}
                        onChange={(e) =>
                          setPriceRange({
                            ...priceRange,
                            max: parseInt(e.target.value) || 1000,
                          })
                        }
                        className="w-full px-3 py-2 border border-[#1b3c35]/15 rounded-lg text-sm text-[#26261F] focus:outline-none focus:ring-2 focus:ring-[#E39A89]"
                        placeholder="Max"
                      />
                    </div>
                  </div>
                </div>

                {/* Current Filters */}
                {(activeCategory !== "all" ||
                  priceRange.min > 0 ||
                  priceRange.max < 1000) && (
                  <div className="pt-4 border-t border-[#1b3c35]/10">
                    <h4 className="font-semibold text-[#1b3c35] mb-2 text-sm uppercase tracking-wide">
                      Active Filters
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {activeCategory !== "all" && (
                        <span className="inline-flex items-center px-3 py-1 bg-[#E39A89]/10 text-[#c9614d] rounded-full text-sm">
                          {
                            categories.find((c) => c.slug === activeCategory)
                              ?.name
                          }
                          <button
                            onClick={() => setActiveCategory("all")}
                            className="ml-2 text-xs hover:opacity-70"
                            aria-label="Remove category filter"
                          >
                            <FiX className="w-3 h-3" />
                          </button>
                        </span>
                      )}
                      {(priceRange.min > 0 || priceRange.max < 1000) && (
                        <span className="inline-flex items-center px-3 py-1 bg-[#8FA593]/15 text-[#4d6b56] rounded-full text-sm">
                          ₵{priceRange.min} - ₵{priceRange.max}
                          <button
                            onClick={() => setPriceRange({ min: 0, max: 1000 })}
                            className="ml-2 text-xs hover:opacity-70"
                            aria-label="Reset price filter"
                          >
                            <FiX className="w-3 h-3" />
                          </button>
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Products Grid */}
            <div className="flex-1 min-w-0">
              {/* Mobile Filters Overlay */}
              {showFilters && (
                <div
                  className="md:hidden fixed inset-0 bg-black/50 z-50"
                  onClick={() => setShowFilters(false)}
                >
                  <div
                    className="absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-white shadow-lg overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-[#1b3c35]">
                          Filters
                        </h3>
                        <button
                          onClick={() => setShowFilters(false)}
                          aria-label="Close filters"
                        >
                          <FiX className="w-6 h-6 text-[#1b3c35]" />
                        </button>
                      </div>
                      <div className="mb-6">
                        <h4 className="font-semibold text-[#1b3c35] mb-3 text-sm uppercase tracking-wide">
                          Categories
                        </h4>
                        <CategoryFilterList
                          onSelect={() => setShowFilters(false)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Results Summary */}
              <div className="mb-6 flex flex-wrap justify-between items-end gap-3">
                <div>
                  <h2 className="text-2xl font-bold text-[#1b3c35] tracking-tight">
                    {activeCategory === "all"
                      ? "All Products"
                      : categories.find((c) => c.slug === activeCategory)
                          ?.name + " Products"}
                  </h2>
                  <p className="text-[#26261F]/60">
                    Showing {filteredProducts.length} of {products.length}{" "}
                    products
                  </p>
                </div>
                {searchTerm && (
                  <div className="text-sm text-[#26261F]/60">
                    Search results for:{" "}
                    <span className="font-semibold text-[#1b3c35]">
                      &ldquo;{searchTerm}&rdquo;
                    </span>
                  </div>
                )}
              </div>

              {/* Loading State */}
              {loading ? (
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-[#1b3c35]/[0.06] h-64 rounded-xl mb-3"></div>
                      <div className="h-4 bg-[#1b3c35]/[0.08] rounded mb-2"></div>
                      <div className="h-3 bg-[#1b3c35]/[0.06] rounded w-2/3"></div>
                    </div>
                  ))}
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl ring-1 ring-black/5">
                  <div className="flex justify-center mb-4">
                    <FiSearch className="w-16 h-16 text-[#1b3c35]/20" />
                  </div>
                  <h3 className="text-xl font-bold text-[#1b3c35] mb-2">
                    No products found
                  </h3>
                  <p className="text-[#26261F]/60 mb-6">
                    {searchTerm
                      ? `No products match "${searchTerm}"`
                      : "Try adjusting your filters or browse by category"}
                  </p>
                  <button
                    onClick={resetFilters}
                    className="px-6 py-3 bg-[#1b3c35] hover:bg-[#254f45] text-white rounded-lg font-semibold transition-colors"
                  >
                    Reset All Filters
                  </button>
                </div>
              ) : viewMode === "grid" ? (
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
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
                      className="bg-white rounded-2xl p-4 ring-1 ring-black/5 hover:shadow-lg transition-shadow"
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
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-[#1b3c35] mb-1 truncate">
                            {product.name}
                          </h3>
                          <p className="text-[#26261F]/60 text-sm mb-2 line-clamp-2">
                            {product.description}
                          </p>
                          <div className="flex flex-wrap justify-between items-center gap-2">
                            <div>
                              <span className="text-lg font-bold text-[#1b3c35]">
                                ₵{product.discountedPrice.toFixed(2)}
                              </span>
                              {product.originalPrice >
                                product.discountedPrice && (
                                <span className="ml-2 text-sm line-through text-[#26261F]/35">
                                  ₵{product.originalPrice.toFixed(2)}
                                </span>
                              )}
                            </div>
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-medium ${
                                categories.find(
                                  (c) =>
                                    c.slug === product.category?.toLowerCase(),
                                )?.chip || "bg-[#1b3c35]/[0.06] text-[#1b3c35]"
                              }`}
                            >
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
      <section className="py-16 bg-[#1b3c35]/[0.03]">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12 max-w-xl mx-auto">
            <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] uppercase text-[#8FA593] mb-3">
              <span className="h-px w-6 bg-[#8FA593]" />
              Why shop with us
            </span>
            <h2 className="text-3xl font-bold text-[#1b3c35] tracking-tight mb-4">
              Why Shop With Us
            </h2>
            <p className="text-[#26261F]/60">
              We&apos;re committed to providing the best beauty shopping
              experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <div className="bg-white p-6 rounded-2xl ring-1 ring-black/5 text-center transform hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 rounded-full bg-[#E39A89]/15 flex items-center justify-center mx-auto mb-4">
                <FiTruck className="w-8 h-8 text-[#E39A89]" />
              </div>
              <h3 className="text-xl font-bold text-[#1b3c35] mb-3">
                Fast Delivery
              </h3>
              <p className="text-[#26261F]/60">
                Nationwide delivery across Ghana. Get your beauty products
                delivered to your doorstep.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl ring-1 ring-black/5 text-center transform hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 rounded-full bg-[#1b3c35]/10 flex items-center justify-center mx-auto mb-4">
                <FiShield className="w-8 h-8 text-[#1b3c35]" />
              </div>
              <h3 className="text-xl font-bold text-[#1b3c35] mb-3">
                Authentic Products
              </h3>
              <p className="text-[#26261F]/60">
                100% genuine products with quality guarantee. We source directly
                from trusted brands.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl ring-1 ring-black/5 text-center transform hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 rounded-full bg-[#8FA593]/15 flex items-center justify-center mx-auto mb-4">
                <FiSmile className="w-8 h-8 text-[#8FA593]" />
              </div>
              <h3 className="text-xl font-bold text-[#1b3c35] mb-3">
                Customer Support
              </h3>
              <p className="text-[#26261F]/60">
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
