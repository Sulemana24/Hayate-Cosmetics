"use client";

import { useState } from "react";
import { FiFilter, FiX, FiCheck } from "react-icons/fi";
import { useRouter } from "next/navigation";

interface CategoryFilterProps {
  categories: string[];
  selectedCategories: string[];
  onCategoryChange: (categories: string[]) => void;
  title?: string;
  showCounts?: boolean;
}

export default function CategoryFilter({
  categories,
  selectedCategories,
  onCategoryChange,
  title = "Filter by Category",
  showCounts = true,
}: CategoryFilterProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const router = useRouter();

  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      onCategoryChange(selectedCategories.filter((c) => c !== category));
    } else {
      onCategoryChange([...selectedCategories, category]);
    }
  };

  const clearFilters = () => {
    onCategoryChange([]);
  };

  const applyFiltersAndNavigate = () => {
    if (selectedCategories.length === 0) {
      router.push("/category/all");
    } else if (selectedCategories.length === 1) {
      router.push(`/collections/${selectedCategories[0]}`);
    } else {
      // For multiple categories, navigate to all page with query params
      const queryString = selectedCategories
        .map((c) => `category=${c}`)
        .join("&");
      router.push(`/category/all?${queryString}`);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <FiFilter className="w-5 h-5" />
          {title}
        </h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-500 hover:text-gray-700"
        >
          {isExpanded ? "−" : "+"}
        </button>
      </div>

      {isExpanded && (
        <>
          <div className="space-y-2 mb-6">
            {categories.map((category) => {
              const isSelected = selectedCategories.includes(category);
              return (
                <button
                  key={category}
                  onClick={() => toggleCategory(category)}
                  className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg transition-colors ${
                    isSelected
                      ? "bg-[#e39a89]/10 text-[#e39a89] border border-[#e39a89]/20"
                      : "hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center ${
                        isSelected
                          ? "bg-[#e39a89] border-[#e39a89]"
                          : "border-gray-300"
                      }`}
                    >
                      {isSelected && <FiCheck className="w-3 h-3 text-white" />}
                    </div>
                    <span className="capitalize">
                      {category.replace("-", " ")}
                    </span>
                  </div>
                  {showCounts && (
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700">
                      {/* This would come from your data */}
                      12
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="space-y-3">
            {selectedCategories.length > 0 && (
              <div>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Selected ({selectedCategories.length})
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedCategories.map((category) => (
                    <span
                      key={category}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#e39a89]/10 text-[#e39a89] rounded-full text-sm"
                    >
                      {category.replace("-", " ")}
                      <button
                        onClick={() => toggleCategory(category)}
                        className="ml-1 hover:text-[#d87a6a]"
                      >
                        <FiX className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={clearFilters}
                disabled={selectedCategories.length === 0}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Clear All
              </button>
              <button
                onClick={applyFiltersAndNavigate}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#e39a89] to-[#d87a6a] text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
