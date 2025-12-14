"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import {
  FiSearch,
  FiUser,
  FiShoppingCart,
  FiMenu,
  FiX,
  FiChevronDown,
  FiLogOut,
  FiLogIn,
  FiUserPlus,
  FiHeart,
} from "react-icons/fi";

// Logo import - update with your actual logo
import Logo from "@/public/images/comlogo.png";

export default function ClientNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoggedIn, cartItemsCount, favoritesCount, logout, loading } =
    useAuth();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);

  // Refs for click outside detection
  const userMenuRef = useRef<HTMLDivElement>(null);
  const categoriesMenuRef = useRef<HTMLDivElement>(null);
  const searchMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Navigation links
  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Shop", href: "/shop" },
    { name: "Categories", href: "/categories" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  // Categories dropdown
  const categories = ["Skincare", "Fragrance", "Accessories"];

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Click outside handler for all dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Close user menu
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }

      // Close categories menu
      if (
        categoriesMenuRef.current &&
        !categoriesMenuRef.current.contains(event.target as Node)
      ) {
        setIsCategoriesOpen(false);
      }

      // Close search menu
      if (
        searchMenuRef.current &&
        !searchMenuRef.current.contains(event.target as Node)
      ) {
        setIsSearchOpen(false);
      }

      // Close mobile menu
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

  const handleLogout = async () => {
    try {
      await logout();
      setIsUserMenuOpen(false);
      setIsMenuOpen(false);
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleLogin = () => {
    router.push("/login");
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
  };

  const handleSignup = () => {
    router.push("/login?action=signup");
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality here
    setIsSearchOpen(false);
  };

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="bg-gradient-to-r from-[#e39a89] to-[#d87a6a] text-white py-2 px-4 text-center text-sm">
        🎁 Free shipping on orders over ₵100 | Use code: HAYATE10 for 10% off
      </div>

      {/* Main Navbar */}
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          isScrolled
            ? "bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg"
            : "bg-white dark:bg-gray-900"
        }`}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center gap-2">
                <div className="relative w-12 h-12">
                  <Image
                    src={Logo}
                    alt="Hayate Cosmetics"
                    width={48}
                    height={48}
                    className="object-contain"
                    priority
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
            </div>

            {/* Center: Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;

                // Special handling for Categories dropdown
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

                      {/* Dropdown Menu */}
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

            {/* Right: Icons and Actions */}
            <div className="flex items-center gap-4 md:gap-6">
              {/* Search - Desktop */}
              <div className="hidden md:block relative" ref={searchMenuRef}>
                <button
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  className="p-2 text-gray-700 dark:text-gray-300 hover:text-[#e39a89] dark:hover:text-[#e39a89] transition-colors duration-200"
                  aria-label="Search"
                >
                  <FiSearch className="w-5 h-5" />
                </button>

                {/* Search Bar (Expandable) */}
                {isSearchOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-2 z-50">
                    <form onSubmit={handleSearch}>
                      <div className="relative">
                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="text"
                          placeholder="Search products..."
                          className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#e39a89]/20 focus:border-[#e39a89] dark:focus:border-[#1b3c35] outline-none transition-all duration-200"
                          autoFocus
                        />
                      </div>
                    </form>
                  </div>
                )}
              </div>

              {/* Favorites - Only show when logged in */}
              {isLoggedIn && (
                <Link
                  href="/favorites"
                  className="hidden md:block p-2 text-gray-700 dark:text-gray-300 hover:text-[#e39a89] dark:hover:text-[#e39a89] transition-colors duration-200 relative"
                  aria-label="Favorites"
                >
                  <FiHeart className="w-5 h-5" />
                  {favoritesCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {favoritesCount > 9 ? "9+" : favoritesCount}
                    </span>
                  )}
                </Link>
              )}

              {/* User Account with Dropdown */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="p-2 text-gray-700 dark:text-gray-300 hover:text-[#e39a89] dark:hover:text-[#e39a89] transition-colors duration-200 flex items-center gap-2"
                  aria-label="Account"
                >
                  <FiUser className="w-5 h-5" />
                  <div className="hidden md:flex flex-col items-start">
                    <span className="text-sm font-bold text-gray-800 dark:text-white leading-none">
                      {isLoggedIn
                        ? user?.displayName || "My Account"
                        : "Account"}
                    </span>
                    {isLoggedIn && user?.email && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[120px]">
                        {user.email}
                      </span>
                    )}
                  </div>
                </button>

                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 z-50">
                    {isLoggedIn ? (
                      <>
                        {/* User Info - Full Name and Email */}
                        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                          <p className="font-bold text-gray-800 dark:text-white text-base truncate">
                            {user?.displayName || "User"}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 truncate mt-1">
                            {user?.email}
                          </p>
                        </div>

                        {/* Menu Items */}
                        <Link
                          href="/profile"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                        >
                          <FiUser className="w-4 h-4 mr-3" />
                          My Account
                        </Link>
                        <Link
                          href="/orders"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                        >
                          My Orders
                        </Link>
                        <Link
                          href="/favorites"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                        >
                          <FiHeart className="w-4 h-4 mr-3" />
                          Favorites
                          {favoritesCount > 0 && (
                            <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                              {favoritesCount}
                            </span>
                          )}
                        </Link>

                        {/* Logout Button */}
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-3 text-red-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 border-t border-gray-100 dark:border-gray-700 rounded-b-xl"
                        >
                          <FiLogOut className="w-4 h-4 mr-3" />
                          Logout
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={handleLogin}
                          className="flex items-center w-full px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 rounded-t-xl"
                        >
                          <FiLogIn className="w-4 h-4 mr-3" />
                          Login
                        </button>
                        <button
                          onClick={handleSignup}
                          className="flex items-center w-full px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 border-t border-gray-100 dark:border-gray-700 rounded-b-xl"
                        >
                          <FiUserPlus className="w-4 h-4 mr-3" />
                          Sign Up
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Shopping Cart - Only show when logged in */}
              {isLoggedIn && (
                <Link
                  href="/cart"
                  className="p-2 text-gray-700 dark:text-gray-300 hover:text-[#e39a89] dark:hover:text-[#e39a89] transition-colors duration-200 relative"
                  aria-label="Shopping Cart"
                >
                  <FiShoppingCart className="w-5 h-5" />
                  {cartItemsCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#e39a89] text-white text-xs rounded-full flex items-center justify-center font-bold">
                      {cartItemsCount > 9 ? "9+" : cartItemsCount}
                    </span>
                  )}
                </Link>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2 text-gray-700 dark:text-gray-300 hover:text-[#e39a89] dark:hover:text-[#e39a89] transition-colors duration-200"
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

          {/* Search - Mobile (Full Width) */}
          {isSearchOpen && (
            <div className="md:hidden mt-4">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search for skincare, fragrance, accessories..."
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#e39a89]/20 focus:border-[#e39a89] dark:focus:border-[#1b3c35] outline-none transition-all duration-200"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setIsSearchOpen(false)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setIsMenuOpen(false)}
            />

            {/* Mobile Menu Panel */}
            <div
              className="fixed inset-y-0 right-0 w-80 bg-white dark:bg-gray-900 z-50 transform transition-transform duration-300 lg:hidden shadow-2xl"
              ref={mobileMenuRef}
            >
              <div className="flex flex-col h-full">
                {/* Mobile Menu Header */}
                <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 relative">
                        <Image
                          src={Logo}
                          alt="Hayate Cosmetics"
                          width={40}
                          height={40}
                          className="object-contain"
                        />
                      </div>
                      <div>
                        <h2 className="font-bold text-[#1b3c35] dark:text-white">
                          Hayate Cosmetics
                        </h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Premium Beauty
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsMenuOpen(false)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                    >
                      <FiX className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                  </div>

                  {/* Mobile Search */}
                  <form onSubmit={handleSearch}>
                    <div className="relative">
                      <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search products..."
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#e39a89]/20 focus:border-[#e39a89] outline-none"
                      />
                    </div>
                  </form>
                </div>

                {/* Mobile Menu Content */}
                <div className="flex-1 overflow-y-auto p-6">
                  <nav className="space-y-1">
                    {navLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setIsMenuOpen(false)}
                        className={`block px-4 py-3 rounded-xl font-medium transition-colors duration-200 ${
                          pathname === link.href
                            ? "bg-gradient-to-r from-[#e39a89]/10 to-[#d87a6a]/10 text-[#e39a89]"
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                        }`}
                      >
                        {link.name}
                      </Link>
                    ))}
                  </nav>

                  {/* Categories in Mobile */}
                  <div className="mt-8">
                    <h3 className="px-4 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                      Categories
                    </h3>
                    <div className="space-y-1">
                      {categories.map((category) => (
                        <Link
                          key={category}
                          href={`/categories/${category.toLowerCase()}`}
                          onClick={() => setIsMenuOpen(false)}
                          className="block px-4 py-2.5 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200"
                        >
                          {category}
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* User Actions in Mobile - Only show when logged in */}
                  {isLoggedIn && (
                    <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 space-y-3">
                      <div className="px-4 py-3 bg-gradient-to-r from-[#e39a89]/10 to-[#d87a6a]/10 rounded-xl">
                        {/* Full Name - larger and bold */}
                        <p className="font-bold text-gray-800 dark:text-white text-base">
                          {user?.displayName || "User"}
                        </p>
                        {/* Email - smaller and muted */}
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate mt-1">
                          {user?.email}
                        </p>
                      </div>
                      <Link
                        href="/profile"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors duration-200"
                      >
                        <FiUser className="w-5 h-5" />
                        <span>My Account</span>
                      </Link>
                      <Link
                        href="/favorites"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors duration-200"
                      >
                        <FiHeart className="w-5 h-5" />
                        <span>Favorites</span>
                        {favoritesCount > 0 && (
                          <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                            {favoritesCount}
                          </span>
                        )}
                      </Link>
                      <Link
                        href="/cart"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors duration-200"
                      >
                        <FiShoppingCart className="w-5 h-5" />
                        <span>Shopping Cart</span>
                        {cartItemsCount > 0 && (
                          <span className="ml-auto bg-[#e39a89] text-white text-xs px-2 py-1 rounded-full">
                            {cartItemsCount} items
                          </span>
                        )}
                      </Link>
                    </div>
                  )}
                </div>

                {/* Mobile Menu Footer - Auth Buttons */}
                <div className="p-6 border-t border-gray-100 dark:border-gray-800">
                  {isLoggedIn ? (
                    <div className="space-y-3">
                      <button
                        onClick={handleLogout}
                        className="flex items-center justify-center gap-2 w-full py-3 bg-red-600 text-white font-medium rounded-xl hover:opacity-90 transition-opacity"
                      >
                        <FiLogOut className="w-5 h-5" />
                        Logout
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <button
                        onClick={handleLogin}
                        className="w-full py-3 bg-gradient-to-r from-[#e39a89] to-[#d87a6a] text-white font-medium rounded-xl hover:opacity-90 transition-opacity"
                      >
                        Sign In
                      </button>
                      <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                        New customer?{" "}
                        <button
                          onClick={handleSignup}
                          className="text-[#e39a89] font-medium"
                        >
                          Create an account
                        </button>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </header>
    </>
  );
}
