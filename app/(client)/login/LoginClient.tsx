"use client";

import Image from "next/image";
import { useState } from "react";
import Link from "next/link";
import { useToast } from "@/components/ToastProvider";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { FiMail, FiLock, FiEye, FiEyeOff, FiUser } from "react-icons/fi";
import Logo from "../../../public/images/comlogo.png";

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirect = searchParams.get("redirect") || "/";
  const action = searchParams.get("action");
  const { login, signup } = useAuth();
  const [isLogin, setIsLogin] = useState(action !== "signup");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [buttonLoading, setButtonLoading] = useState(false);
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setButtonLoading(true);

    if (!formData.email || !formData.password) {
      showToast({
        type: "error",
        message: "Email and password are required.",
      });
      setButtonLoading(false);
      return;
    }

    if (!isLogin && formData.password !== formData.confirmPassword) {
      showToast({
        type: "error",
        message: "Passwords do not match.",
      });
      setButtonLoading(false);
      return;
    }

    if (!isLogin && !formData.name) {
      showToast({
        type: "error",
        message: "Error preparing payment. Please try again.",
      });
      setButtonLoading(false);
      return;
    }

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
        showToast({
          type: "success",
          message: "Logged in successfully!",
        });
        setTimeout(() => router.push(redirect), 1000);
      } else {
        await signup(formData.email, formData.password, formData.name);
        showToast({
          type: "success",
          message: "Account created successfully! Redirecting to login...",
        });
        setTimeout(() => router.push(redirect), 1000);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        const msg = err.message;
        if (msg.includes("auth/email-already-in-use"))
          showToast({
            type: "error",
            message: "Email is already in use.",
          });
        else if (msg.includes("auth/invalid-email"))
          showToast({
            type: "error",
            message: "Invalid email address.",
          });
        else if (msg.includes("auth/weak-password"))
          showToast({
            type: "error",
            message: "Password is too weak.",
          });
        else if (msg.includes("auth/user-not-found"))
          showToast({
            type: "error",
            message: "No account found with this email.",
          });
        else if (msg.includes("auth/wrong-password"))
          showToast({
            type: "error",
            message: "Incorrect password.",
          });
        else
          showToast({
            type: "error",
            message: "Authentication failed",
          });
      } else {
        showToast({
          type: "error",
          message: "An unexpected error occurred.",
        });
      }
    } finally {
      setButtonLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Auth Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
          {/* Logo/Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-[#e39a89] rounded-2xl shadow-lg mb-4 p-4">
              <Image
                src={Logo}
                alt="Admin Portal Logo"
                width={48}
                height={48}
                className="w-12 h-12 object-contain"
                priority
              />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {isLogin
                ? "Sign in to your account to continue"
                : "Join our community today"}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-xl">
              <p className="text-green-600 dark:text-green-400 text-sm">
                {success}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name *
                </label>
                <div className="relative">
                  <FiUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required={!isLogin}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#e39a89]/20 focus:border-[#e39a89] outline-none transition-all duration-200"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address *
              </label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#e39a89]/20 focus:border-[#e39a89] outline-none transition-all duration-200"
                  placeholder="Enter your email address"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password *
              </label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  className="w-full pl-12 pr-12 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#e39a89]/20 focus:border-[#e39a89] outline-none transition-all duration-200"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <FiEyeOff className="w-5 h-5" />
                  ) : (
                    <FiEye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {!isLogin && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Password must be at least 6 characters long
                </p>
              )}
            </div>

            {!isLogin && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Confirm Password *
                </label>
                <div className="relative">
                  <FiLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required={!isLogin}
                    minLength={6}
                    className="w-full pl-12 pr-12 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#e39a89]/20 focus:border-[#e39a89] outline-none transition-all duration-200"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <FiEyeOff className="w-5 h-5" />
                    ) : (
                      <FiEye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Forgot Password */}
            {isLogin && (
              <div className="text-right">
                <Link
                  href="/forgot-password"
                  className="text-sm text-[#e39a89] hover:text-[#d87a6a]"
                >
                  Forgot your password?
                </Link>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={buttonLoading}
              className="w-full py-3.5 bg-gradient-to-r from-[#e39a89] to-[#d87a6a] text-white rounded-xl font-medium hover:opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {buttonLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {isLogin ? "Signing in..." : "Creating account..."}
                </>
              ) : (
                <>{isLogin ? "Sign In" : "Create Account"}</>
              )}
            </button>

            {/* Toggle Login/Signup */}
            <div className="text-center pt-4">
              <p className="text-gray-600 dark:text-gray-400">
                {isLogin
                  ? "Don't have an account?"
                  : "Already have an account?"}
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError("");
                    setSuccess("");
                    setFormData((prev) => ({
                      ...prev,
                      password: "",
                    }));
                  }}
                  className="ml-2 text-[#e39a89] hover:text-[#d87a6a] font-medium"
                >
                  {isLogin ? "Sign up" : "Sign in"}
                </button>
              </p>
            </div>

            {/* Terms */}
            {!isLogin && (
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center pt-4">
                By creating an account, you agree to our{" "}
                <Link href="/terms" className="text-[#e39a89] hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  className="text-[#e39a89] hover:underline"
                >
                  Privacy Policy
                </Link>
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
