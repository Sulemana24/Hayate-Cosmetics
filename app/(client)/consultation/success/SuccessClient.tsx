"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FiCheckCircle,
  FiCalendar,
  FiClock,
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiDownload,
  FiHome,
  FiShoppingBag,
  FiChevronRight,
} from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";

interface ConsultationData {
  userName?: string;
  userEmail?: string;
  userPhone?: string;
  selectedDate?: string;
  selectedTime?: string;
  consultationType?: string;
  planTitle?: string;
  amount?: number;
  paymentReference?: string;
  transactionId?: string;
  paymentDate?: string;
}

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [consultationData, setConsultationData] =
    useState<ConsultationData | null>(() => {
      const urlData: ConsultationData = {};

      const name = searchParams.get("name");
      const email = searchParams.get("email");
      const phone = searchParams.get("phone");
      const date = searchParams.get("date");
      const time = searchParams.get("time");
      const type = searchParams.get("type");
      const plan = searchParams.get("plan");
      const amount = searchParams.get("amount");
      const reference = searchParams.get("reference");

      if (name) urlData.userName = name;
      if (email) urlData.userEmail = email;
      if (phone) urlData.userPhone = phone;
      if (date) urlData.selectedDate = date;
      if (time) urlData.selectedTime = time;
      if (type) urlData.consultationType = type;
      if (plan) urlData.planTitle = plan;
      if (amount) urlData.amount = parseFloat(amount);
      if (reference) urlData.paymentReference = reference;

      if (Object.keys(urlData).length > 0) {
        sessionStorage.setItem("lastConsultation", JSON.stringify(urlData));
        return urlData;
      }

      const storedData = sessionStorage.getItem("lastConsultation");
      return storedData ? JSON.parse(storedData) : null;
    });

  const [isLoading, setIsLoading] = useState(true);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (!consultationData) {
      router.push("/consultation");
      return;
    }

    // defer setState to next tick
    setTimeout(() => setIsLoading(false), 0);

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push("/my-account");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [consultationData, router]);

  const formatDate = (dateString?: string): string => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      return dateString;
    }
  };

  const formatTime = (timeString?: string): string => {
    if (!timeString) return "";
    if (timeString.includes("AM") || timeString.includes("PM"))
      return timeString;
    try {
      const [hours, minutes] = timeString.split(":");
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? "PM" : "AM";
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    } catch {
      return timeString;
    }
  };

  const handleDownloadReceipt = () => {
    if (!consultationData) return;

    const receiptContent = `
HAYATE BEAUTY CONSULTATION RECEIPT
===================================

Payment Confirmation
--------------------
Transaction ID: ${consultationData.transactionId || "N/A"}
Reference: ${consultationData.paymentReference || "N/A"}
Date: ${new Date().toLocaleDateString()}
Time: ${new Date().toLocaleTimeString()}

Customer Information
--------------------
Name: ${consultationData.userName || "N/A"}
Email: ${consultationData.userEmail || "N/A"}
Phone: ${consultationData.userPhone || "N/A"}

Consultation Details
--------------------
Plan: ${consultationData.planTitle || "N/A"}
Date: ${formatDate(consultationData.selectedDate)}
Time: ${formatTime(consultationData.selectedTime)}
Type: ${consultationData.consultationType || "Virtual"} Consultation

Payment Summary
---------------
Amount: GH₵${consultationData.amount?.toFixed(2) || "0.00"}
Status: Paid Successfully

Thank you for choosing Hayate Beauty!
=====================================

Contact Support:
Email: support@hayatebeauty.com
Phone: +233 53 384 2202
`;

    const blob = new Blob([receiptContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hayate-receipt-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#e39a89] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Loading payment details...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Success Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-green-500 to-emerald-600 py-12">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-2xl">
                <FiCheckCircle className="w-12 h-12 text-emerald-600" />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Payment Successful!
            </h1>
            <p className="text-lg text-white/90">
              Your consultation has been booked successfully
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Success Card */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden mb-8">
            {/* Card Header */}
            <div className="bg-gradient-to-r from-[#e39a89]/10 to-[#d87a6a]/10 p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Booking Confirmed
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Your consultation details are confirmed
                  </p>
                </div>
                <button
                  onClick={handleDownloadReceipt}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#e39a89] to-[#d87a6a] text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
                >
                  <FiDownload className="w-5 h-5" />
                  Download Receipt
                </button>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-6 md:p-8">
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Left Column - Customer Info */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                    Customer Information
                  </h3>

                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-gradient-to-r from-[#e39a89]/10 to-[#d87a6a]/10">
                        <FiUser className="w-6 h-6 text-[#e39a89]" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Full Name
                        </p>
                        <p className="font-bold text-gray-900 dark:text-white">
                          {consultationData?.userName || "Not provided"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-gradient-to-r from-[#e39a89]/10 to-[#d87a6a]/10">
                        <FiMail className="w-6 h-6 text-[#e39a89]" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Email Address
                        </p>
                        <p className="font-bold text-gray-900 dark:text-white">
                          {consultationData?.userEmail || "Not provided"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-gradient-to-r from-[#e39a89]/10 to-[#d87a6a]/10">
                        <FiPhone className="w-6 h-6 text-[#e39a89]" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Phone Number
                        </p>
                        <p className="font-bold text-gray-900 dark:text-white">
                          {consultationData?.userPhone || "Not provided"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Consultation Details */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                    Consultation Details
                  </h3>

                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10">
                        <FiCalendar className="w-6 h-6 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Consultation Date
                        </p>
                        <p className="font-bold text-gray-900 dark:text-white">
                          {formatDate(consultationData?.selectedDate) ||
                            "Not scheduled"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10">
                        <FiClock className="w-6 h-6 text-purple-500" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Consultation Time
                        </p>
                        <p className="font-bold text-gray-900 dark:text-white">
                          {formatTime(consultationData?.selectedTime) ||
                            "Not scheduled"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10">
                        <FiMapPin className="w-6 h-6 text-green-500" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Consultation Type
                        </p>
                        <p className="font-bold text-gray-900 dark:text-white capitalize">
                          {consultationData?.consultationType || "Virtual"}{" "}
                          Consultation
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Summary */}
              <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  Payment Summary
                </h3>

                <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">
                        {consultationData?.planTitle || "Consultation Plan"}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        One-time consultation session
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-[#e39a89]">
                        GH₵{consultationData?.amount?.toFixed(2) || "0.00"}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Amount Paid
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <FiCheckCircle className="w-4 h-4 text-green-500" />
                    <span>Payment completed successfully</span>
                    <span className="ml-auto">
                      {new Date().toLocaleDateString()} at{" "}
                      {new Date().toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  {consultationData?.paymentReference && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Reference:{" "}
                        <span className="font-mono text-gray-900 dark:text-white">
                          {consultationData.paymentReference}
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Card Footer */}
            <div className="bg-gray-50 dark:bg-gray-900 p-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <p className="text-gray-600 dark:text-gray-400">
                    A confirmation email has been sent to{" "}
                    <span className="font-medium text-gray-900 dark:text-white">
                      {consultationData?.userEmail}
                    </span>
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                    Redirecting to your account in {countdown} seconds...
                  </p>
                </div>
                <div className="flex gap-3">
                  <Link
                    href="/"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <FiHome className="w-5 h-5" />
                    Back to Home
                  </Link>
                  <Link
                    href="/my-account"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#e39a89] to-[#d87a6a] text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
                  >
                    View My Bookings
                    <FiChevronRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Prepare for Consultation */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl p-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center mb-4">
                <FiCalendar className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-3">
                Prepare for Consultation
              </h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <FiCheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span>Check your email for meeting link/details</span>
                </li>
                <li className="flex items-start gap-2">
                  <FiCheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span>Prepare your questions in advance</span>
                </li>
                <li className="flex items-start gap-2">
                  <FiCheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span>Test your audio/video equipment</span>
                </li>
              </ul>
            </div>

            {/* Need Help? */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center mb-4">
                <FiPhone className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-3">
                Need Help?
              </h3>
              <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                <p>
                  Contact our support team for any questions about your booking.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <FiMail className="w-4 h-4 text-green-500" />
                    <span>support@hayatebeauty.com</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiPhone className="w-4 h-4 text-green-500" />
                    <span>+233 53 384 2202</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Explore Products */}
            <div className="bg-gradient-to-br from-[#e39a89]/10 to-[#d87a6a]/10 rounded-2xl p-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-[#e39a89] to-[#d87a6a] flex items-center justify-center mb-4">
                <FiShoppingBag className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-3">
                Explore Products
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Browse our premium beauty products while you wait for your
                consultation.
              </p>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 text-[#e39a89] font-medium hover:text-[#d87a6a] transition-colors"
              >
                Shop Now
                <FiChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Redirect Notice */}
          <div className="mt-8 p-4 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-2xl border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                  <span className="text-sm font-bold text-yellow-600 dark:text-yellow-400">
                    !
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Note:</strong> You will be automatically redirected to
                  your account page in {countdown} seconds. If you are not
                  redirected,{" "}
                  <Link
                    href="/my-account"
                    className="text-[#e39a89] font-medium hover:underline"
                  >
                    click here
                  </Link>
                  .
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
