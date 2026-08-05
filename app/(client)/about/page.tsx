import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import {
  FiHeart,
  FiAward,
  FiUsers,
  FiTruck,
  FiShield,
  FiStar,
  FiGlobe,
  FiArrowRight,
  FiSmile,
  FiPackage,
  FiTrendingUp,
} from "react-icons/fi";
import { FaLeaf } from "react-icons/fa";

export const metadata = {
  title: "About Us | Hayate Cosmetics",
  description:
    "Learn about Hayate Cosmetics - our story, mission, and commitment to providing premium beauty products. Discover our journey in the beauty industry.",
};

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] uppercase text-[#8FA593] dark:text-[#a9c2ae] mb-3">
      <span className="h-px w-6 bg-[#8FA593] dark:bg-[#a9c2ae]" />
      {children}
    </span>
  );
}

function LeafDivider() {
  return (
    <div className="flex items-center justify-center py-2" aria-hidden="true">
      <div className="h-px w-16 bg-[#1b3c35]/15 dark:bg-white/10" />
      <svg
        width="18"
        height="18"
        viewBox="0 0 18 18"
        fill="none"
        className="mx-3 text-[#8FA593] dark:text-[#a9c2ae]"
      >
        <path
          d="M9 1C9 1 3 5 3 10a6 6 0 0012 0c0-5-6-9-6-9z"
          stroke="currentColor"
          strokeWidth="1.3"
        />
        <path d="M9 4v11" stroke="currentColor" strokeWidth="1.3" />
      </svg>
      <div className="h-px w-16 bg-[#1b3c35]/15 dark:bg-white/10" />
    </div>
  );
}

// Fetch total registered users from Firebase Authentication
async function getTotalUsers() {
  try {
    // Try to get users from Firebase Auth (server-side)
    const listUsersResult = await adminAuth.listUsers(1000);
    const authUserCount = listUsersResult.users.length;

    // Also check the users collection in Firestore
    const usersRef = adminDb.collection("users");
    const snapshot = await usersRef.get();
    const firestoreUserCount = snapshot.size;

    // Use the larger count (Auth users are the actual registered users)
    // The Firestore users collection might have additional user data
    const totalUsers = Math.max(authUserCount, firestoreUserCount);

    return totalUsers;
  } catch (error) {
    console.error("Error fetching users:", error);

    // Fallback: Try to get from Firestore users collection only
    try {
      const usersRef = collection(db, "users");
      const snapshot = await getDocs(usersRef);
      return snapshot.size;
    } catch (fallbackError) {
      console.error("Fallback error fetching users:", fallbackError);
      return 0;
    }
  }
}

