"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiSearch, FiChevronRight } from "react-icons/fi";

export default function HeroSection() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearching(true);
      // Simulate search delay
      setTimeout(() => {
        router.push(`/shop?search=${encodeURIComponent(searchQuery)}`);
        setIsSearching(false);
      }, 500);
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-white via-[#fef6f3] to-[#fcefe9] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient orbs */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-[#e39a89]/20 to-[#d87a6a]/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-[#e39a89]/10 to-[#d87a6a]/5 rounded-full blur-3xl" />

        {/* Geometric pattern */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e39a89' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: "60px 60px",
            }}
          />
        </div>
      </div>

      <div className="relative container mx-auto px-4 py-16 lg:py-24">
        <div className="max-w-4xl mx-auto text-center">
          {/* Promo Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#e39a89]/10 to-[#d87a6a]/10 border border-[#e39a89]/20 mb-8">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#e39a89] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#e39a89]"></span>
            </span>
            <span className="text-sm font-medium text-[#e39a89]">
              ✨ Summer Sale: Up to 30% off on all products
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
            Discover Your
            <span className="block mt-2">
              <span className="relative">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e39a89] via-[#e39a89] to-[#d87a6a]">
                  Perfect Beauty
                </span>
                <span className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-[#e39a89] to-[#d87a6a] rounded-full opacity-50"></span>
              </span>
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed max-w-2xl mx-auto">
            Premium skincare, luxury fragrances, and beauty accessories
            carefully curated for your unique beauty journey. Experience the
            perfect blend of nature and innovation.
          </p>

          {/* Main Search Bar */}
          <div className="mb-10 max-w-2xl mx-auto">
            <form onSubmit={handleSearch} className="relative">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-[#e39a89] to-[#d87a6a] rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
                <div className="relative">
                  <FiSearch className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5 z-10" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for products"
                    className="w-full pl-14 pr-32 py-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-4 focus:ring-[#e39a89]/20 focus:border-[#e39a89] dark:focus:border-[#e39a89] outline-none transition-all duration-300 text-lg shadow-lg backdrop-blur-sm"
                    autoComplete="off"
                  />
                  <button
                    type="submit"
                    disabled={isSearching}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-[#e39a89] to-[#d87a6a] text-white px-6 py-2.5 rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center gap-2"
                  >
                    {isSearching ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Searching...
                      </>
                    ) : (
                      <>
                        Search
                        <FiChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Call to Action Buttons */}
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => router.push("/shop")}
              className="group relative px-8 py-4 bg-gradient-to-r from-[#e39a89] to-[#d87a6a] text-white rounded-2xl font-medium hover:shadow-2xl hover:shadow-[#e39a89]/30 transition-all duration-300 transform hover:-translate-y-1 flex items-center gap-2"
            >
              <span>Shop Now</span>
              <FiChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              <div className="absolute inset-0 rounded-2xl border-2 border-white/20 group-hover:border-white/40 transition-all duration-300"></div>
            </button>

            <button
              onClick={() => router.push("/consultation")}
              className="px-8 py-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-2xl font-medium hover:border-[#e39a89] hover:text-[#e39a89] dark:hover:text-[#e39a89] transition-all duration-300 transform hover:-translate-y-1 shadow-lg"
            >
              Book Consultation
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
