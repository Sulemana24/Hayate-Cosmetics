"use client";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { FirebaseError } from "firebase/app";
import { allowedAdmins } from "@/lib/admin";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useState, FormEvent, ChangeEvent } from "react";
import Image from "next/image";
import {
  FaEye,
  FaEyeSlash,
  FaLock,
  FaEnvelope,
  FaArrowRight,
  FaUser,
} from "react-icons/fa";
import Logo from "../../../public/images/comlogo.png";

type AuthMode = "login" | "signup";

interface FormData {
  fullName?: string;
  email: string;
  password: string;
  confirmPassword?: string;
  rememberMe: boolean;
  agreeToTerms: boolean;
}

export default function AdminAuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("login");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    rememberMe: false,
    agreeToTerms: false,
  });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "signup") {
        if (formData.password !== formData.confirmPassword) {
          toast.error("Passwords do not match");
          setLoading(false);
          return;
        }

        if (!formData.agreeToTerms) {
          toast.error("You must confirm admin authorization");
          setLoading(false);
          return;
        }

        const res = await createUserWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );

        await setDoc(doc(db, "users", res.user.uid), {
          fullName: formData.fullName,
          email: formData.email,
          role: "admin",
          createdAt: new Date(),
        });

        toast.success("Admin account created successfully!");
        router.push("/admin/dashboard");
      }

      if (mode === "login") {
        const res = await signInWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );

        if (!allowedAdmins.includes(res.user.email!)) {
          toast.error("Access denied. Not an admin.");
          setLoading(false);
          return;
        }

        toast.success("Login successful!");
        router.push("/admin/dashboard");
      }
    } catch (error: unknown) {
      let message = "An unexpected error occurred";

      if (error instanceof FirebaseError) {
        message = error.message || error.code;
      } else if (error instanceof Error) {
        message = error.message;
      }

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleForgotPassword = () => {
    console.log("Forgot password clicked");
    toast("Forgot password clicked");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#faf7f5] to-[#f0ece9] dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
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
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            {mode === "login" ? "Welcome Back" : "Create Account"}
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            {mode === "login"
              ? "Sign in to your admin account"
              : "Setup your admin credentials"}
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-10 border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setMode("login")}
                className={`px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all ${
                  mode === "login"
                    ? "dark:bg-[#e39a89] bg-[#1b3c35] text-white"
                    : "text-gray-600 dark:text-gray-200 dark:hover:text-[#e39a89] hover:text-[#1b3c35]"
                }`}
              >
                Login
              </button>
              <button
                onClick={() => setMode("signup")}
                className={`px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all ${
                  mode === "signup"
                    ? "dark:bg-[#e39a89] bg-[#1b3c35] text-white"
                    : "text-gray-600 dark:text-gray-200 dark:hover:text-[#e39a89] hover:text-[#1b3c35]"
                }`}
              >
                Sign Up
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name for signup only */}
            {mode === "signup" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#e39a89] dark:focus:ring-[#1b3c35] focus:border-transparent transition-all duration-200 outline-none"
                    placeholder="Enter full name"
                    required
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#e39a89] dark:focus:ring-[#1b3c35] focus:border-transparent transition-all duration-200 outline-none"
                  placeholder="Enter email address"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#e39a89] dark:focus:ring-[#1b3c35] focus:border-transparent transition-all duration-200 outline-none"
                  placeholder={
                    mode === "login"
                      ? "Enter your password"
                      : "Create a password"
                  }
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <FaEyeSlash className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" />
                  ) : (
                    <FaEye className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password for signup only */}
            {mode === "signup" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#e39a89] dark:focus:ring-[#1b3c35] focus:border-transparent transition-all duration-200 outline-none"
                    placeholder="Confirm your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center focus:outline-none"
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showConfirmPassword ? (
                      <FaEyeSlash className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" />
                    ) : (
                      <FaEye className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Checkboxes */}
            <div className="space-y-4">
              {mode === "login" ? (
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="rememberMe"
                      name="rememberMe"
                      checked={formData.rememberMe}
                      onChange={handleChange}
                      className="h-4 w-4 text-[#e39a89] dark:text-[#1b3c35] focus:ring-[#e39a89] dark:focus:ring-[#1b3c35] border-gray-300 rounded cursor-pointer"
                    />
                    <label
                      htmlFor="rememberMe"
                      className="ml-2 text-sm text-gray-700 dark:text-gray-300"
                    >
                      Remember this device
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-sm text-[#1b3c35] hover:text-[#2a4d45] dark:text-[#e39a89] dark:hover:text-[#d87a6a] font-medium transition-colors focus:outline-none focus:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
              ) : (
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="adminAgreement"
                    name="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={handleChange}
                    className="h-4 w-4 mt-1 text-[#e39a89] dark:text-[#1b3c35] focus:ring-[#e39a89] dark:focus:ring-[#1b3c35] border-gray-300 rounded cursor-pointer"
                    required
                  />
                  <label
                    htmlFor="adminAgreement"
                    className="ml-2 text-sm text-gray-700 dark:text-gray-300"
                  >
                    I confirm that I have administrative privileges and am
                    authorized to create this account
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                </div>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-[#e39a89] hover:bg-[#d87a6a] dark:bg-[#1b3c35] dark:hover:bg-[#2a4d45] text-white font-semibold py-3.5 px-4 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#e39a89] dark:focus:ring-[#1b3c35] focus:ring-offset-2 dark:focus:ring-offset-gray-800 active:translate-y-0 flex items-center justify-center gap-2 cursor-pointer ${
                loading ? "opacity-60 cursor-not-allowed" : ""
              }`}
            >
              {loading
                ? "Processing..."
                : mode === "login"
                ? "Sign In"
                : "Create Account"}
              {!loading && <FaArrowRight className="w-4 h-4" />}
            </button>
          </form>
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            © {new Date().getFullYear()} Admin Portal. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
