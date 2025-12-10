import ClientNavbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTopButton";

export default function Home() {
  return (
    <div className="">
      <ClientNavbar />
      <main className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-4xl font-bold mb-4 text-gray-800 dark:text-gray-200">
          Welcome to Hayate Cosmetics
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Discover premium skincare, fragrance, and beauty accessories for every
          skin type.
        </p>
      </main>

      {/* Footer can be added here if needed */}
      <Footer />

      <BackToTop />
    </div>
  );
}
