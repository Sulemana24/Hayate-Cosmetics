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
  startAfter,
} from "firebase/firestore";
import Image from "next/image";
import {
  FiArrowRight,
  FiChevronLeft,
  FiChevronRight,
  FiTrendingUp,
  FiGift,
  FiLoader,
} from "react-icons/fi";
import Link from "next/link";

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

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] uppercase text-[#8FA593] dark:text-[#a9c2ae] mb-3">
      <span className="h-px w-6 bg-[#8FA593] dark:bg-[#a9c2ae]" />
      {children}
    </span>
  );
}

function LeafDivider() {
  return (
    <div className="flex items-center justify-center py-2" aria-hidden="true">
      <div className="h-px w-16 bg-[#1b3c35]/15 dark:bg-white/10" />
      <svg
        width="18"
        height="18"
        viewBox="0 0 18 18"
        fill="none"
        className="mx-3 text-[#8FA593] dark:text-[#a9c2ae]"
      >
        <path
          d="M9 1C9 1 3 5 3 10a6 6 0 0012 0c0-5-6-9-6-9z"
          stroke="currentColor"
          strokeWidth="1.3"
        />
        <path d="M9 4v11" stroke="currentColor" strokeWidth="1.3" />
      </svg>
      <div className="h-px w-16 bg-[#1b3c35]/15 dark:bg-white/10" />
    </div>
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

function EmptyState({ label }: { label: string }) {
  return (
    <div className="text-center py-16 bg-[#1b3c35]/[0.03] dark:bg-white/[0.03] rounded-2xl border border-dashed border-[#1b3c35]/15 dark:border-white/15">
      <p className="text-[#26261F]/60 dark:text-white/60">{label}</p>
    </div>
  );
}

export default function Home() {
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [specialOffers, setSpecialOffers] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState({
    newArrivals: true,
    bestSellers: true,
    specialOffers: true,
    featured: true,
    categories: true,
  });
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [featuredLimit, setFeaturedLimit] = useState(8);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreFeatured, setHasMoreFeatured] = useState(true);

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
        // Silent fail
      } finally {
        setLoading((prev) => ({ ...prev, newArrivals: false }));
      }
    };

    fetchNewArrivals();
  }, []);

  useEffect(() => {
    const fetchBestSellers = async () => {
      try {
        const productsRef = collection(db, "products");

        const q = query(productsRef, where("rating", ">=", 4), limit(8));
        const snapshot = await getDocs(q);
        const products = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Product[];

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
        // Silent fail
      } finally {
        setLoading((prev) => ({ ...prev, bestSellers: false }));
      }
    };

    fetchBestSellers();
  }, []);

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

        const discountedProducts = products.filter(
          (p) => p.discountPercentage > 5,
        );
        setSpecialOffers(discountedProducts.slice(0, 6));
      } catch (error) {
        // Silent fail
      } finally {
        setLoading((prev) => ({ ...prev, specialOffers: false }));
      }
    };

    fetchSpecialOffers();
  }, []);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const productsRef = collection(db, "products");
        const q = query(
          productsRef,
          orderBy("createdAt", "desc"),
          limit(featuredLimit),
        );
        const snapshot = await getDocs(q);
        const products = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Product[];

        setFeaturedProducts(products);
        setHasMoreFeatured(products.length === featuredLimit);
      } catch (error) {
        // Silent fail
      } finally {
        setLoading((prev) => ({ ...prev, featured: false }));
      }
    };

    fetchFeatured();
  }, [featuredLimit]);

  const loadMoreFeatured = async () => {
    setIsLoadingMore(true);
    const newLimit = featuredLimit + 8;
    setFeaturedLimit(newLimit);
    setIsLoadingMore(false);
  };

  useEffect(() => {
    if (newArrivals.length === 0) return;

    const interval = setInterval(() => {
      handleNextSlide();
    }, 5000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          Math.ceil(newArrivals.length / 4),
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

  const getCurrentSlideProducts = () => {
    const startIndex = currentSlide * 4;
    return newArrivals.slice(startIndex, startIndex + 4);
  };

  return (
    <div className="min-h-screen bg-[#FBF6EF] dark:bg-[#0f1e1a]">
      <ClientNavbar />
      <HeroSection />

      {/* New Arrivals */}
      <section className="py-14 md:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-wrap justify-between items-end gap-4 mb-10">
            <div>
              <SectionEyebrow>Just landed</SectionEyebrow>
              <h2 className="text-3xl md:text-4xl font-bold text-[#1b3c35] dark:text-white tracking-tight">
                New Arrivals
              </h2>
              <p className="text-[#26261F]/60 dark:text-white/60 mt-1">
                Fresh beauty products, restocked weekly
              </p>
            </div>
            <Link
              href="/new-arrivals"
              className="inline-flex items-center gap-2 text-[#c9614d] dark:text-[#E39A89] font-semibold transition-all hover:gap-3 hover:text-[#b84d3a] dark:hover:text-[#d48776]"
            >
              View All <FiArrowRight className="transition-transform" />
            </Link>
          </div>

          {loading.newArrivals ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {[...Array(4)].map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : newArrivals.length > 0 ? (
            <div className="relative">
              <button
                onClick={handlePrevSlide}
                className="hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-5 z-10 items-center justify-center w-11 h-11 bg-white dark:bg-[#16302a] text-[#1b3c35] dark:text-white rounded-full shadow-md ring-1 ring-black/5 hover:shadow-lg hover:scale-105 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E39A89]"
                aria-label="Previous slide"
              >
                <FiChevronLeft className="w-5 h-5" />
              </button>

              <button
                onClick={handleNextSlide}
                className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-5 z-10 items-center justify-center w-11 h-11 bg-white dark:bg-[#16302a] text-[#1b3c35] dark:text-white rounded-full shadow-md ring-1 ring-black/5 hover:shadow-lg hover:scale-105 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E39A89]"
                aria-label="Next slide"
              >
                <FiChevronRight className="w-5 h-5" />
              </button>

              <div className="overflow-x-auto lg:overflow-hidden -mx-1 px-1">
                <div
                  className={`transition-all duration-300 ease-in-out ${
                    isTransitioning ? "opacity-40" : "opacity-100"
                  }`}
                >
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                    {getCurrentSlideProducts().map((product) => (
                      <Link
                        key={product.id}
                        href={`/product/${product.id}`}
                        className="group bg-white dark:bg-[#16302a] rounded-2xl p-3 sm:p-4 ring-1 ring-black/5 dark:ring-white/5 hover:ring-[#E39A89]/40 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                      >
                        <div className="relative aspect-square overflow-hidden rounded-xl mb-4 bg-[#1b3c35]/5">
                          <Image
                            src={product.imageUrl || "/api/placeholder/400/400"}
                            alt={product.name}
                            width={400}
                            height={400}
                            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute top-2.5 left-2.5 bg-[#1b3c35] text-white px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider">
                            NEW
                          </div>
                        </div>
                        <h3 className="font-semibold text-[#1b3c35] dark:text-white mb-1 truncate">
                          {product.name}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-[#1b3c35] dark:text-white">
                            ₵{product.discountedPrice.toFixed(2)}
                          </span>
                          {product.originalPrice > product.discountedPrice && (
                            <span className="text-sm line-through text-[#26261F]/35 dark:text-white/35">
                              ₵{product.originalPrice.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-center gap-2 mt-9">
                {[...Array(Math.ceil(newArrivals.length / 4))].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goToSlide(i)}
                    className={`h-2 rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E39A89] ${
                      i === currentSlide
                        ? "w-8 bg-[#E39A89]"
                        : "w-2 bg-[#1b3c35]/15 dark:bg-white/20 hover:bg-[#1b3c35]/30"
                    }`}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          ) : (
            <EmptyState label="No new arrivals yet — check back soon." />
          )}
        </div>
      </section>

      <LeafDivider />

      {/* Featured Products */}
      <section className="py-14 md:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-wrap justify-between items-end gap-4 mb-10">
            <div>
              <SectionEyebrow>Curated for you</SectionEyebrow>
              <h2 className="text-3xl md:text-4xl font-bold text-[#1b3c35] dark:text-white tracking-tight">
                Featured Products
              </h2>
              <p className="text-[#26261F]/60 dark:text-white/60 mt-1">
                A selection of our premium beauty essentials
              </p>
            </div>
            <Link
              href="/category/all"
              className="inline-flex items-center gap-2 text-[#c9614d] dark:text-[#E39A89] font-semibold transition-all hover:gap-3 hover:text-[#b84d3a] dark:hover:text-[#d48776]"
            >
              View All <FiArrowRight className="transition-transform" />
            </Link>
          </div>

          {loading.featured ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {[...Array(8)].map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : featuredProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {featuredProducts.map((product) => (
                  <Link
                    key={product.id}
                    href={`/product/${product.id}`}
                    className="group bg-white dark:bg-[#16302a] rounded-2xl p-3 sm:p-4 ring-1 ring-black/5 dark:ring-white/5 hover:ring-[#E39A89]/40 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <div className="relative aspect-square overflow-hidden rounded-xl mb-4 bg-[#1b3c35]/5">
                      <Image
                        src={product.imageUrl || "/api/placeholder/400/400"}
                        alt={product.name}
                        width={400}
                        height={400}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                      />
                      {product.discountPercentage > 0 && (
                        <div className="absolute top-2.5 right-2.5 bg-[#E39A89] text-white px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider">
                          -{product.discountPercentage}%
                        </div>
                      )}
                    </div>
                    <h3 className="font-semibold text-[#1b3c35] dark:text-white mb-1 truncate">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-[#1b3c35] dark:text-white">
                        ₵{product.discountedPrice.toFixed(2)}
                      </span>
                      {product.originalPrice > product.discountedPrice && (
                        <span className="text-sm line-through text-[#26261F]/35 dark:text-white/35">
                          ₵{product.originalPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>

              {hasMoreFeatured && (
                <div className="flex justify-center mt-10">
                  <button
                    onClick={loadMoreFeatured}
                    disabled={isLoadingMore}
                    className="inline-flex items-center gap-2 px-8 py-3 bg-white dark:bg-[#16302a] text-[#1b3c35] dark:text-white font-semibold rounded-xl ring-1 ring-[#1b3c35]/15 dark:ring-white/15 hover:ring-[#E39A89]/50 hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isLoadingMore ? (
                      <>
                        <FiLoader className="w-5 h-5 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        Load More
                        <FiArrowRight className="transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          ) : (
            <EmptyState label="No featured products available yet." />
          )}
        </div>
      </section>

      <LeafDivider />

      {/* Best Sellers */}
      <section className="py-14 md:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-wrap items-end gap-4 mb-10">
            <div className="flex items-start gap-3">
              <div className="hidden sm:flex items-center justify-center w-11 h-11 rounded-full bg-[#8FA593]/15 text-[#4d6b56] dark:text-[#a9c2ae] shrink-0">
                <FiTrendingUp className="w-5 h-5" />
              </div>
              <div>
                <SectionEyebrow>Customer favorites</SectionEyebrow>
                <h2 className="text-3xl md:text-4xl font-bold text-[#1b3c35] dark:text-white tracking-tight">
                  Best Sellers
                </h2>
                <p className="text-[#26261F]/60 dark:text-white/60 mt-1">
                  Our most loved beauty products
                </p>
              </div>
            </div>
            <Link
              href="/best-sellers"
              className="ml-auto flex items-center gap-1.5 text-[#c9614d] dark:text-[#E39A89] font-semibold transition-colors hover:gap-2.5"
            >
              View all <FiArrowRight />
            </Link>
          </div>

          {loading.bestSellers ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {[...Array(8)].map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : bestSellers.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {bestSellers.slice(0, 8).map((product) => (
                <Link
                  key={product.id}
                  href={`/product/${product.id}`}
                  className="group bg-white dark:bg-[#16302a] rounded-2xl p-3 sm:p-4 ring-1 ring-black/5 dark:ring-white/5 hover:ring-[#E39A89]/40 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="relative aspect-square overflow-hidden rounded-xl mb-4 bg-[#1b3c35]/5">
                    <Image
                      src={product.imageUrl || "/api/placeholder/400/400"}
                      alt={product.name}
                      width={400}
                      height={400}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2.5 left-2.5 bg-[#8FA593] text-white px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider">
                      TOP
                    </div>
                  </div>
                  <h3 className="font-semibold text-[#1b3c35] dark:text-white mb-2 truncate">
                    {product.name}
                  </h3>
                  <div className="flex flex-wrap items-center justify-between gap-y-1">
                    <span className="text-lg font-bold text-[#1b3c35] dark:text-white">
                      ₵{product.discountedPrice.toFixed(2)}
                    </span>
                    <span className="text-xs sm:text-sm text-[#c9614d] dark:text-[#E39A89] font-medium">
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
            <EmptyState label="No best sellers available yet." />
          )}
        </div>
      </section>

      <TestimonialFAQSection />
      <Footer />
      <BackToTop />
    </div>
  );
}
