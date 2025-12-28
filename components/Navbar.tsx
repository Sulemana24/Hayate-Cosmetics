"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import {
  FiUser,
  FiShoppingCart,
  FiMenu,
  FiX,
  FiChevronDown,
  FiHeart,
  FiSun,
  FiMoon,
} from "react-icons/fi";

import Logo from "@/public/images/comlogo.png";

export default function ClientNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoggedIn, cartItemsCount, favoritesCount, logout } =
    useAuth();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") === "dark";
    }
    return false;
  });

  const userMenuRef = useRef<HTMLDivElement>(null);
  const categoriesMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Consultation", href: "/consultation" },
    { name: "Categories", href: "/category" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  const categories = ["Skincare", "Fragrance", "Accessories"];

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
      if (isMenuOpen) setIsMenuOpen(false);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isMenuOpen]);

  // Click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      )
        setIsUserMenuOpen(false);
      if (
        categoriesMenuRef.current &&
        !categoriesMenuRef.current.contains(event.target as Node)
      )
        setIsCategoriesOpen(false);
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node) &&
        !(event.target as Element).closest('button[aria-label="Menu"]')
      ) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Dark mode toggle
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const next = !prev;
      localStorage.setItem("theme", next ? "dark" : "light");
      return next;
    });
  };

  const handleLogout = async () => {
    try {
      await logout();
      setIsUserMenuOpen(false);
      router.push("/");
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogin = () => router.push("/login");
  const handleSignup = () => router.push("/login?action=signup");

  return (
    <>
      {/* Top Announcement */}
      <div className="bg-gradient-to-r from-[#e39a89] to-[#d87a6a] text-white py-2 px-4 text-center text-sm">
        🎁 Free shipping on orders over ₵100 | Use code: HAYATE10 for 10% off
      </div>

      <header
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          isScrolled
            ? "bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg"
            : "bg-white dark:bg-gray-900"
        }`}
      >
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="relative w-12 h-12">
              <Image
                src={Logo}
                alt="Logo"
                width={48}
                height={48}
                className="object-contain"
              />
            </div>
            <div className="hidden md:block">
              <h1 className="text-xl font-bold text-[#1b3c35] dark:text-white">
                Hayate Cosmetics
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Premium Beauty Products
              </p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              if (link.name === "Categories") {
                return (
                  <div
                    key={link.href}
                    className="relative"
                    ref={categoriesMenuRef}
                  >
                    <button
                      onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                      className="flex items-center gap-1 text-gray-700 dark:text-gray-300 hover:text-[#e39a89] dark:hover:text-[#e39a89] font-medium transition-colors duration-200"
                    >
                      {link.name}
                      <FiChevronDown className="w-4 h-4" />
                    </button>
                    {isCategoriesOpen && (
                      <div className="absolute left-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 z-50">
                        {categories.map((category) => (
                          <Link
                            key={category}
                            href={`/categories/${category.toLowerCase()}`}
                            onClick={() => setIsCategoriesOpen(false)}
                            className="block px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 first:rounded-t-xl last:rounded-b-xl"
                          >
                            {category}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`font-medium transition-colors duration-200 ${
                    isActive
                      ? "text-[#e39a89] dark:text-[#e39a89]"
                      : "text-gray-700 dark:text-gray-300 hover:text-[#e39a89] dark:hover:text-[#e39a89]"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Icons */}
          <div className="flex items-center gap-4 md:gap-6">
            {isLoggedIn && (
              <Link
                href="/favorites"
                className="hidden md:block relative p-2 text-gray-700 dark:text-gray-300 hover:text-[#e39a89] dark:hover:text-[#e39a89]"
              >
                <FiHeart className="w-5 h-5" />
                {favoritesCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {favoritesCount > 9 ? "9+" : favoritesCount}
                  </span>
                )}
              </Link>
            )}

            {/* Cart */}
            {isLoggedIn && (
              <Link
                href="/cart"
                className="hidden md:block relative p-2 text-gray-700 dark:text-gray-300 hover:text-[#e39a89] dark:hover:text-[#e39a89]"
              >
                <FiShoppingCart className="w-5 h-5" />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#e39a89] text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {cartItemsCount > 9 ? "9+" : cartItemsCount}
                  </span>
                )}
              </Link>
            )}

            {/* User Dropdown */}
            <div className="relative hidden md:block" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="p-2 text-gray-700 dark:text-gray-300 hover:text-[#e39a89] dark:hover:text-[#e39a89] transition-colors duration-200 flex items-center gap-2"
              >
                <FiUser className="w-5 h-5" />
                <FiChevronDown className="w-4 h-4" />
              </button>
              {isUserMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 z-50">
                  {isLoggedIn ? (
                    <>
                      <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                        <p className="font-bold text-gray-800 dark:text-white truncate">
                          {user?.displayName || "User"}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate mt-1">
                          {user?.email}
                        </p>
                      </div>
                      <Link
                        href="/profile"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                      >
                        My Account
                      </Link>
                      <Link
                        href="/orders"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                      >
                        My Orders
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-3 text-red-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 border-t border-gray-100 dark:border-gray-700 rounded-b-xl"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={handleLogin}
                        className="w-full px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 rounded-t-xl"
                      >
                        Login
                      </button>
                      <button
                        onClick={handleSignup}
                        className="w-full px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 border-t border-gray-100 dark:border-gray-700 rounded-b-xl"
                      >
                        Sign Up
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={toggleDarkMode}
              className="hidden md:flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 px-4 py-3 rounded-xl"
            >
              {darkMode ? (
                <>
                  <FiSun className="w-5 h-5" />
                </>
              ) : (
                <>
                  <FiMoon className="w-5 h-5" />
                </>
              )}
            </button>

            {/* Mobile Menu */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-gray-700 dark:text-gray-300 hover:text-[#e39a89] dark:hover:text-[#e39a89]"
              aria-label="Menu"
            >
              {isMenuOpen ? (
                <FiX className="w-6 h-6" />
              ) : (
                <FiMenu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu Panel */}
        {isMenuOpen && (
          <div
            ref={mobileMenuRef}
            className="fixed inset-0 z-90 bg-black/50 lg:hidden"
            onClick={() => setIsMenuOpen(false)}
          >
            <div
              className="fixed right-0 top-0 h-full w-80 bg-white dark:bg-gray-900 shadow-2xl p-6 overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Nav Links */}
              <nav className="flex flex-col gap-2 mb-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`block px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 ${
                      pathname === link.href ? "bg-[#e39a89]/20" : ""
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>

              {/* User Actions */}
              <div className="flex flex-col gap-2 mb-6 border-t border-gray-100 dark:border-gray-800 pt-4">
                {isLoggedIn ? (
                  <>
                    <p className="font-bold text-gray-800 dark:text-white">
                      {user?.displayName || "User"}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      {user?.email}
                    </p>
                    <Link
                      href="/profile"
                      onClick={() => setIsMenuOpen(false)}
                      className="px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      My Account
                    </Link>
                    <Link
                      href="/orders"
                      onClick={() => setIsMenuOpen(false)}
                      className="px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      My Orders
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="px-4 py-3 rounded-xl text-red-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleLogin}
                      className="px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      Login
                    </button>
                    <button
                      onClick={handleSignup}
                      className="px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      Sign Up
                    </button>
                  </>
                )}
              </div>

              {/* Cart + Favorites + Dark Mode */}
              <div className="flex flex-col gap-3 border-t border-gray-100 dark:border-gray-800 pt-4">
                {isLoggedIn && (
                  <>
                    <Link
                      href="/favorites"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 px-4 py-3 rounded-xl"
                    >
                      <FiHeart className="w-5 h-5" />
                      Favorites {favoritesCount > 0 && `(${favoritesCount})`}
                    </Link>
                    <Link
                      href="/cart"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 px-4 py-3 rounded-xl"
                    >
                      <FiShoppingCart className="w-5 h-5" />
                      Cart {cartItemsCount > 0 && `(${cartItemsCount})`}
                    </Link>
                  </>
                )}
                <button
                  onClick={toggleDarkMode}
                  className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 px-4 py-3 rounded-xl"
                >
                  {darkMode ? (
                    <>
                      <FiSun className="w-5 h-5" />
                      Light Mode
                    </>
                  ) : (
                    <>
                      <FiMoon className="w-5 h-5" />
                      Dark Mode
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
