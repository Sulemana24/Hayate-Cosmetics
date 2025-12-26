"use client";

import { useState, useEffect } from "react";
import ClientNavbar from "@/components/Navbar";
import HeroSection from "@/components/Hero";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTopButton";
import ProductsGrid from "@/components/ProductGrid";
import TestimonialFAQSection from "@/components/Testimonial";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";
import Image from "next/image";
import {
  FiArrowRight,
  FiStar,
  FiChevronLeft,
  FiChevronRight,
  FiTag,
  FiTrendingUp,
  FiGift,
} from "react-icons/fi";
import Link from "next/link";

// Define Product type
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

export default function Home() {
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [specialOffers, setSpecialOffers] = useState<Product[]>([]);

  const [loading, setLoading] = useState({
    newArrivals: true,
    bestSellers: true,
    specialOffers: true,
    categories: true,
  });
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Fetch New Arrivals
  useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        const productsRef = collection(db, "products");
        const q = query(productsRef, orderBy("createdAt", "desc"), limit(10));
        const snapshot = await getDocs(q);
        const products = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Product[];
        setNewArrivals(products);
      } catch (error) {
        console.error("Error fetching new arrivals:", error);
      } finally {
        setLoading((prev) => ({ ...prev, newArrivals: false }));
      }
    };

    fetchNewArrivals();
  }, []);

  // Fetch Best Sellers (products with highest rating or most purchases)
  useEffect(() => {
    const fetchBestSellers = async () => {
      try {
        const productsRef = collection(db, "products");
        // Try to get highly rated products
        const q = query(productsRef, where("rating", ">=", 4), limit(8));
        const snapshot = await getDocs(q);
        const products = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Product[];

        // Fallback to random products if no rated products
        if (products.length === 0) {
          const allProducts = await getDocs(collection(db, "products"));
          const all = allProducts.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Product[];
          setBestSellers(all.slice(0, 8));
        } else {
          setBestSellers(products);
        }
      } catch (error) {
        console.error("Error fetching best sellers:", error);
      } finally {
        setLoading((prev) => ({ ...prev, bestSellers: false }));
      }
    };

    fetchBestSellers();
  }, []);

  // Fetch Special Offers
  useEffect(() => {
    const fetchSpecialOffers = async () => {
      try {
        const productsRef = collection(db, "products");
        const snapshot = await getDocs(productsRef);
        const products = snapshot.docs.map((doc) => {
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

        // Filter products with actual discounts
        const discountedProducts = products.filter(
          (p) => p.discountPercentage > 5
        );
        setSpecialOffers(discountedProducts.slice(0, 6));
      } catch (error) {
        console.error("Error fetching special offers:", error);
      } finally {
        setLoading((prev) => ({ ...prev, specialOffers: false }));
      }
    };

    fetchSpecialOffers();
  }, []);

  // Auto slide for new arrivals
  useEffect(() => {
    if (newArrivals.length === 0) return;

    const interval = setInterval(() => {
      handleNextSlide();
    }, 5000);

    return () => clearInterval(interval);
  }, [newArrivals.length, currentSlide]);

  const handleNextSlide = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % Math.ceil(newArrivals.length / 4));
      setIsTransitioning(false);
    }, 300);
  };

  const handlePrevSlide = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentSlide(
        (prev) =>
          (prev - 1 + Math.ceil(newArrivals.length / 4)) %
          Math.ceil(newArrivals.length / 4)
      );
      setIsTransitioning(false);
    }, 300);
  };

  const goToSlide = (index: number) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentSlide(index);
      setIsTransitioning(false);
    }, 300);
  };

  // Get current slide products
  const getCurrentSlideProducts = () => {
    const startIndex = currentSlide * 4;
    return newArrivals.slice(startIndex, startIndex + 4);
  };

  return (
    <div className="min-h-screen">
      <ClientNavbar />

      {/* Hero Section */}
      <HeroSection />

      {/* New Arrivals Slider */}
      <section className="py-16 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#1b3c35] dark:text-white mb-2">
                New Arrivals
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Fresh beauty products just for you
              </p>
            </div>
            <Link
              href="/new-arrivals"
              className="flex items-center gap-2 text-[#e39a89] hover:text-[#d87a6a] font-semibold transition-colors"
            >
              View All <FiArrowRight />
            </Link>
          </div>

          {loading.newArrivals ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 dark:bg-gray-700 h-64 rounded-xl mb-3"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : newArrivals.length > 0 ? (
            <div className="relative">
              <button
                onClick={handlePrevSlide}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white dark:bg-gray-800 p-3 rounded-full shadow-lg hover:shadow-xl transition-shadow hover:scale-105"
                aria-label="Previous slide"
              >
                <FiChevronLeft className="w-6 h-6" />
              </button>

              <button
                onClick={handleNextSlide}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white dark:bg-gray-800 p-3 rounded-full shadow-lg hover:shadow-xl transition-shadow hover:scale-105"
                aria-label="Next slide"
              >
                <FiChevronRight className="w-6 h-6" />
              </button>

              <div className="overflow-hidden">
                <div
                  className={`transition-all duration-300 ease-in-out ${
                    isTransitioning ? "opacity-50" : "opacity-100"
                  }`}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {getCurrentSlideProducts().map((product) => (
                      <Link
                        key={product.id}
                        href={`/product/${product.id}`}
                        className="group bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                      >
                        <div className="relative aspect-square overflow-hidden rounded-xl mb-4">
                          <Image
                            src={product.imageUrl || "/api/placeholder/400/400"}
                            alt={product.name}
                            width={400}
                            height={400}
                            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-2 left-2 bg-[#e39a89] text-white px-3 py-1 rounded-full text-xs font-bold">
                            NEW
                          </div>
                        </div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1 truncate">
                          {product.name}
                        </h3>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-[#1b3c35] dark:text-white">
                              ₵{product.discountedPrice.toFixed(2)}
                            </span>
                            {product.originalPrice >
                              product.discountedPrice && (
                              <span className="text-sm line-through text-gray-400">
                                ₵{product.originalPrice.toFixed(2)}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <FiStar className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {product.rating?.toFixed(1) || "4.5"}
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* Slider Dots */}
              <div className="flex justify-center gap-2 mt-8">
                {[...Array(Math.ceil(newArrivals.length / 4))].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goToSlide(i)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      i === currentSlide
                        ? "w-8 bg-[#e39a89]"
                        : "bg-gray-300 dark:bg-gray-600 hover:bg-gray-400"
                    }`}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-2xl">
              <p className="text-gray-600 dark:text-gray-400">
                No new arrivals available
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1b3c35] dark:text-white mb-4">
              Featured Products
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Discover our curated selection of premium beauty products
            </p>
          </div>
          <ProductsGrid limitCount={8} showFilters={true} />
        </div>
      </section>

      {/* Special Offers */}
      <section className="py-16 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-8">
            <FiGift className="w-8 h-8 text-red-500" />
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#1b3c35] dark:text-white">
                Special Offers
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Don&apos;t miss these amazing deals
              </p>
            </div>
            <Link
              href="/special-offers"
              className="ml-auto flex items-center gap-2 text-[#e39a89] hover:text-[#d87a6a] font-semibold transition-colors"
            >
              View All <FiArrowRight />
            </Link>
          </div>

          {loading.specialOffers ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 dark:bg-gray-700 h-48 rounded-xl mb-3"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : specialOffers.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
              {specialOffers.map((product) => (
                <Link
                  key={product.id}
                  href={`/product/${product.id}`}
                  className="group bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-transparent hover:border-[#e39a89]/20"
                >
                  <div className="relative aspect-square overflow-hidden rounded-xl mb-4">
                    <Image
                      src={product.imageUrl || "/api/placeholder/400/400"}
                      alt={product.name}
                      width={400}
                      height={400}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                      -{product.discountPercentage}%
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-1">
                    {product.name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-[#1b3c35] dark:text-white">
                        ₵{product.discountedPrice.toFixed(2)}
                      </span>
                      <span className="text-sm line-through text-gray-400">
                        ₵{product.originalPrice.toFixed(2)}
                      </span>
                    </div>
                    <span className="text-sm text-red-500 font-medium">
                      Save ₵
                      {(
                        product.originalPrice - product.discountedPrice
                      ).toFixed(2)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-2xl">
              <p className="text-gray-600 dark:text-gray-400">
                No special offers available
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Best Sellers */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-8">
            <FiTrendingUp className="w-8 h-8 text-green-500" />
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#1b3c35] dark:text-white">
                Best Sellers
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Our most loved beauty products
              </p>
            </div>
            <Link
              href="/best-sellers"
              className="ml-auto flex items-center gap-2 text-[#e39a89] hover:text-[#d87a6a] font-semibold transition-colors"
            >
              View All <FiArrowRight />
            </Link>
          </div>

          {loading.bestSellers ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 dark:bg-gray-700 h-64 rounded-xl mb-3"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : bestSellers.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {bestSellers.slice(0, 8).map((product) => (
                <Link
                  key={product.id}
                  href={`/product/${product.id}`}
                  className="group bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="relative aspect-square overflow-hidden rounded-xl mb-4">
                    <Image
                      src={product.imageUrl || "/api/placeholder/400/400"}
                      alt={product.name}
                      width={400}
                      height={400}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                      TOP
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2 truncate">
                    {product.name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-[#1b3c35] dark:text-white">
                      ₵{product.discountedPrice.toFixed(2)}
                    </span>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <FiStar
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(product.rating || 5)
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-2xl">
              <p className="text-gray-600 dark:text-gray-400">
                No best sellers available
              </p>
            </div>
          )}
        </div>
      </section>

      <TestimonialFAQSection />
      <Footer />
      <BackToTop />
    </div>
  );
}
