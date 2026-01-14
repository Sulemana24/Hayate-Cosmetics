"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { FiMail, FiArrowLeft, FiCheckCircle } from "react-icons/fi";
import { useToast } from "@/components/ToastProvider";

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await resetPassword(email);
      showToast({
        type: "success",
        message: "Password reset email sent successfully.",
      });
      setSuccess(true);
    } catch (error: unknown) {
      showToast({
        type: "error",
        message: (error as Error).message || "Failed to send reset email.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white mb-8"
        >
          <FiArrowLeft className="w-4 h-4" />
          Back to login
        </Link>

        {/* Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
          {/* Logo/Title */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r from-[#e39a89] to-[#d87a6a] flex items-center justify-center">
              <span className="text-2xl font-bold text-white">S</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              Reset Password
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Enter your email to receive a password reset link
            </p>
          </div>

          {success ? (
            <div className="text-center py-8">
              <FiCheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                Check Your Email
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                We&apos;ve sent password reset instructions to {email}. Please
                check your spam folder if you don&apos;t see the email.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center justify-center w-full py-3.5 bg-gradient-to-r from-[#e39a89] to-[#d87a6a] text-white rounded-xl font-medium hover:opacity-90 transition-all duration-200"
              >
                Return to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl">
                  <p className="text-red-600 dark:text-red-400 text-sm">
                    {error}
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <FiMail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#e39a89]/20 focus:border-[#e39a89] outline-none transition-all duration-200"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-[#e39a89] to-[#d87a6a] text-white rounded-xl font-medium hover:opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Sending...
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </button>

              <div className="text-center pt-4">
                <p className="text-gray-600 dark:text-gray-400">
                  Remember your password?{" "}
                  <Link
                    href="/login"
                    className="text-[#e39a89] hover:text-[#d87a8] font-medium"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
