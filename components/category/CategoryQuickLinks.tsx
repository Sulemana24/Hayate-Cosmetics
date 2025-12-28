"use client";

import Link from "next/link";
import Image from "next/image";
import { FiArrowRight } from "react-icons/fi";

// Import category images
import skincareImg from "@/public/images/catcos.jpg";
import fragranceImg from "@/public/images/catp.jpg";
import accessoriesImg from "@/public/images/catb.jpg";
import makeupImg from "@/public/images/mak.jpg";

interface CategoryQuickLinksProps {
  title?: string;
  subtitle?: string;
  columns?: 2 | 3 | 4;
  showViewAll?: boolean;
}

export default function CategoryQuickLinks({
  title = "Shop Our Collections",
  subtitle = "Discover premium products in every category",
  columns = 4,
  showViewAll = true,
}: CategoryQuickLinksProps) {
  const categories = [
    {
      id: 1,
      name: "Skincare",
      description: "Organic, cruelty-free skincare",
      count: "45 Products",
      link: "/category/skincare",
      image: skincareImg,
      color: "from-[#e39a89] to-[#d87a6a]",
    },
    {
      id: 2,
      name: "Fragrance",
      description: "Premium perfumes & scents",
      count: "32 Products",
      link: "/category/fragrance",
      image: fragranceImg,
      color: "from-[#1b3c35] to-[#2a4d45]",
    },
    {
      id: 3,
      name: "Accessories",
      description: "Complete your look",
      count: "28 Products",
      link: "//category/accessories",
      image: accessoriesImg,
      color: "from-[#f8b195] to-[#f67280]",
    },
    {
      id: 4,
      name: "Makeup",
      description: "Professional cosmetics",
      count: "56 Products",
      link: "/category/makeup",
      image: makeupImg,
      color: "from-[#6a5acd] to-[#836fff]",
    },
  ];

  const gridCols = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <section className="py-12 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4 md:px-6">
        {(title || subtitle) && (
          <div className="text-center mb-12">
            {title && (
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-gray-600 max-w-2xl mx-auto">{subtitle}</p>
            )}
          </div>
        )}

        <div className={`grid ${gridCols[columns]} gap-6`}>
          {categories.map((category) => (
            <Link
              key={category.id}
              href={category.link}
              className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500"
            >
              <div className="relative h-64">
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div
                  className={`absolute inset-0 bg-gradient-to-t ${category.color} opacity-70`}
                ></div>
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {category.name}
                  </h3>
                  <p className="text-white/90 mb-3">{category.description}</p>
                  <p className="text-white/80 text-sm">{category.count}</p>
                </div>
              </div>
              <div className="absolute top-4 right-4 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full">
                <span className="text-white text-sm font-medium">Explore</span>
              </div>
            </Link>
          ))}
        </div>

        {showViewAll && (
          <div className="text-center mt-12">
            <Link
              href="/category/all"
              className="inline-flex items-center gap-2 text-[#e39a89] hover:text-[#d87a6a] font-semibold text-lg px-8 py-3 rounded-xl border-2 border-[#e39a89] hover:border-[#d87a6a] transition-all duration-300"
            >
              View All Categories
              <FiArrowRight className="w-5 h-5" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