export default async function AboutPage() {
  const totalUsers = await getTotalUsers();
  // Start from 100+ and add the actual registered users
  const happyCustomers = 100 + totalUsers;

  // Static stats (these remain hardcoded)
  const productsSold = 100;
  const brandsPartnered = 50;
  const averageRating = 4.8;

  return (
    <div className="min-h-screen bg-[#FBF6EF] dark:bg-[#0f1e1a]">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#1b3c35] py-20 md:py-28">
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
          aria-hidden="true"
        />

        <div className="absolute top-[-200px] right-[-200px] w-[500px] h-[500px] rounded-full bg-[#E39A89]/10" />
        <div className="absolute bottom-[-200px] left-[-200px] w-[500px] h-[500px] rounded-full bg-[#8FA593]/10" />

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-3xl">
            <SectionEyebrow>About Us</SectionEyebrow>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-6">
              Crafting Beauty with
              <span className="text-[#E39A89]"> Purpose</span>
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-2xl">
              At Hayate Cosmetics, we believe beauty is more than skin deep.
              We&apos;re committed to bringing you premium products that enhance
              your natural radiance while caring for the world we share.
            </p>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <SectionEyebrow>Our Story</SectionEyebrow>
              <h2 className="text-3xl md:text-4xl font-bold text-[#1b3c35] dark:text-white tracking-tight mb-6">
                A Journey of Beauty and
                <span className="text-[#E39A89]"> Passion</span>
              </h2>
              <div className="space-y-4 text-[#26261F]/80 dark:text-white/70">
                <p>
                  Hayate Cosmetics was born from a simple but powerful vision:
                  to make premium beauty products accessible to everyone. What
                  started as a small passion project has grown into a trusted
                  name in the beauty industry.
                </p>
                <p>
                  Our journey began with a commitment to quality and a deep
                  understanding of what modern beauty enthusiasts truly need.
                  We&apos;ve traveled the globe, sourcing the finest ingredients
                  and learning from the best in the industry to bring you
                  products that deliver real results.
                </p>
                <p>
                  Today, Hayate Cosmetics stands as a symbol of quality,
                  authenticity, and innovation. We continue to evolve, always
                  staying true to our core values while embracing new
                  possibilities in beauty.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <div className="aspect-[4/3] bg-[#8FA593]/15 flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="text-6xl md:text-7xl mb-4">
                      <Image
                        src="/images/favicon.png"
                        alt="Hayate Yussif"
                        width={150}
                        height={150}
                        className="rounded-full"
                      />
                    </div>
                    <p className="text-lg font-semibold text-[#1b3c35] dark:text-white">
                      Beauty with Purpose
                    </p>
                    <p className="text-sm text-[#26261F]/60 dark:text-white/60">
                      Since 2024
                    </p>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-[#E39A89]/20 rounded-full blur-2xl -z-10" />
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-[#8FA593]/20 rounded-full blur-2xl -z-10" />
            </div>
          </div>
        </div>
      </section>

      <LeafDivider />

      {/* Mission & Vision */}
      <section className="py-16 md:py-24 bg-white dark:bg-[#16302a]">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <SectionEyebrow>Our Purpose</SectionEyebrow>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1b3c35] dark:text-white tracking-tight mb-4">
              Mission &amp; Vision
            </h2>
            <p className="text-[#26261F]/60 dark:text-white/60">
              Everything we do is guided by our commitment to you and the world
              we share
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-[#FBF6EF] dark:bg-[#0f1e1a] p-8 rounded-2xl ring-1 ring-[#1b3c35]/10 dark:ring-white/10">
              <div className="w-14 h-14 rounded-full bg-[#E39A89]/15 flex items-center justify-center mb-5">
                <FiHeart className="w-7 h-7 text-[#E39A89]" />
              </div>
              <h3 className="text-xl font-bold text-[#1b3c35] dark:text-white mb-3">
                Our Mission
              </h3>
              <p className="text-[#26261F]/70 dark:text-white/70">
                To empower individuals to look and feel their best by providing
                premium, accessible beauty products that are ethically sourced,
                sustainably produced, and designed to enhance natural beauty.
              </p>
            </div>

            <div className="bg-[#FBF6EF] dark:bg-[#0f1e1a] p-8 rounded-2xl ring-1 ring-[#1b3c35]/10 dark:ring-white/10">
              <div className="w-14 h-14 rounded-full bg-[#8FA593]/15 flex items-center justify-center mb-5">
                <FiGlobe className="w-7 h-7 text-[#8FA593]" />
              </div>
              <h3 className="text-xl font-bold text-[#1b3c35] dark:text-white mb-3">
                Our Vision
              </h3>
              <p className="text-[#26261F]/70 dark:text-white/70">
                To become Africa&apos;s most trusted beauty destination, known
                for quality, authenticity, and a commitment to making beauty
                accessible to everyone while championing sustainability and
                ethical practices.
              </p>
            </div>
          </div>

          {/* Core Values */}
          <div className="mt-12">
            <h3 className="text-2xl font-bold text-[#1b3c35] dark:text-white text-center mb-8">
              Our Core Values
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              <div className="text-center p-6 bg-[#FBF6EF] dark:bg-[#0f1e1a] rounded-xl ring-1 ring-[#1b3c35]/10 dark:ring-white/10">
                <div className="w-12 h-12 rounded-full bg-[#E39A89]/10 flex items-center justify-center mx-auto mb-3">
                  <FiAward className="w-6 h-6 text-[#E39A89]" />
                </div>
                <h4 className="font-semibold text-[#1b3c35] dark:text-white">
                  Quality
                </h4>
                <p className="text-xs text-[#26261F]/60 dark:text-white/60 mt-1">
                  Premium products
                </p>
              </div>

              <div className="text-center p-6 bg-[#FBF6EF] dark:bg-[#0f1e1a] rounded-xl ring-1 ring-[#1b3c35]/10 dark:ring-white/10">
                <div className="w-12 h-12 rounded-full bg-[#8FA593]/10 flex items-center justify-center mx-auto mb-3">
                  <FiUsers className="w-6 h-6 text-[#8FA593]" />
                </div>
                <h4 className="font-semibold text-[#1b3c35] dark:text-white">
                  Community
                </h4>
                <p className="text-xs text-[#26261F]/60 dark:text-white/60 mt-1">
                  Customer first
                </p>
              </div>

              <div className="text-center p-6 bg-[#FBF6EF] dark:bg-[#0f1e1a] rounded-xl ring-1 ring-[#1b3c35]/10 dark:ring-white/10">
                <div className="w-12 h-12 rounded-full bg-[#1b3c35]/10 flex items-center justify-center mx-auto mb-3">
                  <FaLeaf className="w-6 h-6 text-[#1b3c35]" />
                </div>
                <h4 className="font-semibold text-[#1b3c35] dark:text-white">
                  Sustainability
                </h4>
                <p className="text-xs text-[#26261F]/60 dark:text-white/60 mt-1">
                  Eco-friendly
                </p>
              </div>

              <div className="text-center p-6 bg-[#FBF6EF] dark:bg-[#0f1e1a] rounded-xl ring-1 ring-[#1b3c35]/10 dark:ring-white/10">
                <div className="w-12 h-12 rounded-full bg-[#E39A89]/10 flex items-center justify-center mx-auto mb-3">
                  <FiTrendingUp className="w-6 h-6 text-[#E39A89]" />
                </div>
                <h4 className="font-semibold text-[#1b3c35] dark:text-white">
                  Innovation
                </h4>
                <p className="text-xs text-[#26261F]/60 dark:text-white/60 mt-1">
                  Always evolving
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <LeafDivider />

      {/* Why Choose Us */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <SectionEyebrow>Why Choose Us</SectionEyebrow>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1b3c35] dark:text-white tracking-tight mb-4">
              Why Shop With Hayate?
            </h2>
            <p className="text-[#26261F]/60 dark:text-white/60">
              We&apos;re committed to providing the best beauty shopping
              experience in Ghana
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-[#16302a] p-6 rounded-2xl ring-1 ring-black/5 dark:ring-white/5 text-center transform hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 rounded-full bg-[#E39A89]/15 flex items-center justify-center mx-auto mb-4">
                <FiTruck className="w-8 h-8 text-[#E39A89]" />
              </div>
              <h3 className="text-lg font-bold text-[#1b3c35] dark:text-white mb-2">
                Fast Delivery
              </h3>
              <p className="text-sm text-[#26261F]/60 dark:text-white/60">
                Nationwide delivery across Ghana. Get your beauty products
                delivered to your doorstep.
              </p>
            </div>

            <div className="bg-white dark:bg-[#16302a] p-6 rounded-2xl ring-1 ring-black/5 dark:ring-white/5 text-center transform hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 rounded-full bg-[#1b3c35]/10 flex items-center justify-center mx-auto mb-4">
                <FiShield className="w-8 h-8 text-[#1b3c35]" />
              </div>
              <h3 className="text-lg font-bold text-[#1b3c35] dark:text-white mb-2">
                Authentic Products
              </h3>
              <p className="text-sm text-[#26261F]/60 dark:text-white/60">
                100% genuine products with quality guarantee. We source directly
                from trusted brands.
              </p>
            </div>

            <div className="bg-white dark:bg-[#16302a] p-6 rounded-2xl ring-1 ring-black/5 dark:ring-white/5 text-center transform hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 rounded-full bg-[#8FA593]/15 flex items-center justify-center mx-auto mb-4">
                <FiSmile className="w-8 h-8 text-[#8FA593]" />
              </div>
              <h3 className="text-lg font-bold text-[#1b3c35] dark:text-white mb-2">
                Customer Support
              </h3>
              <p className="text-sm text-[#26261F]/60 dark:text-white/60">
                Our team is here to help. Contact us for product recommendations
                or any questions.
              </p>
            </div>

            <div className="bg-white dark:bg-[#16302a] p-6 rounded-2xl ring-1 ring-black/5 dark:ring-white/5 text-center transform hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 rounded-full bg-[#E39A89]/15 flex items-center justify-center mx-auto mb-4">
                <FiPackage className="w-8 h-8 text-[#E39A89]" />
              </div>
              <h3 className="text-lg font-bold text-[#1b3c35] dark:text-white mb-2">
                Premium Quality
              </h3>
              <p className="text-sm text-[#26261F]/60 dark:text-white/60">
                We carefully curate our collection to bring you only the finest
                beauty products available.
              </p>
            </div>
          </div>
        </div>
      </section>

      <LeafDivider />

      {/* Stats Section */}
      <section className="py-16 md:py-24 bg-[#1b3c35]">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-[#E39A89] mb-2">
                {happyCustomers}+
              </div>
              <p className="text-white/60 text-sm">Happy Customers</p>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-[#E39A89] mb-2">
                {productsSold}+
              </div>
              <p className="text-white/60 text-sm">Products Sold</p>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-[#E39A89] mb-2">
                {brandsPartnered}+
              </div>
              <p className="text-white/60 text-sm">Brands Partnered</p>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-[#E39A89] mb-2">
                {averageRating}
              </div>
              <p className="text-white/60 text-sm">Average Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 md:py-24 bg-white dark:bg-[#16302a]">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <SectionEyebrow>Meet Our Team</SectionEyebrow>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1b3c35] dark:text-white tracking-tight mb-4">
              The Faces Behind Hayate
            </h2>
            <p className="text-[#26261F]/60 dark:text-white/60">
              Passionate individuals dedicated to bringing you the best beauty
              experience
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Team Member 1 */}
            <div className="text-center">
              <div className="w-32 h-32 rounded-full bg-[#E39A89]/15 mx-auto mb-4 flex items-center justify-center">
                <div className="text-5xl">
                  <Image
                    src="/images/favicon.png"
                    alt="Hayate Yussif"
                    width={120}
                    height={120}
                    className="rounded-full"
                  />
                </div>
              </div>
              <h4 className="text-lg font-bold text-[#1b3c35] dark:text-white">
                Hayate Yussif
              </h4>
              <p className="text-sm text-[#E39A89] font-medium">
                Founder &amp; CEO
              </p>
              <p className="text-sm text-[#26261F]/60 dark:text-white/60 mt-2">
                Passionate about beauty and wellness, Hayate founded Hayate
                Cosmetics to bring premium products to Ghana.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-[#1b3c35]">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">
              Join the Hayate Beauty Community
            </h2>
            <p className="text-white/70 text-lg mb-8">
              Discover the latest beauty trends, exclusive offers, and product
              launches. Be part of a community that celebrates beauty in all its
              forms.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/category/all"
                className="inline-flex items-center justify-center gap-2 bg-[#E39A89] hover:bg-[#d9866f] text-white px-8 py-3 rounded-xl font-semibold transition-colors shadow-lg"
              >
                Shop Now
                <FiArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 backdrop-blur-sm text-white border border-white/20 px-8 py-3 rounded-xl font-semibold transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
