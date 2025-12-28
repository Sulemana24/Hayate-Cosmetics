import ProductCard from "@/components/ProductCard";
import CategoryHeader from "@/components/category/CategoryHeader";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { Product } from "@/types/product";
import Image7 from "@/public/images/mak.jpg";

async function getMakeupProducts() {
  try {
    const productsRef = collection(db, "products");
    const q = query(productsRef, where("category", "==", "makeup"));
    const snapshot = await getDocs(q);

    const products: Product[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Product[];

    return products;
  } catch (error) {
    console.error("Error fetching makeup products:", error);
    return [];
  }
}

const makeupCategories = [
  { id: 1, name: "Face", count: "20 Products", icon: "💄" },
  { id: 2, name: "Eyes", count: "18 Products", icon: "👁️" },
  { id: 3, name: "Lips", count: "12 Products", icon: "💋" },
  { id: 4, name: "Tools", count: "6 Products", icon: "🖌️" },
];

const makeupTypes = [
  { id: 1, name: "Foundation", color: "bg-orange-100 text-orange-800" },
  { id: 2, name: "Lipstick", color: "bg-red-100 text-red-800" },
  { id: 3, name: "Eyeshadow", color: "bg-purple-100 text-purple-800" },
  { id: 4, name: "Mascara", color: "bg-blue-100 text-blue-800" },
  { id: 5, name: "Blush", color: "bg-pink-100 text-pink-800" },
  { id: 6, name: "Concealer", color: "bg-yellow-100 text-yellow-800" },
];

export default async function MakeupPage() {
  const products = await getMakeupProducts();

  return (
    <>
      <CategoryHeader
        title="Makeup Collection"
        subtitle="Express Your Beauty"
        description="Professional makeup for every occasion. From everyday natural looks to glamorous evening styles, find everything you need."
        category="makeup"
        primaryColor="from-[#6a5acd] to-[#836fff]"
        backgroundImage={Image7}
      />

      {/* Quick Stats */}
      <section className="py-8 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4">
              <div className="text-2xl font-bold text-[#6a5acd] mb-1">56+</div>
              <div className="text-sm text-gray-600">Products</div>
            </div>
            <div className="text-center p-4">
              <div className="text-2xl font-bold text-[#6a5acd] mb-1">
                Cruelty
              </div>
              <div className="text-sm text-gray-600">Free</div>
            </div>
            <div className="text-center p-4">
              <div className="text-2xl font-bold text-[#6a5acd] mb-1">Long</div>
              <div className="text-sm text-gray-600">Wearing</div>
            </div>
            <div className="text-center p-4">
              <div className="text-2xl font-bold text-[#6a5acd] mb-1">
                All Skin
              </div>
              <div className="text-sm text-gray-600">Tones</div>
            </div>
          </div>
        </div>
      </section>

      {/* Makeup Categories */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Shop by Category
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {makeupCategories.map((category) => (
              <a
                key={category.id}
                href={`#${category.name.toLowerCase()}`}
                className="group p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-white hover:from-[#6a5acd] hover:to-[#836fff] transition-all duration-300 shadow-md hover:shadow-xl transform hover:-translate-y-2"
              >
                <div className="text-3xl mb-4 group-hover:text-white transform group-hover:scale-110 transition-transform">
                  {category.icon}
                </div>
                <h3 className="font-bold text-lg text-gray-800 group-hover:text-white mb-1">
                  {category.name}
                </h3>
                <p className="text-sm text-gray-500 group-hover:text-white/80">
                  {category.count}
                </p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Product Types Filter */}
      <section className="py-8 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            Filter by Type:
          </h3>
          <div className="flex flex-wrap gap-3">
            {makeupTypes.map((type) => (
              <button
                key={type.id}
                className={`px-4 py-2 rounded-full ${type.color} font-medium hover:opacity-90 transition-opacity transform hover:scale-105`}
              >
                {type.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section id="products" className="py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-white">
              All Makeup Products
            </h2>
            <span className="text-gray-500">{products.length} Products</span>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">No makeup products found.</p>
              <a
                href="/category/all"
                className="mt-4 inline-block text-[#6a5acd] hover:text-[#836fff] font-semibold"
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

      {/* Makeup Guide */}
      <section className="py-16 bg-gradient-to-r from-white to-gray-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-10 text-center">
              Makeup Application Guide
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center transform hover:-translate-y-2 transition-all duration-300">
                <div className="w-20 h-20 rounded-full bg-[#6a5acd]/10 flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl">1️⃣</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">
                  Prep Your Canvas
                </h3>
                <p className="text-gray-600">
                  Start with clean, moisturized skin. Use primer to create a
                  smooth base for longer-lasting makeup.
                </p>
              </div>

              <div className="text-center transform hover:-translate-y-2 transition-all duration-300">
                <div className="w-20 h-20 rounded-full bg-[#6a5acd]/10 flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl">2️⃣</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">
                  Build Your Look
                </h3>
                <p className="text-gray-600">
                  Apply foundation, then concealer. Build color with blush and
                  bronzer. Finish with eyes and lips.
                </p>
              </div>

              <div className="text-center transform hover:-translate-y-2 transition-all duration-300">
                <div className="w-20 h-20 rounded-full bg-[#6a5acd]/10 flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl">3️⃣</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">
                  Set & Seal
                </h3>
                <p className="text-gray-600">
                  Use setting powder for a matte finish or setting spray for a
                  dewy look. This ensures all-day wear.
                </p>
              </div>
            </div>

            <div className="mt-12 bg-white rounded-2xl p-8 shadow-lg transform hover:-translate-y-1 transition-all duration-300">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                Pro Tips
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="transform hover:-translate-y-1 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-[#6a5acd]/10 flex items-center justify-center">
                      <span>💡</span>
                    </div>
                    <h4 className="font-bold text-gray-700">Blending is Key</h4>
                  </div>
                  <p className="text-gray-600 text-sm">
                    Always blend edges of foundation, concealer, and eyeshadow
                    for a seamless, professional finish.
                  </p>
                </div>
                <div className="transform hover:-translate-y-1 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-[#6a5acd]/10 flex items-center justify-center">
                      <span>💡</span>
                    </div>
                    <h4 className="font-bold text-gray-700">Less is More</h4>
                  </div>
                  <p className="text-gray-600 text-sm">
                    Start with a small amount of product and build up. It&apos;s
                    easier to add more than to remove excess.
                  </p>
                </div>
                <div className="transform hover:-translate-y-1 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-[#6a5acd]/10 flex items-center justify-center">
                      <span>💡</span>
                    </div>
                    <h4 className="font-bold text-gray-700">
                      Match Your Undertone
                    </h4>
                  </div>
                  <p className="text-gray-600 text-sm">
                    Identify if you have warm, cool, or neutral undertones to
                    choose the most flattering shades.
                  </p>
                </div>
                <div className="transform hover:-translate-y-1 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-[#6a5acd]/10 flex items-center justify-center">
                      <span>💡</span>
                    </div>
                    <h4 className="font-bold text-gray-700">
                      Clean Your Tools
                    </h4>
                  </div>
                  <p className="text-gray-600 text-sm">
                    Regularly clean brushes and sponges to prevent bacteria
                    buildup and ensure smooth application.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
