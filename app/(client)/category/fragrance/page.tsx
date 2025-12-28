import ProductCard from "@/components/ProductCard";
import CategoryHeader from "@/components/category/CategoryHeader";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { Product } from "@/types/product";
import Image3 from "@/public/images/perbg.jpg";

async function getFragranceProducts() {
  try {
    const productsRef = collection(db, "products");
    const q = query(productsRef, where("category", "==", "fragrance"));
    const snapshot = await getDocs(q);

    const products: Product[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Product[];

    return products;
  } catch (error) {
    console.error("Error fetching fragrance products:", error);
    return [];
  }
}

const fragranceTypes = [
  { id: 1, name: "Eau de Parfum", count: "18 Products" },
  { id: 2, name: "Eau de Toilette", count: "8 Products" },
  { id: 3, name: "Body Mists", count: "3 Products" },
  { id: 4, name: "Perfume Oils", count: "2 Products" },
  { id: 5, name: "Travel Size", count: "6 Products" },
];

const scentFamilies = [
  { id: 1, name: "Floral", color: "bg-pink-100 text-pink-800" },
  { id: 2, name: "Woody", color: "bg-amber-100 text-amber-800" },
  { id: 3, name: "Citrus", color: "bg-yellow-100 text-yellow-800" },
  { id: 4, name: "Oriental", color: "bg-purple-100 text-purple-800" },
  { id: 5, name: "Fresh", color: "bg-blue-100 text-blue-800" },
];

export default async function FragrancePage() {
  const products = await getFragranceProducts();

  return (
    <>
      <CategoryHeader
        title="Fragrance Collection"
        subtitle="Signature Scents"
        description="Elevate your presence with our exclusive collection of premium perfumes. Discover your signature scent from our curated selection."
        category="fragrance"
        primaryColor="from-[#1b3c35] to-[#2a4d45]"
        backgroundImage={Image3}
      />

      {/* Quick Stats */}
      <section className="py-8 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4">
              <div className="text-2xl font-bold text-[#1b3c35] mb-1">32+</div>
              <div className="text-sm text-gray-600">Scents</div>
            </div>
            <div className="text-center p-4">
              <div className="text-2xl font-bold text-[#1b3c35] mb-1">8-12</div>
              <div className="text-sm text-gray-600">Hours Lasting</div>
            </div>
            <div className="text-center p-4">
              <div className="text-2xl font-bold text-[#1b3c35] mb-1">
                Premium
              </div>
              <div className="text-sm text-gray-600">Concentration</div>
            </div>
            <div className="text-center p-4">
              <div className="text-2xl font-bold text-[#1b3c35] mb-1">
                Master
              </div>
              <div className="text-sm text-gray-600">Perfumers</div>
            </div>
          </div>
        </div>
      </section>

      {/* Scent Families */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Explore by Scent Family
          </h2>
          <div className="flex flex-wrap gap-3 mb-8">
            {scentFamilies.map((scent) => (
              <button
                key={scent.id}
                className={`px-4 py-2 rounded-full ${scent.color} font-medium hover:opacity-90 transition-opacity transform hover:scale-105`}
              >
                {scent.name}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {fragranceTypes.map((type) => (
              <a
                key={type.id}
                href={`#${type.name.toLowerCase().replace(/\s+/g, "-")}`}
                className="group p-4 rounded-xl bg-gray-50 hover:bg-gradient-to-r hover:from-[#1b3c35] hover:to-[#2a4d45] transition-all duration-300 transform hover:-translate-y-1"
              >
                <h3 className="font-semibold text-gray-800 group-hover:text-white mb-1">
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
            <h2 className="text-3xl font-bold text-white">All Fragrances</h2>
            <span className="text-gray-500">{products.length} Products</span>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">
                No fragrance products found.
              </p>
              <a
                href="/category/all"
                className="mt-4 inline-block text-[#179076] hover:text-[#225b4e] font-semibold"
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

      {/* Fragrance Guide */}
      <section className="py-16 bg-gradient-to-r from-gray-50 to-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">
              Find Your Signature Scent
            </h2>
            <p className="text-gray-600 mb-8">
              Not sure where to start? Here&apos;s a quick guide to help you
              find your perfect fragrance:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div className="bg-white p-6 rounded-xl shadow transform hover:-translate-y-1 transition-all duration-300">
                <div className="w-10 h-10 rounded-full bg-[#1b3c35]/10 flex items-center justify-center mb-4">
                  <span className="text-xl">🎵</span>
                </div>
                <h3 className="font-bold text-lg text-gray-800 mb-2">
                  1. Know Your Notes
                </h3>
                <p className="text-gray-600 text-sm">
                  Top notes are your first impression, heart notes develop after
                  10-15 minutes, base notes last the longest.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow transform hover:-translate-y-1 transition-all duration-300">
                <div className="w-10 h-10 rounded-full bg-[#1b3c35]/10 flex items-center justify-center mb-4">
                  <span className="text-xl">🎭</span>
                </div>
                <h3 className="font-bold text-lg text-gray-800 mb-2">
                  2. Consider the Occasion
                </h3>
                <p className="text-gray-600 text-sm">
                  Light scents for daytime, richer scents for evenings. Some
                  fragrances work better in specific seasons.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow transform hover:-translate-y-1 transition-all duration-300">
                <div className="w-10 h-10 rounded-full bg-[#1b3c35]/10 flex items-center justify-center mb-4">
                  <span className="text-xl">🧪</span>
                </div>
                <h3 className="font-bold text-lg text-gray-800 mb-2">
                  3. Test Properly
                </h3>
                <p className="text-gray-600 text-sm">
                  Always test on skin, not paper. Let it develop for at least 30
                  minutes before deciding.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
