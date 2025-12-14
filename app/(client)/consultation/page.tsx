"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Background from "@/public/images/alexandra-tran-jNPVlv8USYA-unsplash.jpg";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import {
  FiCalendar,
  FiClock,
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCheckCircle,
  FiMessageSquare,
  FiLock,
} from "react-icons/fi";

interface ConsultationPlan {
  id: string;
  title: string;
  duration: string;
  price: number;
  features: string[];
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  consultationType: string;
  notes: string;
}

interface FormErrors {
  plan?: string;
  date?: string;
  time?: string;
  name?: string;
  email?: string;
  phone?: string;
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
  metadata?: Record<string, unknown>;
  callback: (response: PaystackResponse) => void;
  onClose: () => void;
}

const consultationTypes: ConsultationPlan[] = [
  {
    id: "1",
    title: "Skincare Analysis",
    duration: "30 min",
    price: 29,
    features: [
      "Skin type assessment",
      "Product recommendations",
      "Routine plan",
    ],
  },

  {
    id: "2",
    title: "Comprehensive Beauty Plan",
    duration: "60 min",
    price: 79,
    features: ["Full assessment", "Customized plan", "Follow-up session"],
  },
];

const timeSlots = [
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
  "05:00 PM",
];

export default function ConsultationsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    consultationType: "virtual",
    notes: "",
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paystackLoaded, setPaystackLoaded] = useState(false);
  const scriptRef = useRef<HTMLScriptElement | null>(null);

  const paystackPublicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "";

  // Load Paystack script
  useEffect(() => {
    const loadPaystackScript = () => {
      if (document.querySelector('script[src*="paystack"]')) {
        setPaystackLoaded(true);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://js.paystack.co/v1/inline.js";
      script.async = true;
      script.onload = () => {
        setTimeout(() => setPaystackLoaded(true), 0);
      };
      script.onerror = () => {
        console.error("Failed to load Paystack script");
        setTimeout(() => setPaystackLoaded(false), 0);
      };

      scriptRef.current = script;
      document.head.appendChild(script);
    };

    loadPaystackScript();

    return () => {
      if (scriptRef.current && document.head.contains(scriptRef.current)) {
        document.head.removeChild(scriptRef.current);
      }
    };
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    if (formErrors[name as keyof FormErrors]) {
      setFormErrors({
        ...formErrors,
        [name]: "",
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (!selectedPlan) {
      errors.plan = "Please select a consultation plan";
    }
    if (!selectedDate) {
      errors.date = "Please select a date";
    }
    if (!selectedTime) {
      errors.time = "Please select a time slot";
    }
    if (!formData.name.trim()) {
      errors.name = "Full name is required";
    }
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email is invalid";
    }
    if (!formData.phone.trim()) {
      errors.phone = "Phone number is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // After successful payment
  const handlePaymentSuccess = async (reference: PaystackResponse) => {
    const planDetails = getSelectedPlanDetails();

    if (!planDetails) return;

    try {
      // Save booking to Firestore
      await addDoc(collection(db, "consultations"), {
        userId: user?.uid || null,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        consultationType: formData.consultationType,
        notes: formData.notes,
        plan: planDetails.title,
        price: planDetails.price,
        date: selectedDate,
        time: selectedTime,
        paymentReference: reference.reference,
        createdAt: serverTimestamp(),
        status: "booked",
      });

      // Mark payment as successful
      setPaymentSuccess(true);

      // Optional: redirect after a few seconds
      setTimeout(() => {
        router.push("/profile");
      }, 3000);
    } catch (error) {
      console.error("Error saving booking:", error);
      alert(
        "Payment was successful, but saving the booking failed. Contact support."
      );
    }
  };

  const initiatePayment = () => {
    if (!validateForm()) {
      return;
    }

    if (!paystackLoaded) {
      alert("Payment gateway is loading. Please wait a moment.");
      return;
    }

    if (!paystackPublicKey) {
      alert("Payment configuration error. Please contact support.");
      return;
    }

    setIsPaying(true);

    const generateReference = () => {
      return `CONSULT_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 11)}`;
    };

    // Generate unique reference
    const reference = generateReference();

    const selectedPlanDetails = getSelectedPlanDetails();
    if (!selectedPlanDetails) {
      setIsPaying(false);
      return;
    }

    // Paystack configuration
    const paystackConfig: PaystackOptions = {
      key: paystackPublicKey,
      email: formData.email,
      amount: Math.round(selectedPlanDetails.price * 100),
      ref: reference,
      currency: "GHS",
      metadata: {
        customer_name: formData.name,
        customer_phone: formData.phone,
        plan: selectedPlanDetails.title,
        consultation_date: selectedDate,
        consultation_time: selectedTime,
        consultation_type: formData.consultationType,
      },
      callback: (response: PaystackResponse) => {
        if (response.status === "success") {
          console.log("Payment successful:", response);
          handlePaymentSuccess(response);
        } else {
          console.error("Payment failed:", response);
          setIsPaying(false);
          alert(`Payment failed: ${response.message || "Please try again"}`);
        }
      },
      onClose: () => {
        console.log("Payment modal closed");
        setTimeout(() => {
          setIsPaying(false);
        }, 0);
      },
    };

    // Initialize Paystack payment
    try {
      const handler = window.PaystackPop.setup(paystackConfig);
      handler.openIframe();
    } catch (error) {
      console.error("Error opening Paystack:", error);
      setIsPaying(false);
      alert("Error initiating payment. Please try again.");
    }
  };

  const getSelectedPlanDetails = (): ConsultationPlan | undefined => {
    if (!selectedPlan) return undefined;
    return consultationTypes.find((plan) => plan.id === selectedPlan);
  };

  const planDetails = getSelectedPlanDetails();

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 text-center max-w-md mx-4">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
            <FiCheckCircle className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Payment Successful!
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Your consultation has been booked successfully. A confirmation email
            has been sent to{" "}
            <span className="font-medium text-gray-900 dark:text-white">
              {formData.email}
            </span>
          </p>
          <div className="bg-gradient-to-r from-[#e39a89]/10 to-[#d87a6a]/10 rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <FiCalendar className="w-5 h-5 text-[#e39a89]" />
              <span className="font-bold text-gray-900 dark:text-white">
                {selectedDate} at {selectedTime}
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#e39a89]/10 via-white to-[#fcefe9] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-16 md:py-24">
        {/* Background Image Added Here */}
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-100"
            style={{
              backgroundImage: `url(${Background.src})`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#e39a89]/10 via-white/90 to-[#fcefe9]/50 dark:from-gray-900/80 dark:via-gray-800/80 dark:to-gray-900/80" />
        </div>

        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-[#e39a89]/10 to-[#d87a6a]/5 rounded-full blur-3xl" />
        </div>

        <div className="relative container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Personalized
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#e39a89] to-[#d87a6a]">
                Beauty Consultation
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              Get expert advice tailored to your unique beauty needs. Our
              specialists will help you discover the perfect products and
              routines.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6 md:p-8 mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-8">
              Book Your Consultation
            </h2>

            {/* Step 1: Select Plan */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#e39a89] to-[#d87a6a] flex items-center justify-center">
                  <span className="text-white font-bold">1</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Select Consultation Plan
                </h3>
              </div>

              {formErrors.plan && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl">
                  <p className="text-red-600 dark:text-red-400 text-sm">
                    {formErrors.plan}
                  </p>
                </div>
              )}

              <div className="grid md:grid-cols-3 gap-6">
                {consultationTypes.map((plan) => (
                  <div
                    key={plan.id}
                    onClick={() => {
                      setSelectedPlan(plan.id);
                      if (formErrors.plan) {
                        setFormErrors({ ...formErrors, plan: "" });
                      }
                    }}
                    className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 transform hover:-translate-y-1 ${
                      selectedPlan === plan.id
                        ? "border-[#e39a89] bg-gradient-to-br from-[#e39a89]/5 to-transparent shadow-lg shadow-[#e39a89]/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-[#e39a89]/50"
                    }`}
                  >
                    {selectedPlan === plan.id && (
                      <div className="absolute -top-3 -right-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#e39a89] to-[#d87a6a] flex items-center justify-center shadow-lg">
                          <FiCheckCircle className="w-5 h-5 text-white" />
                        </div>
                      </div>
                    )}

                    <div className="text-center mb-4">
                      <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                        {plan.title}
                      </h4>
                      <div className="text-3xl font-bold text-[#e39a89]">
                        GH₵{plan.price}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {plan.duration} session
                      </div>
                    </div>

                    <ul className="space-y-2 mb-6">
                      {plan.features.map((feature, idx) => (
                        <li
                          key={idx}
                          className="flex items-start text-sm text-gray-600 dark:text-gray-400"
                        >
                          <FiCheckCircle className="w-4 h-4 text-[#e39a89] mr-2 mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <div
                      className={`text-center text-sm px-3 py-1.5 rounded-full font-medium ${
                        selectedPlan === plan.id
                          ? "bg-gradient-to-r from-[#e39a89]/20 to-[#d87a6a]/20 text-[#e39a89]"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                      }`}
                    >
                      {selectedPlan === plan.id
                        ? "Selected"
                        : "Click to select"}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 2: Date & Time */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#e39a89] to-[#d87a6a] flex items-center justify-center">
                  <span className="text-white font-bold">2</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Select Date & Time
                </h3>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Date Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    <FiCalendar className="inline w-4 h-4 mr-2" />
                    Select Date *
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      if (formErrors.date) {
                        setFormErrors({ ...formErrors, date: "" });
                      }
                    }}
                    min={new Date().toISOString().split("T")[0]}
                    className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border rounded-xl focus:ring-2 focus:ring-[#e39a89]/20 focus:border-[#e39a89] outline-none transition-all duration-300 ${
                      formErrors.date
                        ? "border-red-300 dark:border-red-700"
                        : "border-gray-200 dark:border-gray-600"
                    }`}
                  />
                  {formErrors.date && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                      {formErrors.date}
                    </p>
                  )}
                </div>

                {/* Time Slots */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    <FiClock className="inline w-4 h-4 mr-2" />
                    Select Time Slot *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {timeSlots.map((time) => (
                      <button
                        key={time}
                        type="button"
                        onClick={() => {
                          setSelectedTime(time);
                          if (formErrors.time) {
                            setFormErrors({ ...formErrors, time: "" });
                          }
                        }}
                        className={`py-3 rounded-xl border-2 text-sm font-medium transition-all duration-300 ${
                          selectedTime === time
                            ? "border-[#e39a89] bg-gradient-to-r from-[#e39a89]/10 to-[#d87a6a]/10 text-[#e39a89]"
                            : formErrors.time
                            ? "border-red-200 dark:border-red-800 text-gray-700 dark:text-gray-300 hover:border-red-300"
                            : "border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-[#e39a89]/50"
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                  {formErrors.time && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                      {formErrors.time}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Step 3: Personal Information */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#e39a89] to-[#d87a6a] flex items-center justify-center">
                  <span className="text-white font-bold">3</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Your Information
                </h3>
              </div>

              <div>
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <FiUser className="inline w-4 h-4 mr-2" />
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border rounded-xl focus:ring-2 focus:ring-[#e39a89]/20 focus:border-[#e39a89] outline-none transition-all duration-300 ${
                        formErrors.name
                          ? "border-red-300 dark:border-red-700"
                          : "border-gray-200 dark:border-gray-600"
                      }`}
                      placeholder="Enter your full name"
                    />
                    {formErrors.name && (
                      <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                        {formErrors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <FiMail className="inline w-4 h-4 mr-2" />
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border rounded-xl focus:ring-2 focus:ring-[#e39a89]/20 focus:border-[#e39a89] outline-none transition-all duration-300 ${
                        formErrors.email
                          ? "border-red-300 dark:border-red-700"
                          : "border-gray-200 dark:border-gray-600"
                      }`}
                      placeholder="Enter your email address"
                    />
                    {formErrors.email && (
                      <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                        {formErrors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <FiPhone className="inline w-4 h-4 mr-2" />
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border rounded-xl focus:ring-2 focus:ring-[#e39a89]/20 focus:border-[#e39a89] outline-none transition-all duration-300 ${
                        formErrors.phone
                          ? "border-red-300 dark:border-red-700"
                          : "border-gray-200 dark:border-gray-600"
                      }`}
                      placeholder="+233 123 456 789"
                    />
                    {formErrors.phone && (
                      <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                        {formErrors.phone}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <FiMapPin className="inline w-4 h-4 mr-2" />
                      Consultation Type
                    </label>
                    <select
                      name="consultationType"
                      value={formData.consultationType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#e39a89]/20 focus:border-[#e39a89] outline-none transition-all duration-300"
                    >
                      <option value="virtual">Virtual (Video Call)</option>
                      <option value="in-store">In-Store Consultation</option>
                    </select>
                  </div>
                </div>

                <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <FiMessageSquare className="inline w-4 h-4 mr-2" />
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#e39a89]/20 focus:border-[#e39a89] outline-none transition-all duration-300"
                    placeholder="Tell us about your skin concerns, preferred products, or specific questions..."
                  />
                </div>

                {/* Summary Card */}
                {selectedPlan && planDetails && (
                  <div className="mb-8 bg-gradient-to-r from-[#e39a89]/5 to-[#d87a6a]/5 border border-[#e39a89]/20 rounded-2xl p-6">
                    <h4 className="font-bold text-gray-900 dark:text-white mb-4">
                      Order Summary
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">
                          {planDetails.title}
                        </span>
                        <span className="font-bold text-gray-900 dark:text-white">
                          GH₵{planDetails.price}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500 dark:text-gray-500">
                          Duration
                        </span>
                        <span className="text-gray-700 dark:text-gray-300">
                          {planDetails.duration}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500 dark:text-gray-500">
                          Date & Time
                        </span>
                        <span className="text-gray-700 dark:text-gray-300">
                          {selectedDate} at {selectedTime}
                        </span>
                      </div>
                      <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between items-center font-bold text-lg">
                          <span>Total Amount</span>
                          <span className="text-[#e39a89]">
                            GH₵{planDetails.price}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Pay Now Button */}
                <button
                  onClick={initiatePayment}
                  disabled={isPaying || !selectedPlan || !paystackLoaded}
                  className="w-full py-4 bg-gradient-to-r from-[#e39a89] to-[#d87a6a] text-white rounded-2xl font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-transform"
                >
                  {isPaying ? (
                    <>
                      <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing Payment...
                    </>
                  ) : !paystackLoaded ? (
                    "Loading Payment Gateway..."
                  ) : (
                    <>
                      <FiLock className="w-5 h-5" />
                      Pay GH₵{planDetails?.price || 0} Now
                    </>
                  )}
                </button>

                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <strong>Secure Payment:</strong> When you click &quot;Pay
                    Now&quot;, Paystack&apos;s secure payment gateway will open.
                    You can pay with card or mobile money. After successful
                    payment, your consultation will be automatically booked.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="bg-gradient-to-br from-[#e39a89]/10 to-[#d87a6a]/10 rounded-3xl p-6 md:p-8 mb-8">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Why Book a Consultation?
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-white/50 dark:bg-gray-800/50">
                  <FiCheckCircle className="w-5 h-5 text-[#e39a89]" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Personalized Recommendations
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Get products tailored to your specific needs
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-white/50 dark:bg-gray-800/50">
                  <FiCheckCircle className="w-5 h-5 text-[#e39a89]" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Expert Guidance
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Learn proper techniques from beauty specialists
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-white/50 dark:bg-gray-800/50">
                  <FiCheckCircle className="w-5 h-5 text-[#e39a89]" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Save Time & Money
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Avoid buying products that don&apos;t work for you
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-white/50 dark:bg-gray-800/50">
                  <FiCheckCircle className="w-5 h-5 text-[#e39a89]" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Follow-up Support
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Get ongoing guidance for your beauty journey
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
