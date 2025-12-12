import ProductsGrid from "@/components/ProductGrid";
import { FiGrid, FiFilter } from "react-icons/fi";

export default function ShopPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#faf7f5] to-[#f0ece9] dark:from-gray-900 dark:to-gray-800 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-[#1b3c35] dark:text-white mb-6">
              Shop Our Collection
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              Discover premium skincare, exquisite fragrances, and beauty
              accessories curated for every skin type.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Filters (Optional - can be implemented later) */}
            <aside className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 sticky top-24">
                <div className="flex items-center gap-2 mb-6">
                  <FiFilter className="w-5 h-5 text-[#e39a89]" />
                  <h3 className="font-semibold text-gray-800 dark:text-white">
                    Filters
                  </h3>
                </div>

                {/* Category Filter */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Categories
                  </h4>
                  <div className="space-y-2">
                    {[
                      "All",
                      "Skincare",
                      "Fragrance",
                      "Accessories",
                      "Makeup",
                      "Haircare",
                    ].map((category) => (
                      <label
                        key={category}
                        className="flex items-center gap-3 cursor-pointer group"
                      >
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-[#e39a89] bg-gray-100 border-gray-300 rounded focus:ring-[#e39a89] dark:focus:ring-[#e39a89] dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <span className="text-gray-600 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-300">
                          {category}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Price Range
                  </h4>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max="1000"
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                    />
                    <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                      <span>₵0</span>
                      <span>₵1000</span>
                    </div>
                  </div>
                </div>

                {/* Status Filter */}
                <div>
                  <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Availability
                  </h4>
                  <div className="space-y-2">
                    {["In Stock", "Low Stock", "Out of Stock"].map((status) => (
                      <label
                        key={status}
                        className="flex items-center gap-3 cursor-pointer group"
                      >
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-[#e39a89] bg-gray-100 border-gray-300 rounded focus:ring-[#e39a89] dark:focus:ring-[#e39a89] dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <span className="text-gray-600 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-300">
                          {status}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Apply Filters Button */}
                <button className="w-full mt-6 py-3 bg-gradient-to-r from-[#e39a89] to-[#d87a6a] text-white rounded-xl font-medium hover:opacity-90 transition-opacity">
                  Apply Filters
                </button>
              </div>
            </aside>

            {/* Products Grid */}
            <main className="lg:col-span-3">
              <ProductsGrid showFilters={true} limitCount={20} />
            </main>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-[#1b3c35] dark:text-white mb-12">
            Shop By Category
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                name: "Skincare",
                description: "Cleansers, moisturizers, serums & more",
                count: 24,
                color: "from-blue-400 to-cyan-400",
              },
              {
                name: "Fragrance",
                description: "Perfumes, colognes & body mists",
                count: 18,
                color: "from-purple-400 to-pink-400",
              },
              {
                name: "Accessories",
                description: "Brushes, mirrors & beauty tools",
                count: 32,
                color: "from-amber-400 to-orange-400",
              },
            ].map((category) => (
              <div
                key={category.name}
                className="group bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700 cursor-pointer"
              >
                <div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${category.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                >
                  <FiGrid className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                  {category.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {category.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {category.count} products
                  </span>
                  <span className="text-[#e39a89] font-medium group-hover:translate-x-2 transition-transform duration-300">
                    Shop Now →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
