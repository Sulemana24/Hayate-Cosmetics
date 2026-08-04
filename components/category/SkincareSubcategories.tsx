"use client";

import { useState } from "react";
import { useToast } from "@/components/ToastProvider";

// Extend Window interface to include handleSubcategoryClick
declare global {
  interface Window {
    handleSubcategoryClick?: (slug: string) => void;
  }
}

interface Subcategory {
  id: number;
  name: string;
  count: string;
  slug: string;
}

interface Props {
  subcategories: Subcategory[];
}

export default function SkincareSubcategories({ subcategories }: Props) {
  const { showToast } = useToast();
  const [activeSlug, setActiveSlug] = useState("all");

  const handleClick = (slug: string, name: string) => {
    setActiveSlug(slug);

    // Call the global function to filter products
    if (typeof window !== "undefined" && window.handleSubcategoryClick) {
      window.handleSubcategoryClick(slug);
    }

    // Show toast feedback
    const message =
      slug === "all" ? "Showing all products" : `Showing ${name} products`;

    showToast({
      message,
      type: "success",
    });
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {subcategories.map((subcat) => {
        const isActive = activeSlug === subcat.slug;

        return (
          <button
            key={subcat.id}
            onClick={() => handleClick(subcat.slug, subcat.name)}
            className={`group p-4 rounded-xl transition-all duration-300 transform hover:-translate-y-1 ${
              isActive
                ? "bg-gradient-to-r from-[#e39a89] to-[#d87a6a] text-white shadow-lg"
                : "bg-gray-50 hover:bg-gradient-to-r hover:from-[#e39a89] hover:to-[#d87a6a]"
            }`}
            data-slug={subcat.slug}
          >
            <h3
              className={`font-semibold mb-1 ${
                isActive ? "text-white" : "text-gray-800 group-hover:text-white"
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
  );
}
