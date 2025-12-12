import ProductsGrid from "@/components/ProductGrid";
import BackToTop from "@/components/BackToTopButton";

export default function Home() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1b3c35] dark:text-white mb-4">
            Featured Products
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Discover our curated selection of premium beauty
          </p>
        </div>

        <ProductsGrid limitCount={8} showFilters={false} />
      </div>

      <BackToTop />
    </section>
  );
}
