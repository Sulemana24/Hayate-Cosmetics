import CategoryHeader from "@/components/category/CategoryHeader";
import SkincareProductsClient from "@/components/SkincareProductsClient";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { Product } from "@/types/product";
import Image1 from "@/public/images/skinbg.jpg";

interface SkincareSubcategory {
  id: number;
  name: string;
  count: string;
  slug: string;
}

// Fetch skincare products with real subcategory data
async function getSkincareProducts() {
  try {
    const productsRef = collection(db, "products");
    const q = query(
      productsRef,
      where("categorySlug", "==", "skincare"),
      orderBy("createdAt", "desc"),
    );
    const snapshot = await getDocs(q);

    const products: Product[] = snapshot.docs.map((doc) => {
      const data = doc.data();

      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toMillis ? data.createdAt.toMillis() : null,
        updatedAt: data.updatedAt?.toMillis ? data.updatedAt.toMillis() : null,
      } as Product;
    });

    return products;
  } catch (error) {
    console.error("Error fetching skincare products:", error);
    return [];
  }
}

// Fetch subcategories from actual products
async function getSkincareSubcategories(products: Product[]) {
  const subcategoryMap = new Map<string, number>();

  products.forEach((product) => {
    if (product.subCategory) {
      const count = subcategoryMap.get(product.subCategory) || 0;
      subcategoryMap.set(product.subCategory, count + 1);
    }
  });

  const subcategories: SkincareSubcategory[] = Array.from(
    subcategoryMap.entries(),
  )
    .map(([name, count], index) => ({
      id: index + 1,
      name,
      count: `${count} Product${count > 1 ? "s" : ""}`,
      slug: name.toLowerCase().replace(/\s+/g, "-"),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  // Add "All" category
  return [
    {
      id: 0,
      name: "All Products",
      count: `${products.length} Products`,
      slug: "all",
    },
    ...subcategories,
  ];
}

export default async function SkincarePage() {
  const products = await getSkincareProducts();
  const skincareSubcategories = await getSkincareSubcategories(products);

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
              <div className="text-2xl font-bold text-[#d87a6a] mb-1">60+</div>
              <div className="text-sm text-gray-600">Products</div>
            </div>
            <div className="text-center p-4">
              <div className="text-2xl font-bold text-[#d87a6a] mb-1">100%</div>
              <div className="text-sm text-gray-600">Cruelty-Free</div>
            </div>
            <div className="text-center p-4">
              <div className="text-2xl font-bold text-[#d87a6a] mb-1">100%</div>
              <div className="text-sm text-gray-600">Organic</div>
            </div>
            <div className="text-center p-4">
              <div className="text-2xl font-bold text-[#d87a6a] mb-1">100%</div>
              <div className="text-sm text-gray-600">Dermatologist Tested</div>
            </div>
          </div>
        </div>
      </section>

      {/* Products with Filters (Client Component) */}
      <SkincareProductsClient
        initialProducts={products}
        subcategories={skincareSubcategories}
      />
    </>
  );
}
