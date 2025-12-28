"use client";

import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import ProductCard from "./ProductCard";
import { Product } from "@/types/product";
import { FiLoader, FiSearch } from "react-icons/fi";

interface ProductsGridProps {
  limitCount?: number;
  showFilters?: boolean;
}

export default function ProductsGrid({
  limitCount = 12,
  showFilters = true,
}: ProductsGridProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState("newest");

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        let q = query(collection(db, "products"), orderBy("createdAt", "desc"));
        if (limitCount) q = query(q, limit(limitCount));

        const snapshot = await getDocs(q);
        const fetchedProducts = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Product[];

        setProducts(fetchedProducts);
        setError(null);
      } catch (err) {
        console.error(err);
        setError("Failed to load products.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [limitCount]);

  // Apply filters & sorting
  useEffect(() => {
    let temp = [...products];

    if (categoryFilter !== "all") {
      temp = temp.filter(
        (p) => p.category.toLowerCase() === categoryFilter.toLowerCase()
      );
    }

    if (searchTerm.trim()) {
      temp = temp.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    switch (sortBy) {
      case "price-low":
        temp.sort((a, b) => a.discountedPrice - b.discountedPrice);
        break;
      case "price-high":
        temp.sort((a, b) => b.discountedPrice - a.discountedPrice);
        break;
      case "name":
        temp.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        temp.sort((a, b) => {
          const aTime =
            a.createdAt instanceof Timestamp
              ? a.createdAt.toMillis()
              : a.createdAt?.getTime() || 0;
          const bTime =
            b.createdAt instanceof Timestamp
              ? b.createdAt.toMillis()
              : b.createdAt?.getTime() || 0;
          return bTime - aTime;
        });
    }

    setFilteredProducts(temp);
  }, [products, searchTerm, categoryFilter, sortBy]);

  if (loading)
    return (
      <div className="flex justify-center items-center py-20">
        <FiLoader className="w-10 h-10 text-[#e39a89] animate-spin" />
      </div>
    );

  if (error) return <p className="text-center py-20 text-red-600">{error}</p>;

  return (
    <div className="space-y-6">
      {/* Filters */}
      {showFilters && (
        <div className="flex flex-col md:flex-row gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
          {/* Search */}
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-sm"
            />
          </div>

          {/* Category */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md px-4 py-2 text-sm"
          >
            <option value="all">All Categories</option>
            {[...new Set(products.map((p) => p.category))].map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md px-4 py-2 text-sm"
          >
            <option value="newest">Newest</option>
            <option value="price-low">Price: Low → High</option>
            <option value="price-high">Price: High → Low</option>
            <option value="name">Name: A → Z</option>
          </select>
        </div>
      )}

      {/* Product Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.length === 0 ? (
          <p className="col-span-full text-center text-gray-500">
            No products found.
          </p>
        ) : (
          filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))
        )}
      </div>
    </div>
  );
}
