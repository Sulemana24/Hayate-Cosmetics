"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/ToastProvider";
import ProductCard from "@/components/ProductCard";
import CategoryHeader from "@/components/category/CategoryHeader";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { Product } from "@/types/product";
import Image2 from "@/public/images/accbg.jpg";

const accessoriesTypes = [
  { id: 1, name: "Sunglasses", count: "10 Products", icon: "🕶️" },
  { id: 2, name: "Jewelry", count: "8 Products", icon: "💎" },
  { id: 3, name: "Bags", count: "6 Products", icon: "👜" },
  { id: 4, name: "Hair Accessories", count: "4 Products", icon: "👑" },
];

export default function AccessoriesPage() {
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsRef = collection(db, "products");
        const q = query(
          productsRef,
          where("categorySlug", "==", "accessories"),
          orderBy("createdAt", "desc")
        );
        const snapshot = await getDocs(q);

        const productsData: Product[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toMillis
              ? data.createdAt.toMillis()
              : null,
            updatedAt: data.updatedAt?.toMillis
              ? data.updatedAt.toMillis()
              : null,
          } as Product;
        });

        setProducts(productsData);
      } catch (error) {
        showToast({
          type: "error",
          message: "Failed to fetch accessories products.",
        });
      }
    };

    fetchProducts();
  }, [showToast]);

  return (
    <>
      <CategoryHeader
        title="Accessories Collection"
        subtitle="Complete Your Look"
        description="Stylish sunglasses, delicate jewelry, and fashion accessories for every occasion. Elevate your style with our curated selection."
        category="accessories"
        primaryColor="from-[#f8b195] to-[#f67280]"
        backgroundImage={Image2}
      />

      {/* Quick Stats */}
      <section className="py-8 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4">
              <div className="text-2xl font-bold text-[#f67280] mb-1">28+</div>
              <div className="text-sm text-gray-600">Accessories</div>
            </div>
            <div className="text-center p-4">
              <div className="text-2xl font-bold text-[#f67280] mb-1">
                Premium
              </div>
              <div className="text-sm text-gray-600">Materials</div>
            </div>
            <div className="text-center p-4">
              <div className="text-2xl font-bold text-[#f67280] mb-1">UV</div>
              <div className="text-sm text-gray-600">Protection</div>
            </div>
            <div className="text-center p-4">
              <div className="text-2xl font-bold text-[#f67280] mb-1">
                Hypoallergenic
              </div>
              <div className="text-sm text-gray-600">Options</div>
            </div>
          </div>
        </div>
      </section>

      {/* Accessories Types */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Shop by Type
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {accessoriesTypes.map((type) => (
              <a
                key={type.id}
                href={`#${type.name.toLowerCase()}`}
                className="group p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-white hover:from-[#f8b195] hover:to-[#f67280] transition-all duration-300 shadow-md hover:shadow-xl transform hover:-translate-y-2"
              >
                <div className="text-3xl mb-4 group-hover:text-white transform group-hover:scale-110 transition-transform">
                  {type.icon}
                </div>
                <h3 className="font-bold text-lg text-gray-800 group-hover:text-white mb-1">
                  {type.name}
                </h3>
                <p className="text-sm text-gray-500 group-hover:text-white/80">
                  {type.count}
                </p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section id="products" className="py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-white">All Accessories</h2>
            <span className="text-gray-500">{products.length} Products</span>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">
                No accessories products found.
              </p>
              <a
                href="/collections/all"
                className="mt-4 inline-block text-[#f67280] hover:text-[#f8b195] font-semibold"
              >
                Browse All Products →
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  showActions={true}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Style Tips */}
      <section className="py-16 bg-gradient-to-r from-[#faf7f5] to-white">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            Accessory Styling Tips
          </h2>
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg transform hover:-translate-y-2 transition-all duration-300">
              <div className="w-14 h-14 rounded-full bg-[#f8b195]/20 flex items-center justify-center mb-6">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Statement Pieces
              </h3>
              <p className="text-gray-600 mb-4">
                Choose one statement accessory per outfit. Let it be the focal
                point and keep other accessories minimal.
              </p>
              <ul className="text-gray-600 text-sm space-y-2">
                <li>• Bold necklace with simple earrings</li>
                <li>• Statement earrings with minimal necklace</li>
                <li>• Colorful bag with neutral accessories</li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg transform hover:-translate-y-2 transition-all duration-300">
              <div className="w-14 h-14 rounded-full bg-[#f67280]/20 flex items-center justify-center mb-6">
                <span className="text-2xl">⚖️</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Balance & Proportion
              </h3>
              <p className="text-gray-600 mb-4">
                Match accessory size to your frame and outfit volume. Delicate
                pieces for delicate fabrics, bold for structured looks.
              </p>
              <ul className="text-gray-600 text-sm space-y-2">
                <li>• Petite frame: dainty jewelry</li>
                <li>• Bold patterns: simple accessories</li>
                <li>• Monochrome outfits: colorful accents</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
