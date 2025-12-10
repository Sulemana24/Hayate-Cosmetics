"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import {
  RiDatabase2Fill,
  RiSettings4Line,
  RiUserLine,
  RiBarChart2Line,
} from "react-icons/ri";
import { FiShoppingCart, FiChevronLeft, FiX } from "react-icons/fi";
import { MdOutlineSpaceDashboard, MdOutlineAnalytics } from "react-icons/md";
import { useState, useEffect } from "react";

const mainLinks = [
  {
    name: "Dashboard",
    href: "/admin/dashboard",
    icon: MdOutlineSpaceDashboard,
  },
  {
    name: "Products",
    href: "/admin/products",
    icon: RiDatabase2Fill,
  },
  {
    name: "Orders",
    href: "/admin/orders",
    icon: FiShoppingCart,
  },
];

const analyticsLinks = [
  {
    name: "Analytics",
    href: "/admin/analytics",
    icon: MdOutlineAnalytics,
  },
  {
    name: "Reports",
    href: "/admin/reports",
    icon: RiBarChart2Line,
  },
];

const settingsLinks = [
  {
    name: "Settings",
    href: "/admin/settings",
    icon: RiSettings4Line,
  },
  {
    name: "Profile",
    href: "/admin/profile",
    icon: RiUserLine,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkIfMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setIsMobileOpen(false);
      }
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => {
      window.removeEventListener("resize", checkIfMobile);
    };
  }, []);

  const closeSidebar = () => {
    setIsMobileOpen(false);

    window.dispatchEvent(
      new CustomEvent("sidebar-closed", {
        detail: { isOpen: false },
      })
    );
    window.dispatchEvent(
      new CustomEvent("sidebar-state-change", {
        detail: { isOpen: false },
      })
    );
  };

  const openSidebar = () => {
    setIsMobileOpen(true);
    window.dispatchEvent(
      new CustomEvent("sidebar-state-change", {
        detail: { isOpen: true },
      })
    );
  };

  // Listen for toggle events from navbar
  useEffect(() => {
    const handleToggleSidebar = (event: CustomEvent) => {
      const { isOpen } = event.detail;
      if (isMobile) {
        if (isOpen) {
          openSidebar();
        } else {
          closeSidebar();
        }
      }
    };

    window.addEventListener(
      "toggle-sidebar",
      handleToggleSidebar as EventListener
    );

    return () => {
      window.removeEventListener(
        "toggle-sidebar",
        handleToggleSidebar as EventListener
      );
    };
  }, [isMobile]);

  // Close mobile sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById("admin-sidebar");
      const navbarToggle = document.querySelector(
        'header button[aria-label*="sidebar"]'
      );

      if (
        isMobileOpen &&
        sidebar &&
        !sidebar.contains(event.target as Node) &&
        navbarToggle &&
        !navbarToggle.contains(event.target as Node)
      ) {
        closeSidebar();
      }
    };

    if (isMobileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobileOpen]);

  const handleLinkClick = () => {
    if (isMobile) {
      closeSidebar();
    }
  };

  // Desktop-only: Auto-collapse on very small desktop screens
  useEffect(() => {
    if (!isMobile) {
      const handleResize = () => {
        if (window.innerWidth < 1280 && window.innerWidth >= 1024) {
          setIsCollapsed(true);
        } else if (window.innerWidth >= 1280) {
          setIsCollapsed(false);
        }
      };

      handleResize();
      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }
  }, [isMobile]);

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && isMobile && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        id="admin-sidebar"
        className={clsx(
          "fixed lg:sticky top-0 left-0 z-40 h-screen bg-[#1b3c35] text-white transition-all duration-300 ease-in-out",
          // Desktop behavior
          !isMobile && [
            isCollapsed ? "w-16 hover:w-64 lg:w-16 xl:w-64 group" : "w-64",
          ],
          // Mobile behavior
          isMobile && [
            isMobileOpen ? "translate-x-0 w-64" : "-translate-x-full",
          ]
        )}
      >
        {/* Close button for mobile */}
        {isMobile && (
          <button
            onClick={closeSidebar}
            className="lg:hidden absolute top-4 right-4 p-2 rounded-lg hover:bg-[#2a4d45] transition-colors"
            aria-label="Close sidebar"
          >
            <FiX className="w-5 h-5" />
          </button>
        )}

        {/* Desktop Collapse Button - Only visible on desktop */}
        {!isMobile && (
          <div className="p-4 border-b border-[#2a4d45]">
            <div className="flex items-center justify-end">
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="p-1.5 rounded-lg hover:bg-[#2a4d45] transition-colors group-hover:opacity-100 lg:opacity-0 xl:opacity-100"
                aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                <FiChevronLeft
                  className={clsx(
                    "w-5 h-5 transition-transform duration-300",
                    isCollapsed && "rotate-180"
                  )}
                />
              </button>
            </div>
          </div>
        )}

        {/* Navigation Sections - FIXED SPACING */}
        <div className="h-[calc(100vh-80px)] overflow-y-auto py-6 custom-scrollbar">
          {/* Add top padding to prevent squeezing to top */}
          <div className="pt-6 px-3">
            {/* Main Navigation */}
            <div className="mb-8">
              {(!isCollapsed || isMobile) && (
                <div className="mb-4 px-2">
                  <p className="text-xs uppercase text-gray-400 font-semibold tracking-wider">
                    Main Menu
                  </p>
                </div>
              )}
              <nav className="space-y-2">
                {mainLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={clsx(
                      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group/nav",
                      pathname === link.href
                        ? "bg-gradient-to-r from-[#e39a89] to-[#d87a6a] text-white shadow-lg"
                        : "hover:bg-[#2a4d45]"
                    )}
                    onClick={handleLinkClick}
                    title={isCollapsed && !isMobile ? link.name : undefined}
                  >
                    <link.icon
                      className={clsx(
                        "w-5 h-5 flex-shrink-0",
                        isCollapsed && !isMobile && "mx-auto"
                      )}
                    />
                    <span
                      className={clsx(
                        "font-medium transition-all duration-300",
                        isCollapsed && !isMobile
                          ? "opacity-0 w-0 overflow-hidden group-hover:opacity-100 group-hover:w-auto"
                          : "opacity-100"
                      )}
                    >
                      {link.name}
                    </span>
                  </Link>
                ))}
              </nav>
            </div>

            {/* Analytics Section - Only show on desktop when expanded */}
            {(!isCollapsed || isMobile) && (
              <div className="mb-8">
                <div className="mb-4 px-2">
                  <p className="text-xs uppercase text-gray-400 font-semibold tracking-wider">
                    Analytics
                  </p>
                </div>
                <nav className="space-y-2">
                  {analyticsLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={clsx(
                        "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors",
                        pathname === link.href
                          ? "bg-[#2a4d45] text-white"
                          : "hover:bg-[#2a4d45]"
                      )}
                      onClick={handleLinkClick}
                      title={isCollapsed && !isMobile ? link.name : undefined}
                    >
                      <link.icon
                        className={clsx(
                          "w-5 h-5 flex-shrink-0 text-gray-300",
                          isCollapsed && !isMobile && "mx-auto"
                        )}
                      />
                      <span
                        className={clsx(
                          "font-medium transition-all duration-300",
                          isCollapsed && !isMobile
                            ? "opacity-0 w-0 overflow-hidden group-hover:opacity-100 group-hover:w-auto"
                            : "opacity-100"
                        )}
                      >
                        {link.name}
                      </span>
                    </Link>
                  ))}
                </nav>
              </div>
            )}

            {/* Settings Section - Only show on desktop when expanded */}
            {(!isCollapsed || isMobile) && (
              <div className="mb-4">
                <div className="mb-4 px-2">
                  <p className="text-xs uppercase text-gray-400 font-semibold tracking-wider">
                    Settings
                  </p>
                </div>
                <nav className="space-y-2">
                  {settingsLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={clsx(
                        "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors",
                        pathname === link.href
                          ? "bg-[#2a4d45] text-white"
                          : "hover:bg-[#2a4d45]"
                      )}
                      onClick={handleLinkClick}
                      title={isCollapsed && !isMobile ? link.name : undefined}
                    >
                      <link.icon
                        className={clsx(
                          "w-5 h-5 flex-shrink-0 text-gray-300",
                          isCollapsed && !isMobile && "mx-auto"
                        )}
                      />
                      <span
                        className={clsx(
                          "font-medium transition-all duration-300",
                          isCollapsed && !isMobile
                            ? "opacity-0 w-0 overflow-hidden group-hover:opacity-100 group-hover:w-auto"
                            : "opacity-100"
                        )}
                      >
                        {link.name}
                      </span>
                    </Link>
                  ))}
                </nav>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Add custom scrollbar styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #2a4d45;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e39a89;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #d87a6a;
        }
      `}</style>
    </>
  );
}
