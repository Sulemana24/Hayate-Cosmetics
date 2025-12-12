"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  FiCheckCircle,
  FiLock,
  FiCalendar,
  FiMail,
  FiUser,
  FiPhone,
} from "react-icons/fi";
import {
  collection,
  addDoc,
  serverTimestamp,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

interface ConsultationData {
  userId: string;
  userEmail: string;
  userName: string;
  userPhone: string;
  selectedPlan: string;
  selectedDate: string;
  selectedTime: string;
  consultationType: string;
  notes: string;
  amount: number;
  status: string;
  planTitle: string;
  planDuration: string;
  createdAt: string;
}

interface PaystackResponse {
  status: string;
  message: string;
  reference: string;
  trans: string;
  transaction: string;
  trxref: string;
  currency: string;
  channel: string;
}

// Declare Paystack in global scope
declare global {
  interface Window {
    PaystackPop: {
      setup: (options: PaystackOptions) => { openIframe: () => void };
    };
  }
}

interface PaystackOptions {
  key: string;
  email: string;
  amount: number;
  ref: string;
  currency: string;
  metadata?: Record<string, any>;
  callback: (response: PaystackResponse) => void;
  onClose: () => void;
}

export default function ConsultationPaymentPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [consultationData, setConsultationData] =
    useState<ConsultationData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [tempConsultationId, setTempConsultationId] = useState<string>("");
  const [paystackLoaded, setPaystackLoaded] = useState(false);
  const scriptRef = useRef<HTMLScriptElement | null>(null);
  const hasInitializedRef = useRef(false);

  // Paystack configuration
  const paystackPublicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "";

  useEffect(() => {
    // Prevent multiple initializations
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;

    const initializePayment = async () => {
      // Get consultation data from sessionStorage
      const storedData = sessionStorage.getItem("pendingConsultation");
      if (!storedData) {
        router.push("/consultation");
        return;
      }

      try {
        const data: ConsultationData = JSON.parse(storedData);

        // Use setTimeout to defer state update
        setTimeout(() => {
          setConsultationData(data);
        }, 0);

        // Create a temporary consultation record in Firebase
        await createTempConsultation(data);

        // Load Paystack script
        loadPaystackScript();
      } catch (error) {
        console.error("Error initializing payment:", error);
        router.push("/consultation");
      }
    };

    initializePayment();

    return () => {
      // Clean up script on unmount
      if (scriptRef.current && document.head.contains(scriptRef.current)) {
        document.head.removeChild(scriptRef.current);
      }
    };
  }, [router]);

  const createTempConsultation = async (data: ConsultationData) => {
    try {
      // Create temporary consultation record with pending status
      const consultationRef = await addDoc(collection(db, "consultations"), {
        ...data,
        userId: user?.uid || "guest",
        paymentMethod: "paystack",
        paymentStatus: "pending",
        status: "pending_payment",
        createdAt: serverTimestamp(),
      });

      setTempConsultationId(consultationRef.id);

      // Update sessionStorage with consultation ID
      const updatedData = { ...data, tempId: consultationRef.id };
      sessionStorage.setItem(
        "pendingConsultation",
        JSON.stringify(updatedData)
      );
    } catch (error) {
      console.error("Error creating temp consultation:", error);
      throw error;
    }
  };

  const loadPaystackScript = () => {
    // Check if script is already loaded
    if (document.querySelector('script[src*="paystack"]')) {
      setPaystackLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    script.onload = () => {
      setTimeout(() => {
        setPaystackLoaded(true);
      }, 0);
    };
    script.onerror = () => {
      console.error("Failed to load Paystack script");
      setTimeout(() => {
        setPaystackLoaded(false);
      }, 0);
    };

    scriptRef.current = script;
    document.head.appendChild(script);
  };

  // Payment success callback
  const onPaymentSuccess = async (reference: PaystackResponse) => {
    console.log("Payment successful:", reference);

    try {
      // Update consultation record in Firebase
      if (tempConsultationId && consultationData) {
        const consultationRef = doc(db, "consultations", tempConsultationId);

        await updateDoc(consultationRef, {
          paymentStatus: "completed",
          paymentMethod: "paystack",
          paymentReference: reference.reference,
          paymentDate: serverTimestamp(),
          status: "confirmed",
          confirmedAt: serverTimestamp(),
          transactionId: reference.transaction,
          currency: reference.currency,
          channel: reference.channel,
        });

        // Save to user's consultations if logged in
        if (user?.uid) {
          await addDoc(collection(db, "users", user.uid, "consultations"), {
            consultationId: tempConsultationId,
            ...consultationData,
            paymentMethod: "paystack",
            paymentStatus: "completed",
            paymentReference: reference.reference,
            status: "confirmed",
            bookedAt: serverTimestamp(),
          });
        }
      }

      // Clear session storage
      sessionStorage.removeItem("pendingConsultation");

      // Show success
      setTimeout(() => {
        setPaymentSuccess(true);
        setIsProcessing(false);
      }, 0);

      // Redirect after delay
      setTimeout(() => {
        router.push("/my-account?payment=success");
      }, 3000);
    } catch (error) {
      console.error("Error updating payment status:", error);
      setTimeout(() => {
        setIsProcessing(false);
      }, 0);
      alert(
        "Payment recorded but there was an error updating your booking. Please contact support."
      );
    }
  };

  // Payment failure callback
  const onPaymentFailed = (response: PaystackResponse) => {
    console.error("Payment failed:", response);
    setTimeout(() => {
      setIsProcessing(false);
    }, 0);
    alert(`Payment failed: ${response.message || "Please try again"}`);
  };

  const handlePayment = () => {
    if (!consultationData) {
      alert("Consultation data not loaded. Please refresh the page.");
      return;
    }

    if (!tempConsultationId) {
      alert("Please wait while we prepare your payment...");
      return;
    }

    if (!paystackLoaded) {
      alert(
        "Payment gateway is still loading. Please wait a moment and try again."
      );
      return;
    }

    if (!window.PaystackPop) {
      alert("Payment service unavailable. Please refresh the page.");
      return;
    }

    if (!paystackPublicKey) {
      alert("Payment configuration error. Please contact support.");
      return;
    }

    setIsProcessing(true);

    // Generate unique reference
    const reference = `CONSULT_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 11)}`;

    // Paystack configuration
    const paystackConfig: PaystackOptions = {
      key: paystackPublicKey,
      email: consultationData.userEmail,
      amount: Math.round(consultationData.amount * 100), // Convert to kobo/pesewas and round
      ref: reference,
      currency: "GHS",
      metadata: {
        consultation_id: tempConsultationId,
        customer_name: consultationData.userName,
        customer_phone: consultationData.userPhone,
        plan: consultationData.planTitle,
        consultation_date: consultationData.selectedDate,
        consultation_time: consultationData.selectedTime,
      },
      callback: (response: PaystackResponse) => {
        console.log("Payment callback:", response);
        if (response.status === "success") {
          onPaymentSuccess(response);
        } else {
          onPaymentFailed(response);
        }
      },
      onClose: () => {
        console.log("Payment modal closed");
        setTimeout(() => {
          setIsProcessing(false);
        }, 0);
      },
    };

    // Initialize Paystack payment
    try {
      const handler = window.PaystackPop.setup(paystackConfig);
      handler.openIframe();
    } catch (error) {
      console.error("Error opening Paystack:", error);
      setTimeout(() => {
        setIsProcessing(false);
      }, 0);
      alert("Error initiating payment. Please try again.");
    }
  };

  const formatDate = (dateString: string): string => {
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

  if (!consultationData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#e39a89] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Loading consultation details...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#e39a89]/10 via-white to-[#fcefe9] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 md:py-16">
        <div className="relative container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Secure Payment
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Complete your consultation booking with secure payment
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {paymentSuccess ? (
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                <FiCheckCircle className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Payment Successful!
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Your consultation has been booked successfully. A confirmation
                email has been sent to{" "}
                <span className="font-medium text-gray-900 dark:text-white">
                  {consultationData.userEmail}
                </span>
              </p>
              <div className="bg-gradient-to-r from-[#e39a89]/10 to-[#d87a6a]/10 rounded-2xl p-6 mb-6 max-w-md mx-auto">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <FiCalendar className="w-5 h-5 text-[#e39a89]" />
                  <span className="font-bold text-gray-900 dark:text-white">
                    {formatDate(consultationData.selectedDate)} at{" "}
                    {consultationData.selectedTime}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  We&apos;ll send you a reminder before your consultation
                </p>
              </div>
              <p className="text-gray-500 dark:text-gray-500 text-sm">
                Redirecting to your account...
              </p>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left Column - Payment Details */}
              <div className="lg:col-span-2">
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6 md:p-8 mb-8">
                  {/* Customer Information */}
                  <div className="mb-8 bg-gradient-to-r from-[#e39a89]/5 to-[#d87a6a]/5 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Customer Information
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          <FiUser className="w-4 h-4" />
                          Full Name
                        </label>
                        <div className="px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl">
                          <p className="text-gray-900 dark:text-white">
                            {consultationData.userName}
                          </p>
                        </div>
                      </div>
                      <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          <FiMail className="w-4 h-4" />
                          Email Address
                        </label>
                        <div className="px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl">
                          <p className="text-gray-900 dark:text-white">
                            {consultationData.userEmail}
                          </p>
                        </div>
                      </div>
                      <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          <FiPhone className="w-4 h-4" />
                          Phone Number
                        </label>
                        <div className="px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl">
                          <p className="text-gray-900 dark:text-white">
                            {consultationData.userPhone}
                          </p>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Consultation Type
                        </label>
                        <div className="px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl">
                          <p className="text-gray-900 dark:text-white capitalize">
                            {consultationData.consultationType}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Security Badge */}
                  <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800">
                    <FiLock className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        Secure Payment with Paystack
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Your payment is protected with bank-level security
                      </p>
                    </div>
                  </div>

                  {/* Paystack Info */}
                  <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <strong>Note:</strong> When you click &quot;Pay Now&quot;,
                      Paystack&apos;s secure payment gateway will open. You can
                      pay with card, mobile money, or bank transfer. After
                      successful payment, you&apos;ll be redirected back to this
                      page automatically.
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column - Order Summary */}
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                    Order Summary
                  </h3>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {consultationData.planTitle}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {consultationData.selectedDate} at{" "}
                          {consultationData.selectedTime}
                        </p>
                      </div>
                      <span className="font-bold text-[#e39a89]">
                        GH₵{consultationData.amount.toFixed(2)}
                      </span>
                    </div>

                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600 dark:text-gray-400">
                          Subtotal
                        </span>
                        <span className="text-gray-900 dark:text-white">
                          GH₵{consultationData.amount.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600 dark:text-gray-400">
                          Tax
                        </span>
                        <span className="text-gray-900 dark:text-white">
                          GH₵0.00
                        </span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600 dark:text-gray-400">
                          Processing Fee
                        </span>
                        <span className="text-gray-900 dark:text-white">
                          GH₵0.00
                        </span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex justify-between items-center font-bold text-lg">
                        <span>Total Amount</span>
                        <span className="text-[#e39a89]">
                          GH₵{consultationData.amount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handlePayment}
                    disabled={
                      isProcessing ||
                      !tempConsultationId ||
                      !paystackLoaded ||
                      !consultationData
                    }
                    className="w-full mt-6 py-4 bg-gradient-to-r from-[#e39a89] to-[#d87a6a] text-white rounded-2xl font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                        Processing Payment...
                      </>
                    ) : !tempConsultationId ? (
                      "Preparing..."
                    ) : !paystackLoaded ? (
                      "Loading Gateway..."
                    ) : (
                      <>
                        <FiLock className="w-5 h-5" />
                        Pay GH₵{consultationData.amount.toFixed(2)} Now
                      </>
                    )}
                  </button>

                  <p className="text-center text-sm text-gray-500 dark:text-gray-500 mt-4">
                    By proceeding, you agree to our Terms of Service
                  </p>
                </div>

                {/* Need Help */}
                <div className="bg-gradient-to-br from-[#e39a89]/10 to-[#d87a6a]/10 rounded-3xl p-6">
                  <h4 className="font-bold text-gray-900 dark:text-white mb-3">
                    Need Help?
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    If you encounter any issues with payment, please contact our
                    support team.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <FiMail className="w-4 h-4" />
                      <span>iddrisusulemana665@gmail.com</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <FiPhone className="w-4 h-4" />
                      <span>+233 53 384 2202</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
