"use client";

import Image from "next/image";
import Link from "next/link";
import { FiShoppingBag, FiArrowLeft } from "react-icons/fi";
import { StaticImageData } from "next/image";

interface CategoryHeaderProps {
  title: string;
  subtitle: string;
  description: string;
  category: string;
  primaryColor: string;
  backgroundImage: StaticImageData;
}

export default function CategoryHeader({
  title,
  subtitle,
  description,
  category,
  primaryColor,
  backgroundImage,
}: CategoryHeaderProps) {
  return (
    <div className="relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Image
          src={backgroundImage}
          alt={title}
          fill
          priority
          className="object-cover"
          quality={85}
        />
        <div
          className={`absolute inset-0 bg-gradient-to-r ${primaryColor} opacity-60`}
        ></div>
        <div className="absolute inset-0 bg-black/30"></div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-16 md:py-24 relative z-10">
        <div className="max-w-3xl">
          <div className="grid gap-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-white/90 hover:text-white mb-6 transition-colors group"
            >
              <FiArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </Link>

            <span className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium text-white mb-4 border border-white/30">
              {subtitle}
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            {title}
          </h1>

          <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl backdrop-blur-sm bg-black/10 p-4 rounded-xl">
            {description}
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => {
                const productsSection = document.getElementById("products");
                productsSection?.scrollIntoView({ behavior: "smooth" });
              }}
              className="inline-flex items-center justify-center gap-2 bg-white text-gray-800 hover:bg-gray-50 px-8 py-3 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 shadow-lg group cursor-pointer"
            >
              <FiShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Shop Now
            </button>

            <Link
              href="/category"
              className="inline-flex items-center justify-center gap-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-2 border-white/30 px-8 py-3 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 group cursor-pointer"
            >
              Browse All Categories
              <span className="group-hover:translate-x-1 transition-transform">
                →
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Floating decorative elements */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/20 to-transparent z-10 pointer-events-none"></div>
    </div>
  );
}
