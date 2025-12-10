"use client";

import { useState, useEffect } from "react";
import { FiChevronUp } from "react-icons/fi";
import { MdKeyboardDoubleArrowUp } from "react-icons/md";

export default function BackToTopLuxury() {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      // Show/hide button
      setIsVisible(window.scrollY > 300);

      // Calculate scroll progress
      const winScroll =
        document.body.scrollTop || document.documentElement.scrollTop;
      const height =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      setScrollProgress(scrolled);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    // Optional: Add a little animation feedback
    const button = document.querySelector(".back-to-top-btn");
    button?.classList.add("animate-ping");
    setTimeout(() => {
      button?.classList.remove("animate-ping");
    }, 500);
  };

  return (
    <div className="fixed bottom-8 right-8 z-50">
      {/* Progress Circle */}
      <div
        className={`absolute -inset-2 transition-opacity duration-500 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 100 100">
          {/* Background track */}
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="rgba(27, 60, 53, 0.1)"
            strokeWidth="3"
            fill="none"
          />
          {/* Progress track */}
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="url(#gradient)"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            strokeDasharray="283"
            strokeDashoffset={283 - scrollProgress * 2.83}
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#e39a89" />
              <stop offset="100%" stopColor="#d87a6a" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Main Button */}
      <button
        onClick={scrollToTop}
        className={`back-to-top-btn relative w-12 h-12 rounded-full shadow-2xl transition-all duration-500 transform ${
          isVisible
            ? "opacity-100 scale-100"
            : "opacity-0 scale-50 pointer-events-none"
        } hover:scale-110 active:scale-95 group`}
        aria-label="Back to top"
        style={{
          background: "linear-gradient(135deg, #e39a89 0%, #d87a6a 100%)",
          boxShadow: "0 10px 30px rgba(227, 154, 137, 0.4)",
        }}
      >
        {/* Inner glow effect */}
        <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>

        {/* Icon */}
        <div className="relative z-10 flex items-center justify-center">
          <FiChevronUp className="w-6 h-6 text-white transition-transform group-hover:-translate-y-1" />
        </div>

        {/* Tooltip */}
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          Back to top
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
        </div>
      </button>

      {/* Scroll percentage (optional) */}
      {isVisible && scrollProgress > 5 && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs font-medium text-[#1b3c35] dark:text-white bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-2 py-1 rounded-full whitespace-nowrap">
          {Math.round(scrollProgress)}%
        </div>
      )}
    </div>
  );
}
