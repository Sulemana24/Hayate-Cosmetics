import Link from "next/link";
import Image from "next/image";
import {
  FiInstagram,
  FiTwitter,
  FiYoutube,
  FiMail,
  FiPhone,
  FiMapPin,
} from "react-icons/fi";
import { FaTiktok, FaWhatsapp } from "react-icons/fa";

import Logo from "@/public/images/comlogo.png";

export default function ClientFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-b from-[#0f2c26] to-[#1b3c35] text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="relative w-14 h-14">
                <Image
                  src={Logo}
                  alt="Hayate Cosmetics"
                  width={56}
                  height={56}
                  className="object-contain"
                />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Hayate Cosmetics</h2>
                <p className="text-white/70 text-sm">
                  Premium Beauty & Wellness
                </p>
              </div>
            </div>
            <p className="text-white/70 mb-8 max-w-md">
              We are committed to providing premium beauty products that enhance
              your natural glow while promoting sustainable and ethical
              practices.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <FiPhone className="w-5 h-5 text-[#e39a89]" />
                <span className="text-white/80">(233) 53-384-2202</span>
              </div>
              <div className="flex items-center gap-3">
                <FiMail className="w-5 h-5 text-[#e39a89]" />
                <span className="text-white/80">yussifhayate10@icloud.com</span>
              </div>
              <div className="flex items-start gap-3">
                <FiMapPin className="w-5 h-5 text-[#e39a89] mt-1" />
                <span className="text-white/80">
                  Tafo
                  <br />
                  Kumasi, Ghana
                </span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6 pb-2 border-b border-white/10">
              Shop
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/category/skincare"
                  className="text-white/70 hover:text-[#e39a89] transition-colors duration-200"
                >
                  Skincare
                </Link>
              </li>
              <li>
                <Link
                  href="/category/fragrance"
                  className="text-white/70 hover:text-[#e39a89] transition-colors duration-200"
                >
                  Fragrance
                </Link>
              </li>
              <li>
                <Link
                  href="/category/accessories"
                  className="text-white/70 hover:text-[#e39a89] transition-colors duration-200"
                >
                  Accessories
                </Link>
              </li>

              <li>
                <Link
                  href="/new-arrivals"
                  className="text-white/70 hover:text-[#e39a89] transition-colors duration-200"
                >
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link
                  href="/best-sellers"
                  className="text-white/70 hover:text-[#e39a89] transition-colors duration-200"
                >
                  Best Sellers
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-lg font-semibold mb-6 pb-2 border-b border-white/10">
              Company
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/about"
                  className="text-white/70 hover:text-[#e39a89] transition-colors duration-200"
                >
                  About Us
                </Link>
              </li>

              <li>
                <Link
                  href="/careers"
                  className="text-white/70 hover:text-[#e39a89] transition-colors duration-200"
                >
                  Careers
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-6 pb-2 border-b border-white/10">
              Support
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/contact"
                  className="text-white/70 hover:text-[#e39a89] transition-colors duration-200"
                >
                  Contact Us
                </Link>
              </li>

              <li>
                <Link
                  href="/privacy"
                  className="text-white/70 hover:text-[#e39a89] transition-colors duration-200"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-white/70 hover:text-[#e39a89] transition-colors duration-200"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Top Section - Newsletter & Social */}
      <div className="border-b border-white/10">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Newsletter */}
            <div>
              <h3 className="text-2xl font-bold mb-4">
                Join Our Beauty Insider Club
              </h3>
              <p className="text-white/70 mb-6">
                Be the first to know about new arrivals, exclusive offers, and
                beauty tips from our experts.
              </p>
              <form className="flex flex-col sm:flex-row gap-3 max-w-lg">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="flex-1 px-6 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#e39a89]/30 focus:border-[#e39a89] transition-all"
                  required
                />
                <button
                  type="submit"
                  className="bg-gradient-to-r from-[#e39a89] to-[#d87a6a] text-white px-8 py-3 rounded-xl font-medium hover:opacity-90 transition-opacity whitespace-nowrap"
                >
                  Subscribe
                </button>
              </form>
              <p className="text-xs text-white/50 mt-3">
                By subscribing, you agree to our Privacy Policy and consent to
                receive updates.
              </p>
            </div>

            {/* Social Links */}
            <div className="lg:text-right">
              <div className="flex flex-wrap gap-4 justify-center lg:justify-end">
                <a
                  href="https://wa.me/233XXXXXXXXX?text=Hello%20Hayate%20Cosmetics%20👋%0AI%20want%20to%20place%20an%20order"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-full bg-white/10 hover:bg-[#e39a89] flex items-center justify-center transition-all duration-300 group"
                  aria-label="WhatsApp"
                >
                  <FaWhatsapp className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </a>
                <a
                  href="https://www.tiktok.com/@queen.hayate?_r=1&_t=ZM-92AAnaEEMxw"
                  className="w-12 h-12 rounded-full bg-white/10 hover:bg-[#e39a89] flex items-center justify-center transition-all duration-300 group"
                  aria-label="TikTok"
                  target="_blank"
                >
                  <FaTiktok className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </a>
                <a
                  href="#"
                  className="w-12 h-12 rounded-full bg-white/10 hover:bg-[#e39a89] flex items-center justify-center transition-all duration-300 group"
                  aria-label="YouTube"
                >
                  <FiYoutube className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <p className="text-white/60 text-sm">
                © {currentYear} Hayate Cosmetics. All rights reserved.
              </p>
              <p className="text-white/60 text-sm">
                Developed by Simdi Technologies
              </p>
            </div>
          </div>
          <div className="mt-4 text-center">
            <p className="text-xs text-white/40">
              Hayate Cosmetics is a registered trademark. All product names,
              logos, and brands are property of their respective owners.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
