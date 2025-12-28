import CategoryQuickLinks from "@/components/category/CategoryQuickLinks";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Product Collections | Your Beauty Store",
  description:
    "Browse our premium collection of skincare, fragrance, accessories, and makeup products.",
};

export default function CollectionsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#faf7f5] to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-[#1b3c35] to-[#2a4d45]">
        <div className="absolute inset-0 bg-black/20"></div>

        <div className="container mx-auto px-4 md:px-6 py-16 md:py-24 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Our Collections
            </h1>

            <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Discover premium beauty products curated for your unique style and
              needs. Each collection is carefully selected to bring you the best
              in beauty and wellness.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#categories"
                className="inline-flex items-center justify-center gap-2 bg-white text-gray-800 hover:bg-gray-50 px-8 py-3 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 shadow-lg"
              >
                Browse Collections
              </a>

              <a
                href="/category/all"
                className="inline-flex items-center justify-center gap-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-2 border-white/30 px-8 py-3 rounded-xl font-semibold text-lg transition-all duration-300"
              >
                View All Products
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section id="categories" className="py-16">
        <div className="container mx-auto px-4 md:px-6">
          <CategoryQuickLinks
            title="Shop Our Collections"
            subtitle="Discover premium products in every category"
            columns={4}
            showViewAll={false}
          />
        </div>
      </section>

      {/* Why Shop With Us */}
      <section className="py-16 bg-gradient-to-r from-[#faf7f5] to-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Why Shop Our Collections
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We&apos;re committed to providing the best beauty shopping
              experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl shadow-lg text-center transform hover:-translate-y-2 transition-all duration-300">
              <div className="w-16 h-16 rounded-full bg-[#e39a89]/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✨</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                Curated Selection
              </h3>
              <p className="text-gray-600">
                Each collection is carefully curated to bring you only the best
                products from trusted brands.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg text-center transform hover:-translate-y-2 transition-all duration-300">
              <div className="w-16 h-16 rounded-full bg-[#1b3c35]/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏆</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                Premium Quality
              </h3>
              <p className="text-gray-600">
                100% authentic products with quality guarantee. We source
                directly from manufacturers.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg text-center transform hover:-translate-y-2 transition-all duration-300">
              <div className="w-16 h-16 rounded-full bg-[#f67280]/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💝</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                Expert Advice
              </h3>
              <p className="text-gray-600">
                Our beauty experts are here to help you find the perfect
                products for your needs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-[#e39a89] to-[#d87a6a]">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Discover Your Perfect Products?
          </h2>
          <p className="text-white/90 mb-8 max-w-2xl mx-auto">
            Browse our complete collection and find everything you need for your
            beauty routine.
          </p>
          <a
            href="/category/all"
            className="inline-flex items-center justify-center gap-2 bg-white text-gray-800 hover:bg-gray-50 px-8 py-3 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 shadow-lg"
          >
            Shop All Products
          </a>
        </div>
      </section>
    </div>
  );
}
