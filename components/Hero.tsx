"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  FiChevronLeft,
  FiChevronRight,
  FiShoppingBag,
  FiTag,
  FiTruck,
  FiShield,
  FiRefreshCw,
  FiHeart,
} from "react-icons/fi";
import Image1 from "../public/images/skinbg.jpg";
import Image2 from "../public/images/accbg.jpg";
import Image3 from "../public/images/perbg.jpg";
import Image4 from "../public/images/catb.jpg";
import Image5 from "../public/images/catp.jpg";
import Image6 from "../public/images/catcos.jpg";
import Image7 from "../public/images/mak.jpg";
import {
  collection,
  getDocs,
  limit,
  query,
  doc,
  setDoc,
  deleteDoc,
  getDoc,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getAuth } from "firebase/auth";
import ProductCard from "@/components/ProductCard";
import { Product } from "@/types/product";

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [allTrending, setAllTrending] = useState<Product[]>([]);
  const [visibleCount, setVisibleCount] = useState(3);
  const [loadingTrending, setLoadingTrending] = useState(true);
  const [favorites, setFavorites] = useState<{ [key: string]: boolean }>({});
  const [loadingFavs, setLoadingFavs] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>(
    {}
  );

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUserId(user.uid);
      } else {
        setCurrentUserId(null);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchCategoryCounts = async () => {
      try {
        const categoriesToCheck = [
          "Skincare",
          "Fragrance",
          "Accessories",
          "Makeup",
        ];
        const counts: Record<string, number> = {};

        for (const cat of categoriesToCheck) {
          const q = query(
            collection(db, "products"),
            where("category", "==", cat)
          );
          const snapshot = await getDocs(q);
          counts[cat] = snapshot.size;
        }

        setCategoryCounts(counts);
      } catch (error) {
        console.error("Error fetching category counts:", error);
      }
    };

    fetchCategoryCounts();
  }, []);

  const slides = [
    {
      id: 1,
      title: "Premium Skincare Collection",
      subtitle: "Glowing Skin Essentials",
      description:
        "Discover our organic, cruelty-free skincare products for radiant, healthy skin.",
      image: Image1,
      buttonText: "Shop Skincare",
      buttonLink: "/category/skincare",
      color: "from-[#e39a89] to-[#d87a6a]",
      textColor: "text-white",
    },
    {
      id: 2,
      title: "Luxury Fragrances",
      subtitle: "Signature Scents",
      description:
        "Elevate your presence with our exclusive collection of premium perfumes.",
      image: Image3,
      buttonText: "Shop Fragrances",
      buttonLink: "/category/fragrance",
      color: "from-[#1b3c35] to-[#2a4d45]",
      textColor: "text-white",
    },
    {
      id: 3,
      title: "Elegant Accessories",
      subtitle: "Complete Your Look",
      description:
        "Stylish sunglasses, delicate jewelry, and fashion accessories for every occasion.",
      image: Image2,
      buttonText: "Shop Accessories",
      buttonLink: "/category/accessories",
      color: "from-[#f8b195] to-[#f67280]",
      textColor: "text-white",
    },
  ];

  const features = [
    {
      icon: <FiTruck className="w-6 h-6" />,
      title: "Nationwide Delivery",
      description: "Delivered to your doorstep, anywhere in Ghana",
    },
    {
      icon: <FiShield className="w-6 h-6" />,
      title: "Secure Payment",
      description: "100% secure transactions",
    },
    {
      icon: <FiRefreshCw className="w-6 h-6" />,
      title: "Quality Guarantee",
      description: "We sell only authentic products",
    },
    {
      icon: <FiTag className="w-6 h-6" />,
      title: "Best Price",
      description: "Value for money",
    },
  ];

  const categories = [
    {
      id: 1,
      name: "Skincare",
      image: Image6,
      count: `${categoryCounts["Skincare"] ?? 0} Products`,
      link: "/category/skincare",
    },
    {
      id: 2,
      name: "Fragrance",
      image: Image5,
      count: `${categoryCounts["Fragrance"] ?? 0} Products`,
      link: "/category/fragrance",
    },
    {
      id: 3,
      name: "Accessories",
      image: Image4,
      count: `${categoryCounts["Accessories"] ?? 0} Products`,
      link: "/category/accessories",
    },
    {
      id: 4,
      name: "Makeup",
      image: Image7,
      count: `${categoryCounts["Makeup"] ?? 0} Products`,
      link: "/category/makeup",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  useEffect(() => {
    const fetchTrendingProducts = async () => {
      try {
        const q = query(collection(db, "products"), limit(30));
        const snapshot = await getDocs(q);

        const products: Product[] = snapshot.docs.map((doc) => {
          const { id, ...rest } = doc.data() as Product;

          return {
            id: doc.id,
            ...rest,
          };
        });

        const shuffled = products.sort(() => 0.5 - Math.random());

        setAllTrending(shuffled);
      } catch (error) {
        console.error("Error fetching trending products:", error);
      } finally {
        setLoadingTrending(false);
      }
    };

    fetchTrendingProducts();
  }, []);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!currentUserId) return;
      const favs: { [key: string]: boolean } = {};
      for (const product of allTrending) {
        try {
          const favRef = doc(
            db,
            "users",
            currentUserId,
            "favorites",
            product.id
          );
          const favSnap = await getDoc(favRef);
          if (favSnap.exists()) favs[product.id] = true;
        } catch (error) {
          console.error("Error fetching favorite:", error);
        }
      }
      setFavorites(favs);
    };
    fetchFavorites();
  }, [allTrending, currentUserId]);

  const toggleFavorite = async (product: Product) => {
    if (!currentUserId) {
      alert("You must be logged in to add favorites");
      return;
    }
    const nextState = !favorites[product.id];
    setFavorites({ ...favorites, [product.id]: nextState });
    setLoadingFavs({ ...loadingFavs, [product.id]: true });

    const favRef = doc(db, "users", currentUserId, "favorites", product.id);

    try {
      if (nextState) {
        await setDoc(favRef, {
          productId: product.id,
          name: product.name,
          imageUrl: product.imageUrl,
          price: product.discountedPrice,
          category: product.category,
          addedAt: serverTimestamp(),
        });
      } else {
        await deleteDoc(favRef);
      }
    } catch (error) {
      console.error("Failed to update favorite:", error);
      setFavorites({ ...favorites, [product.id]: !nextState });
      alert("Failed to update favorite. Try again.");
    } finally {
      setLoadingFavs({ ...loadingFavs, [product.id]: false });
    }
  };

  return (
    <div className="bg-gradient-to-b from-[#faf7f5] to-white">
      {/* Hero Carousel */}
      <section className="relative overflow-hidden">
        <div className="relative h-[600px] md:h-[700px]">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-5000 ${
                index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
            >
              {/* Background Image */}
              <div className="absolute inset-0">
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  priority={index === currentSlide}
                  className="object-cover"
                />

                <div
                  className={`absolute inset-0 bg-gradient-to-r ${slide.color} opacity-50`}
                ></div>
                <div className="absolute inset-0 bg-black/20"></div>
              </div>

              <div className="container mx-auto px-4 md:px-6 h-full flex items-center">
                <div className="max-w-2xl relative z-20">
                  <span className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium text-white mb-4">
                    {slide.subtitle}
                  </span>
                  <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                    <span className={slide.textColor}>{slide.title}</span>
                  </h1>
                  <p
                    className={`text-lg md:text-xl mb-8 max-w-xl ${slide.textColor} opacity-90`}
                  >
                    {slide.description}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link
                      href={slide.buttonLink}
                      className="inline-flex items-center justify-center gap-2 bg-white text-[#1b3c35] hover:bg-gray-50 px-8 py-3 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 shadow-lg"
                    >
                      <FiShoppingBag className="w-5 h-5" />
                      {slide.buttonText}
                    </Link>
                    <Link
                      href="/category/all"
                      className="inline-flex items-center justify-center gap-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-2 border-white/30 px-8 py-3 rounded-xl font-semibold text-lg transition-all duration-300"
                    >
                      Browse All
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Carousel Controls */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-all duration-300"
          aria-label="Previous slide"
        >
          <FiChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-all duration-300"
          aria-label="Next slide"
        >
          <FiChevronRight className="w-6 h-6" />
        </button>

        {/* Carousel Dots */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide ? "bg-white w-8" : "bg-white/50"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex flex-col items-center text-center p-6 rounded-2xl hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-b from-gray-50 to-white border border-gray-100"
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#e39a89] to-[#d87a6a] flex items-center justify-center text-white mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Shop by Category
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover our curated collections designed to bring out your best
              self
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={category.link}
                className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500"
              >
                {/* Category Image */}
                <div className="relative h-64 md:h-80 bg-cover bg-center group-hover:scale-110 transition-transform duration-700">
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent z-10"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-[#e39a89]/20 to-[#d87a6a]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="absolute inset-0 flex items-end p-6 z-20">
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">
                        {category.name}
                      </h3>
                      <p className="text-white/90">{category.count}</p>
                    </div>
                  </div>
                </div>
                <div className="absolute top-4 right-4 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full">
                  <span className="text-white text-sm font-medium">
                    Explore
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Products */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                Trending Products
              </h2>
              <p className="text-gray-600">
                Discover what everyone is loving right now
              </p>
            </div>

            <button
              onClick={() => setVisibleCount(13)}
              className="mt-4 md:mt-0 inline-flex items-center gap-2 text-[#e39a89] hover:text-[#d87a6a] font-semibold text-lg"
            >
              View All Trending
              <FiChevronRight className="w-5 h-5" />
            </button>
          </div>

          {loadingTrending ? (
            <p className="text-center text-gray-500">
              Loading trending products...
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {allTrending.slice(0, visibleCount).map((product) => {
                const isFav = favorites[product.id] || false;
                const isLoading = loadingFavs[product.id] || false;
                return (
                  <div key={product.id} className="relative">
                    <ProductCard
                      key={product.id}
                      product={product}
                      showActions={false}
                      userId={currentUserId}
                    />
                    {/* Favorite button overlay */}
                    <button
                      onClick={() => toggleFavorite(product)}
                      disabled={isLoading}
                      className="absolute top-3 right-3 z-20 p-2 rounded-lg bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm hover:scale-110 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label={
                        isFav ? "Remove from favorites" : "Add to favorites"
                      }
                    >
                      {isLoading ? (
                        <div className="w-4 h-4 border-2 border-[#e39a89] border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <FiHeart
                          className={`w-5 h-5 transition-all duration-300 ${
                            isFav
                              ? "text-red-500 fill-red-500 scale-110"
                              : "text-gray-600 dark:text-gray-400 hover:text-red-500"
                          }`}
                        />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
