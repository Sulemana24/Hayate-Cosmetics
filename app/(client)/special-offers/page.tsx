"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import Image from "next/image";
import Link from "next/link";
import {
  FiArrowLeft,
  FiFilter,
  FiGrid,
  FiList,
  FiStar,
  FiGift,
  FiClock,
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
  discountPercentage: number;
}

export default function SpecialOffersPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [categories, setCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>("discount");
  const [timeLeft, setTimeLeft] = useState({
    days: 3,
    hours: 12,
    minutes: 45,
    seconds: 30,
  });

  // Countdown timer (simulated)
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { days, hours, minutes, seconds } = prev;

        seconds--;
        if (seconds < 0) {
          seconds = 59;
          minutes--;
        }
        if (minutes < 0) {
          minutes = 59;
          hours--;
        }
        if (hours < 0) {
          hours = 23;
          days--;
        }

        return { days, hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const productsRef = collection(db, "products");
        const snapshot = await getDocs(productsRef);

        let productsData = snapshot.docs.map((doc) => {
          const data = doc.data();
          const discount =
            data.originalPrice > 0
              ? ((data.originalPrice - data.discountedPrice) /
                  data.originalPrice) *
                100
              : 0;
          return {
            id: doc.id,
            ...data,
            discountPercentage: Math.round(discount),
          };
        }) as Product[];

        // Filter products with discounts
        let discountedProducts = productsData.filter(
          (p) => p.discountPercentage >= 5
        );

        // Extract unique categories from discounted products
        const uniqueCategories = Array.from(
          new Set(discountedProducts.map((p) => p.category))
        );
        setCategories(["all", ...uniqueCategories]);

        // Apply sorting
        if (sortBy === "discount") {
          discountedProducts.sort(
            (a, b) => b.discountPercentage - a.discountPercentage
          );
        } else if (sortBy === "price-low") {
          discountedProducts.sort(
            (a, b) => a.discountedPrice - b.discountedPrice
          );
        } else if (sortBy === "price-high") {
          discountedProducts.sort(
            (a, b) => b.discountedPrice - a.discountedPrice
          );
        } else if (sortBy === "rating") {
          discountedProducts.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        }

        // Apply category filter
        if (selectedCategory !== "all") {
          discountedProducts = discountedProducts.filter(
            (p) => p.category === selectedCategory
          );
        }

        setProducts(discountedProducts);
      } catch (error) {
        console.error("Error fetching special offers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory, sortBy]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header with Countdown */}
      <div className="bg-gradient-to-r from-red-50/50 to-pink-50/50 dark:from-red-900/20 dark:to-pink-900/20">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center gap-4 mb-6">
            <Link
              href="/"
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-[#e39a89]"
            >
              <FiArrowLeft /> Back to Home
            </Link>
          </div>

          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <FiGift className="w-10 h-10 text-red-500" />
              <h1 className="text-4xl md:text-5xl font-bold text-[#1b3c35] dark:text-white">
                Special Offers
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Limited time offers! Don't miss these incredible deals on premium
              beauty products.
            </p>
          </div>

          {/* Countdown Timer */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-center gap-2 mb-4">
                <FiClock className="w-5 h-5 text-red-500" />
                <span className="font-bold text-lg">
                  Limited Time Offer Ends In:
                </span>
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-500 mb-1">
                    {timeLeft.days}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Days
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-500 mb-1">
                    {timeLeft.hours.toString().padStart(2, "0")}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Hours
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-500 mb-1">
                    {timeLeft.minutes.toString().padStart(2, "0")}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Minutes
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-500 mb-1">
                    {timeLeft.seconds.toString().padStart(2, "0")}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Seconds
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
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
                    ? "bg-red-500 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                All Offers
              </button>
              {categories
                .filter((cat) => cat !== "all")
                .map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedCategory === category
                        ? "bg-red-500 text-white"
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
                className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="discount">Highest Discount</option>
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
                    ? "bg-red-500 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                <FiGrid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg ${
                  viewMode === "list"
                    ? "bg-red-500 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                <FiList className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Products Grid/List */}
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

                  {/* Discount Badge */}
                  <div className="absolute top-2 right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                    -{product.discountPercentage}%
                  </div>

                  {/* Hot Deal Badge */}
                  <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-bold">
                    HOT DEAL
                  </div>
                </div>

                <div
                  className={`flex-1 ${viewMode === "list" ? "py-2" : "mt-4"}`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center gap-1 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded">
                      <FiGift className="w-3 h-3" /> Limited Time
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

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-bold text-[#1b3c35] dark:text-white">
                          ₵{product.discountedPrice.toFixed(2)}
                        </span>
                        <span className="text-sm line-through text-gray-400 ml-2">
                          ₵{product.originalPrice.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FiStar className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {product.rating?.toFixed(1) || "4.5"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-red-500 font-bold">
                        Save ₵
                        {(
                          product.originalPrice - product.discountedPrice
                        ).toFixed(2)}
                      </span>
                      <span className="text-gray-500">
                        Only {Math.floor(Math.random() * 20) + 5} left!
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-red-500 to-pink-500 h-2 rounded-full"
                        style={{
                          width: `${Math.min(100, Math.random() * 70 + 30)}%`,
                        }}
                      />
                    </div>
                  </div>

                  {viewMode === "list" && (
                    <button className="w-full mt-4 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity font-semibold">
                      Get This Deal →
                    </button>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 max-w-md mx-auto">
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiGift className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">
                No Special Offers Found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {selectedCategory !== "all"
                  ? `No offers found in ${selectedCategory}. Try another category.`
                  : "Check back soon for new offers!"}
              </p>
              {selectedCategory !== "all" && (
                <button
                  onClick={() => setSelectedCategory("all")}
                  className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg hover:opacity-90"
                >
                  View All Offers
                </button>
              )}
            </div>
          </div>
        )}

        {/* Results Count */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <p className="text-gray-600 dark:text-gray-400">
              Showing {products.length} special offer
              {products.length !== 1 ? "s" : ""} with up to{" "}
              {Math.max(...products.map((p) => p.discountPercentage))}% off
            </p>
            <div className="text-sm text-red-500 font-medium">
              <FiClock className="inline mr-1" />
              Sale ends in {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}
              m
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
