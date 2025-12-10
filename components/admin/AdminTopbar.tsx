"use client";
import Image from "next/image";
import { signOut, onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import {
  FiLogOut,
  FiUser,
  FiMenu,
  FiBell,
  FiSearch,
  FiChevronDown,
  FiSettings,
  FiX,
} from "react-icons/fi";
import Logo from "../../public/images/comlogo.png";

export default function AdminNavbar() {
  const [user, setUser] = useState<User | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [fullName, setFullName] = useState<string | null>(null);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const router = useRouter();

  // Sidebar state - you can move this to context later
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setFullName(docSnap.data().fullName || null);
        }
      }
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    const handleSidebarClosed = (event: CustomEvent) => {
      console.log("Sidebar closed event received", event.detail);
      setIsSidebarOpen(false);
    };

    // Listen for sidebar state changes
    const handleSidebarStateChange = (event: CustomEvent) => {
      console.log("Sidebar state changed", event.detail);
      setIsSidebarOpen(event.detail.isOpen);
    };

    window.addEventListener(
      "sidebar-closed",
      handleSidebarClosed as EventListener
    );
    window.addEventListener(
      "sidebar-state-change",
      handleSidebarStateChange as EventListener
    );

    return () => {
      window.removeEventListener(
        "sidebar-closed",
        handleSidebarClosed as EventListener
      );
      window.removeEventListener(
        "sidebar-state-change",
        handleSidebarStateChange as EventListener
      );
    };
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/admin");
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "A";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
    // Dispatch custom event for sidebar to listen to
    window.dispatchEvent(
      new CustomEvent("toggle-sidebar", {
        detail: { isOpen: !isSidebarOpen },
      })
    );
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full h-16 bg-[#e39a89] flex items-center justify-between px-4 sm:px-6 lg:px-8 shadow-lg">
        {/* Left Section - Sidebar Toggle & Brand */}
        <div className="flex items-center gap-3">
          {/* Sidebar Toggle Button */}
          <button
            onClick={toggleSidebar}
            className="p-2.5 rounded-lg hover:bg-[#d87a6a] transition-colors group md:hidden"
            aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            {isSidebarOpen ? (
              <FiX className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
            ) : (
              <FiMenu className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
            )}
          </button>

          {/* Brand / Logo */}
          <div className="flex items-center gap-3">
            <div className="hidden md:block">
              <Image
                src={Logo}
                alt="Admin Portal Logo"
                width={69}
                height={69}
                className=" object-contain"
                priority
              />
            </div>
          </div>
        </div>

        {/* Right Section - User Controls */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Mobile Search Toggle */}
          <button
            onClick={() => setShowMobileSearch(!showMobileSearch)}
            className="lg:hidden p-2.5 rounded-lg hover:bg-[#d87a6a] transition-colors"
            aria-label="Search"
          >
            <FiSearch className="w-5 h-5 text-white" />
          </button>

          {/* Notifications */}
          <button
            className="relative p-2.5 rounded-lg hover:bg-[#d87a6a] transition-colors cursor-pointer group"
            aria-label="Notifications"
          >
            <FiBell className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
          </button>

          {/* Settings */}
          <button
            className="hidden sm:block p-2.5 rounded-lg hover:bg-[#d87a6a] transition-colors cursor-pointer group"
            aria-label="Settings"
          >
            <FiSettings className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
          </button>

          {/* User Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-[#d87a6a] transition-colors group"
            >
              <div className="relative">
                <div className="w-10 h-10 bg-[#1b3c35] text-white flex items-center justify-center rounded-xl font-bold shadow-sm group-hover:scale-105 transition-transform">
                  {getInitials(fullName)}
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
              </div>

              <div className="hidden md:block text-left">
                <p className="font-semibold text-sm text-white truncate max-w-[120px]">
                  {fullName || "Admin User"}
                </p>
                <p className="text-xs text-white/80 truncate max-w-[120px]">
                  {user?.email || "admin@example.com"}
                </p>
              </div>

              <FiChevronDown
                className={`w-4 h-4 text-white transition-transform ${
                  showUserMenu ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
                  <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-[#e39a89] to-[#d87a6a]">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-[#1b3c35] text-white flex items-center justify-center rounded-xl font-bold text-lg">
                        {getInitials(fullName)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white truncate">
                          {fullName || "Admin User"}
                        </p>
                        <p className="text-sm text-white/80 truncate">
                          {user?.email || "admin@example.com"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-2">
                    <a
                      href="#"
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <FiUser className="w-4 h-4" />
                      <span>My Profile</span>
                    </a>
                    <a
                      href="#"
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <FiSettings className="w-4 h-4" />
                      <span>Account Settings</span>
                    </a>
                  </div>

                  <div className="p-2 border-t border-gray-100 dark:border-gray-700">
                    <button
                      onClick={handleLogout}
                      className="flex items-center justify-center gap-2 w-full px-3 py-2.5 bg-gradient-to-r from-[#e39a89] to-[#d87a6a] text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                    >
                      <FiLogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Search Bar */}
      {showMobileSearch && (
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3">
          <div className="relative">
            <button
              onClick={() => setShowMobileSearch(false)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1"
              aria-label="Close search"
            >
              <FiX className="h-4 w-4 text-gray-400" />
            </button>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="search"
              placeholder="Search admin panel..."
              className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-xl bg-gray-50 text-gray-900 focus:ring-2 focus:ring-[#1b3c35] focus:border-transparent transition-all duration-200 outline-none text-sm"
              autoFocus
            />
          </div>
        </div>
      )}
    </>
  );
}
