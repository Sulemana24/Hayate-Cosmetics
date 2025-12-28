import ProductCard from "@/components/ProductCard";
import CategoryHeader from "@/components/category/CategoryHeader";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { Product } from "@/types/product";
import Image1 from "@/public/images/skinbg.jpg";

async function getSkincareProducts() {
  try {
    const productsRef = collection(db, "products");
    const q = query(
      productsRef,
      where("categorySlug", "==", "skincare"),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);

    const products: Product[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Product[];

    return products;
  } catch (error) {
    console.error("Error fetching skincare products:", error);
    return [];
  }
}

const skincareSubcategories = [
  { id: 1, name: "Cleansers", count: "12 Products" },
  { id: 2, name: "Moisturizers", count: "15 Products" },
  { id: 3, name: "Serums", count: "8 Products" },
  { id: 4, name: "Sunscreen", count: "4 Products" },
  { id: 5, name: "Masks", count: "6 Products" },
];

export default async function SkincarePage() {
  const products = await getSkincareProducts();

  return (
    <>
      <CategoryHeader
        title="Skincare Collection"
        subtitle="Glowing Skin Essentials"
        description="Discover our organic, cruelty-free skincare products for radiant, healthy skin. Formulated with natural ingredients for all skin types."
        category="skincare"
        primaryColor="from-[#e39a89] to-[#d87a6a]"
        backgroundImage={Image1}
      />

      {/* Quick Stats */}
      <section className="py-8 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4">
              <div className="text-2xl font-bold text-[#d87a6a] mb-1">45+</div>
              <div className="text-sm text-gray-600">Products</div>
            </div>
            <div className="text-center p-4">
              <div className="text-2xl font-bold text-[#d87a6a] mb-1">100%</div>
              <div className="text-sm text-gray-600">Cruelty-Free</div>
            </div>
            <div className="text-center p-4">
              <div className="text-2xl font-bold text-[#d87a6a] mb-1">
                Organic
              </div>
              <div className="text-sm text-gray-600">Ingredients</div>
            </div>
            <div className="text-center p-4">
              <div className="text-2xl font-bold text-[#d87a6a] mb-1">
                Dermatologist
              </div>
              <div className="text-sm text-gray-600">Tested</div>
            </div>
          </div>
        </div>
      </section>

      {/* Subcategories */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Shop by Type
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {skincareSubcategories.map((subcat) => (
              <a
                key={subcat.id}
                href={`#${subcat.name.toLowerCase()}`}
                className="group p-4 rounded-xl bg-gray-50 hover:bg-gradient-to-r hover:from-[#e39a89] hover:to-[#d87a6a] transition-all duration-300 transform hover:-translate-y-1"
              >
                <h3 className="font-semibold text-gray-800 group-hover:text-white mb-1">
                  {subcat.name}
                </h3>
                <p className="text-sm text-gray-500 group-hover:text-white/80">
                  {subcat.count}
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
            <h2 className="text-3xl font-bold text-white">
              All Skincare Products
            </h2>
            <span className="text-gray-500">{products.length} Products</span>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">
                No skincare products found.
              </p>
              <a
                href="/category/all"
                className="mt-4 inline-block text-[#e39a89] hover:text-[#d87a6a] font-semibold"
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

      {/* Skincare Tips */}
      <section className="py-16 bg-gradient-to-r from-[#faf7f5] to-white">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            Skincare Tips & Advice
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl shadow-lg transform hover:-translate-y-2 transition-all duration-300">
              <div className="w-12 h-12 rounded-full bg-[#e39a89]/10 flex items-center justify-center mb-4">
                <span className="text-2xl">🌿</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                Natural Ingredients
              </h3>
              <p className="text-gray-600">
                Our products use organic ingredients that work in harmony with
                your skin&apos;s natural processes.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg transform hover:-translate-y-2 transition-all duration-300">
              <div className="w-12 h-12 rounded-full bg-[#e39a89]/10 flex items-center justify-center mb-4">
                <span className="text-2xl">💧</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                Hydration First
              </h3>
              <p className="text-gray-600">
                Proper hydration is key to glowing skin. Layer products from
                thinnest to thickest consistency.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg transform hover:-translate-y-2 transition-all duration-300">
              <div className="w-12 h-12 rounded-full bg-[#e39a89]/10 flex items-center justify-center mb-4">
                <span className="text-2xl">☀️</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                Sun Protection
              </h3>
              <p className="text-gray-600">
                Always finish your morning routine with SPF to protect against
                UV damage and premature aging.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
