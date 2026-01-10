"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  FiSearch,
  FiFilter,
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiChevronDown,
  FiPackage,
  FiShoppingBag,
  FiDollarSign,
  FiImage,
  FiX,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import { MdOutlineInventory } from "react-icons/md";

import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
  Timestamp,
} from "firebase/firestore";

interface Product {
  id: string;
  name: string;
  description: string;
  originalPrice: number;
  discountedPrice: number;
  category: string;
  quantity: number;
  status: "In Stock" | "Low Stock" | "Out of Stock";
  imageUrl: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export default function ProductsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  const categories = ["All", "Skincare", "Fragrance", "Accessories"];

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const q = query(
          collection(db, "products"),
          orderBy("createdAt", "desc")
        );
        const snapshot = await getDocs(q);
        const items = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Product[];
        setProducts(items);
      } catch (error) {
        console.error("Firestore fetch failed:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Handle delete product
  const handleDelete = async (id: string, name: string) => {
    if (
      !confirm(
        `Are you sure you want to delete "${name}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await deleteDoc(doc(db, "products", id));
      setProducts(products.filter((p) => p.id !== id));
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete product");
    }
  };

  // Filter products
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return b.createdAt.seconds - a.createdAt.seconds;
      case "oldest":
        return a.createdAt.seconds - b.createdAt.seconds;
      case "price-low":
        return a.discountedPrice - b.discountedPrice;
      case "price-high":
        return b.discountedPrice - a.discountedPrice;
      case "name-asc":
        return a.name.localeCompare(b.name);
      case "name-desc":
        return b.name.localeCompare(a.name);
      default:
        return 0;
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = sortedProducts.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  // Get status color
  const getStatusColor = (status: Product["status"]) => {
    switch (status) {
      case "In Stock":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "Low Stock":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "Out of Stock":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  // Calculate stats
  const totalProducts = products.length;
  const inStockCount = products.filter((p) => p.status === "In Stock").length;
  const lowStockCount = products.filter((p) => p.status === "Low Stock").length;
  const averagePrice = products.length
    ? Math.round(
        products.reduce((sum, p) => sum + p.discountedPrice, 0) /
          products.length
      )
    : 0;

  // Check if any filter is active
  const hasActiveFilters = searchQuery || selectedCategory !== "All";

  // Function to extract domain for unoptimized images
  const isExternalImage = (url: string) => {
    if (!url) return true;
    try {
      const urlObj = new URL(url);
      return (
        !urlObj.hostname.includes("localhost") &&
        !urlObj.hostname.includes("vercel")
      );
    } catch {
      return true;
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-[#e39a89] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Loading products...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#1b3c35] dark:text-white mb-2">
              Products Management
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Manage your store products, inventory, and pricing
            </p>
          </div>
          <Link
            href="/admin/products/new"
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#e39a89] to-[#d87a6a] hover:from-[#d87a6a] hover:to-[#c86a5a] text-white px-4 py-2.5 rounded-xl font-medium transition-all duration-200"
          >
            <FiPlus className="w-4 h-4" />
            Add New Product
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-r from-[#e39a89]/20 to-[#d87a6a]/20">
              <FiPackage className="w-6 h-6 text-[#e39a89]" />
            </div>
            <span className="text-sm font-medium text-green-600 dark:text-green-400">
              +{products.length > 0 ? "12.5" : "0"}%
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            Total Products
          </p>
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
            {totalProducts}
          </h3>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-green-50 dark:bg-green-900/20">
              <FiShoppingBag className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <span className="text-sm font-medium text-green-600 dark:text-green-400">
              +{inStockCount > 0 ? "8.3" : "0"}%
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            In Stock
          </p>
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
            {inStockCount}
          </h3>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-yellow-50 dark:bg-yellow-900/20">
              <MdOutlineInventory className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <span className="text-sm font-medium text-red-600 dark:text-red-400">
              -{lowStockCount > 0 ? "2.1" : "0"}%
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            Low Stock
          </p>
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
            {lowStockCount}
          </h3>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20">
              <FiDollarSign className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <span className="text-sm font-medium text-green-600 dark:text-green-400">
              +{averagePrice > 0 ? "15.2" : "0"}%
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            Avg. Price
          </p>
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
            ₵{averagePrice}
          </h3>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search products by name or description..."
                className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#e39a89]/20 focus:border-[#e39a89] dark:focus:border-[#1b3c35] outline-none transition-all duration-200"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="relative">
            <button
              onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
              className="flex items-center gap-2 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200"
            >
              <FiFilter className="w-5 h-5 text-gray-400" />
              <span className="text-gray-700 dark:text-gray-300">
                {selectedCategory}
              </span>
              <FiChevronDown className="w-5 h-5 text-gray-400" />
            </button>

            {showCategoryDropdown && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowCategoryDropdown(false)}
                />
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-20">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => {
                        setSelectedCategory(category);
                        setShowCategoryDropdown(false);
                      }}
                      className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 first:rounded-t-xl last:rounded-b-xl ${
                        selectedCategory === category
                          ? "text-[#e39a89] dark:text-[#1b3c35] font-medium"
                          : "text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr className="text-left text-sm text-gray-500 dark:text-gray-400">
                <th className="py-4 pl-6 font-medium">Product</th>
                <th className="py-4 font-medium">Category</th>
                <th className="py-4 font-medium">Price</th>
                <th className="py-4 font-medium">Quantity</th>
                <th className="py-4 font-medium">Status</th>
                <th className="py-4 pr-6 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {currentProducts.length > 0 ? (
                currentProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors duration-150"
                  >
                    <td className="py-4 pl-6">
                      <div className="flex items-center gap-4">
                        {/* Product Image - Using Next.js Image component */}
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-r from-[#e39a89]/20 to-[#d87a6a]/20 flex-shrink-0 relative">
                          {product.imageUrl ? (
                            <div className="relative w-full h-full">
                              <Image
                                src={product.imageUrl}
                                alt={product.name}
                                fill
                                sizes="64px"
                                className="object-cover"
                                unoptimized={isExternalImage(product.imageUrl)}
                                onError={(e) => {
                                  // Fallback if image fails to load
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = "none";
                                  const fallback = document.getElementById(
                                    `fallback-${product.id}`
                                  );
                                  if (fallback) fallback.style.display = "flex";
                                }}
                              />
                              <div
                                id={`fallback-${product.id}`}
                                className="hidden w-full h-full absolute inset-0 items-center justify-center bg-gradient-to-r from-[#e39a89]/10 to-[#d87a6a]/10"
                              >
                                <FiImage className="w-8 h-8 text-[#e39a89]" />
                              </div>
                            </div>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <FiImage className="w-8 h-8 text-[#e39a89]" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-800 dark:text-white mb-1 truncate">
                            {product.name}
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 max-w-xs">
                            {product.description}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            {product.originalPrice > product.discountedPrice ? (
                              <>
                                <span className="text-xs text-gray-400 line-through">
                                  ₵{product.originalPrice.toFixed(2)}
                                </span>
                                <span className="text-sm font-medium text-[#e39a89]">
                                  ₵{product.discountedPrice.toFixed(2)}
                                </span>
                                <span className="text-xs font-medium text-green-600 bg-green-50 dark:bg-green-900/30 px-1.5 py-0.5 rounded">
                                  -
                                  {Math.round(
                                    ((product.originalPrice -
                                      product.discountedPrice) /
                                      product.originalPrice) *
                                      100
                                  )}
                                  %
                                </span>
                              </>
                            ) : (
                              <span className="text-sm font-medium text-[#e39a89]">
                                ₵{product.discountedPrice.toFixed(2)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                        {product.category}
                      </span>
                    </td>
                    <td className="py-4">
                      <div className="text-sm text-gray-800 dark:text-white">
                        <div className="font-medium">
                          ₵{product.discountedPrice.toFixed(2)}
                        </div>
                        {product.originalPrice > product.discountedPrice && (
                          <div className="text-xs text-gray-500 line-through">
                            ₵{product.originalPrice.toFixed(2)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-800 dark:text-white">
                          {product.quantity}
                        </span>
                        {product.quantity <= 5 && product.quantity > 0 && (
                          <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></span>
                        )}
                        {product.quantity === 0 && (
                          <span className="w-2 h-2 rounded-full bg-red-400"></span>
                        )}
                      </div>
                    </td>
                    <td className="py-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          product.status
                        )}`}
                      >
                        {product.status}
                      </span>
                    </td>
                    <td className="py-4 pr-6">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/products/edit/${product.id}`}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30 rounded-lg transition-colors duration-200"
                          title="Edit"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id, product.name)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 rounded-lg transition-colors duration-200"
                          title="Delete"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-[#e39a89]/10 to-[#d87a6a]/10 flex items-center justify-center">
                      <FiPackage className="w-8 h-8 text-[#e39a89]" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
                      No products found
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      {hasActiveFilters
                        ? "Try adjusting your filters or search term"
                        : "Add your first product to get started"}
                    </p>
                    <Link
                      href="/admin/products/new"
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-[#e39a89] to-[#d87a6a] hover:from-[#d87a6a] hover:to-[#c86a5a] text-white px-6 py-2 rounded-xl font-medium transition-all duration-200"
                    >
                      <FiPlus className="w-4 h-4" />
                      Add New Product
                    </Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {currentProducts.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Showing{" "}
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {indexOfFirstItem + 1}-
                  {Math.min(indexOfLastItem, sortedProducts.length)}
                </span>{" "}
                of{" "}
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {sortedProducts.length}
                </span>{" "}
                products
                {hasActiveFilters && (
                  <span className="ml-2 text-xs px-2 py-1 bg-[#e39a89]/10 text-[#e39a89] rounded">
                    Filtered
                  </span>
                )}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    <FiChevronLeft className="w-4 h-4" />
                  </button>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-10 h-10 rounded-lg font-medium transition-colors duration-200 ${
                          currentPage === pageNum
                            ? "bg-gradient-to-r from-[#e39a89] to-[#d87a6a] text-white"
                            : "border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    <FiChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="text-center mt-8">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          © {new Date().getFullYear()} Hayate Cosmetics. All rights reserved.
        </p>
      </div>
    </div>
  );
}
