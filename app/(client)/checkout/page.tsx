"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FiLock,
  FiCreditCard,
  FiTruck,
  FiMapPin,
  FiUser,
  FiPhone,
  FiMail,
  FiCheck,
  FiChevronRight,
  FiAlertCircle,
} from "react-icons/fi";
import Image from "next/image";
import Link from "next/link";

interface CartItem {
  id: string;
  name: string;
  price: number;
  discountedPrice: number;
  imageUrl: string;
  quantity: number;
  category: string;
}

interface DeliveryOption {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1); // 1: Delivery, 2: Payment, 3: Review
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    region: "",
    postalCode: "",
    deliveryNotes: "",
  });
  const [selectedDelivery, setSelectedDelivery] = useState<string>("standard");
  const [selectedPayment, setSelectedPayment] =
    useState<string>("mobile-money");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Delivery options
  const deliveryOptions: DeliveryOption[] = [
    {
      id: "standard",
      name: "Standard Delivery",
      description: "3-5 business days",
      price: 15.0,
      estimatedDays: "3-5 business days",
    },
    {
      id: "express",
      name: "Express Delivery",
      description: "1-2 business days",
      price: 25.0,
      estimatedDays: "1-2 business days",
    },
    {
      id: "pickup",
      name: "Store Pickup",
      description: "Pick up at our Accra store",
      price: 0.0,
      estimatedDays: "Ready in 2 hours",
    },
  ];

  // Payment methods
  const paymentMethods: PaymentMethod[] = [
    {
      id: "mobile-money",
      name: "Mobile Money",
      icon: "💰",
      description: "Pay with MTN Mobile Money or Vodafone Cash",
    },
    {
      id: "card",
      name: "Credit/Debit Card",
      icon: <FiCreditCard className="w-6 h-6" />,
      description: "Visa, Mastercard, or American Express",
    },
    {
      id: "bank-transfer",
      name: "Bank Transfer",
      icon: "🏦",
      description: "Direct bank transfer",
    },
  ];

  // Ghana regions
  const regions = [
    "Greater Accra",
    "Ashanti",
    "Western",
    "Central",
    "Eastern",
    "Volta",
    "Northern",
    "Upper East",
    "Upper West",
    "Bono",
    "Ahafo",
    "Bono East",
    "Oti",
    "Savannah",
    "North East",
  ];

  // Load cart items
  useEffect(() => {
    const loadCart = () => {
      try {
        // In a real app, you would get this from your cart context or localStorage
        const savedCart = localStorage.getItem("beauty-store-cart");
        if (savedCart) {
          const cart = JSON.parse(savedCart);
          setCartItems(cart);
        }
      } catch (error) {
        console.error("Error loading cart:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, []);

  // Calculate totals
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.discountedPrice * item.quantity,
    0
  );
  const deliveryFee =
    deliveryOptions.find((d) => d.id === selectedDelivery)?.price || 0;
  const total = subtotal + deliveryFee;

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.firstName.trim()) errors.firstName = "First name is required";
    if (!formData.lastName.trim()) errors.lastName = "Last name is required";
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email is invalid";
    }
    if (!formData.phone.trim()) errors.phone = "Phone number is required";
    if (!formData.address.trim()) errors.address = "Address is required";
    if (!formData.city.trim()) errors.city = "City is required";
    if (!formData.region) errors.region = "Region is required";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle step navigation
  const handleNextStep = () => {
    if (step === 1 && !validateForm()) {
      return;
    }
    if (step < 3) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Handle place order
  const handlePlaceOrder = async () => {
    if (!agreeTerms) {
      alert("Please agree to the terms and conditions");
      return;
    }

    try {
      // In a real app, you would send this to your backend
      const orderData = {
        customer: formData,
        items: cartItems,
        delivery: deliveryOptions.find((d) => d.id === selectedDelivery),
        payment: paymentMethods.find((p) => p.id === selectedPayment),
        subtotal,
        deliveryFee,
        total,
        orderDate: new Date().toISOString(),
      };

      // Save order to localStorage (simulating backend)
      localStorage.setItem(
        "beauty-store-last-order",
        JSON.stringify(orderData)
      );

      // Clear cart
      localStorage.removeItem("beauty-store-cart");

      // Redirect to confirmation page
      router.push("/checkout/confirmation");
    } catch (error) {
      console.error("Error placing order:", error);
      alert("There was an error placing your order. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#faf7f5] to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e39a89] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#faf7f5] to-white">
        <div className="container mx-auto px-4 md:px-6 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
              <FiAlertCircle className="w-12 h-12 text-gray-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              Your cart is empty
            </h1>
            <p className="text-gray-600 mb-8">
              Add some beautiful products to your cart before checking out.
            </p>
            <Link
              href="/collections/all"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#e39a89] to-[#d87a6a] text-white px-8 py-3 rounded-xl font-semibold text-lg hover:opacity-90 transition-opacity"
            >
              Continue Shopping
              <FiChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#faf7f5] to-white">
      {/* Progress Bar */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center gap-8">
              {[1, 2, 3].map((stepNumber) => (
                <div key={stepNumber} className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      step >= stepNumber
                        ? "bg-gradient-to-r from-[#e39a89] to-[#d87a6a] text-white"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {step > stepNumber ? (
                      <FiCheck className="w-4 h-4" />
                    ) : (
                      stepNumber
                    )}
                  </div>
                  <span
                    className={`hidden md:inline ${
                      step >= stepNumber
                        ? "text-gray-800 font-medium"
                        : "text-gray-400"
                    }`}
                  >
                    {stepNumber === 1
                      ? "Delivery"
                      : stepNumber === 2
                      ? "Payment"
                      : "Review"}
                  </span>
                  {stepNumber < 3 && (
                    <div
                      className={`hidden md:block w-16 h-0.5 ${
                        step > stepNumber
                          ? "bg-gradient-to-r from-[#e39a89] to-[#d87a6a]"
                          : "bg-gray-200"
                      }`}
                    ></div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 text-gray-600">
              <FiLock className="w-5 h-5" />
              <span className="text-sm font-medium">Secure Checkout</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-2">
            {/* Step 1: Delivery Information */}
            {step === 1 && (
              <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-3">
                  <FiUser className="w-6 h-6 text-[#e39a89]" />
                  Delivery Information
                </h2>
                <p className="text-gray-600 mb-6">
                  Enter your delivery details
                </p>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label
                        className="block text-gray-700 mb-2"
                        htmlFor="firstName"
                      >
                        First Name *
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e39a89] ${
                          formErrors.firstName
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="John"
                      />
                      {formErrors.firstName && (
                        <p className="text-red-500 text-sm mt-1">
                          {formErrors.firstName}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        className="block text-gray-700 mb-2"
                        htmlFor="lastName"
                      >
                        Last Name *
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e39a89] ${
                          formErrors.lastName
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="Doe"
                      />
                      {formErrors.lastName && (
                        <p className="text-red-500 text-sm mt-1">
                          {formErrors.lastName}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label
                        className="block text-gray-700 mb-2"
                        htmlFor="email"
                      >
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e39a89] ${
                          formErrors.email
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="john@example.com"
                      />
                      {formErrors.email && (
                        <p className="text-red-500 text-sm mt-1">
                          {formErrors.email}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        className="block text-gray-700 mb-2"
                        htmlFor="phone"
                      >
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e39a89] ${
                          formErrors.phone
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="024 123 4567"
                      />
                      {formErrors.phone && (
                        <p className="text-red-500 text-sm mt-1">
                          {formErrors.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label
                      className="block text-gray-700 mb-2"
                      htmlFor="address"
                    >
                      Delivery Address *
                    </label>
                    <textarea
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      rows={3}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e39a89] ${
                        formErrors.address
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="House number, Street name, Landmark"
                    />
                    {formErrors.address && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.address}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label
                        className="block text-gray-700 mb-2"
                        htmlFor="city"
                      >
                        City/Town *
                      </label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e39a89] ${
                          formErrors.city ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="Accra"
                      />
                      {formErrors.city && (
                        <p className="text-red-500 text-sm mt-1">
                          {formErrors.city}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        className="block text-gray-700 mb-2"
                        htmlFor="region"
                      >
                        Region *
                      </label>
                      <select
                        id="region"
                        name="region"
                        value={formData.region}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e39a89] ${
                          formErrors.region
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      >
                        <option value="">Select Region</option>
                        {regions.map((region) => (
                          <option key={region} value={region}>
                            {region}
                          </option>
                        ))}
                      </select>
                      {formErrors.region && (
                        <p className="text-red-500 text-sm mt-1">
                          {formErrors.region}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        className="block text-gray-700 mb-2"
                        htmlFor="postalCode"
                      >
                        Postal Code
                      </label>
                      <input
                        type="text"
                        id="postalCode"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e39a89]"
                        placeholder="GA123"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      className="block text-gray-700 mb-2"
                      htmlFor="deliveryNotes"
                    >
                      Delivery Notes (Optional)
                    </label>
                    <textarea
                      id="deliveryNotes"
                      name="deliveryNotes"
                      value={formData.deliveryNotes}
                      onChange={handleInputChange}
                      rows={2}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e39a89]"
                      placeholder="Special instructions for delivery"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Delivery & Payment Options */}
            {step === 2 && (
              <div className="space-y-8">
                {/* Delivery Options */}
                <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                    <FiTruck className="w-6 h-6 text-[#e39a89]" />
                    Delivery Method
                  </h2>

                  <div className="space-y-4">
                    {deliveryOptions.map((option) => (
                      <div
                        key={option.id}
                        onClick={() => setSelectedDelivery(option.id)}
                        className={`border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 ${
                          selectedDelivery === option.id
                            ? "border-[#e39a89] bg-[#e39a89]/5"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-gray-800">
                              {option.name}
                            </h3>
                            <p className="text-gray-600 text-sm mt-1">
                              {option.description}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-gray-800">
                              ₵{option.price.toFixed(2)}
                            </div>
                            <div className="text-gray-500 text-sm">
                              {option.estimatedDays}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment Methods */}
                <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                    <FiCreditCard className="w-6 h-6 text-[#e39a89]" />
                    Payment Method
                  </h2>

                  <div className="space-y-4">
                    {paymentMethods.map((method) => (
                      <div
                        key={method.id}
                        onClick={() => setSelectedPayment(method.id)}
                        className={`border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 ${
                          selectedPayment === method.id
                            ? "border-[#e39a89] bg-[#e39a89]/5"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-2xl">
                            {method.icon}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-800">
                              {method.name}
                            </h3>
                            <p className="text-gray-600 text-sm mt-1">
                              {method.description}
                            </p>
                          </div>
                          <div
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                              selectedPayment === method.id
                                ? "border-[#e39a89] bg-[#e39a89]"
                                : "border-gray-300"
                            }`}
                          >
                            {selectedPayment === method.id && (
                              <FiCheck className="w-3 h-3 text-white" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Payment Security */}
                  <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FiLock className="w-5 h-5 text-green-500" />
                      <div>
                        <p className="font-medium text-gray-800">
                          Secure Payment
                        </p>
                        <p className="text-gray-600 text-sm">
                          Your payment information is encrypted and secure
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Review Order */}
            {step === 3 && (
              <div className="space-y-8">
                {/* Order Summary */}
                <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">
                    Review Your Order
                  </h2>

                  {/* Delivery Information Review */}
                  <div className="mb-8">
                    <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                      <FiUser className="w-5 h-5" />
                      Delivery Details
                    </h3>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="font-medium text-gray-800">
                        {formData.firstName} {formData.lastName}
                      </p>
                      <p className="text-gray-600 mt-1">{formData.email}</p>
                      <p className="text-gray-600">{formData.phone}</p>
                      <p className="text-gray-600 mt-2">{formData.address}</p>
                      <p className="text-gray-600">
                        {formData.city}, {formData.region} {formData.postalCode}
                      </p>
                      <button
                        onClick={() => setStep(1)}
                        className="mt-3 text-[#e39a89] hover:text-[#d87a6a] font-medium text-sm"
                      >
                        Edit Details
                      </button>
                    </div>
                  </div>

                  {/* Delivery Method Review */}
                  <div className="mb-8">
                    <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                      <FiTruck className="w-5 h-5" />
                      Delivery Method
                    </h3>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-gray-800">
                            {
                              deliveryOptions.find(
                                (d) => d.id === selectedDelivery
                              )?.name
                            }
                          </p>
                          <p className="text-gray-600 text-sm mt-1">
                            {
                              deliveryOptions.find(
                                (d) => d.id === selectedDelivery
                              )?.estimatedDays
                            }
                          </p>
                        </div>
                        <button
                          onClick={() => setStep(2)}
                          className="text-[#e39a89] hover:text-[#d87a6a] font-medium text-sm"
                        >
                          Change
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Payment Method Review */}
                  <div className="mb-8">
                    <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                      <FiCreditCard className="w-5 h-5" />
                      Payment Method
                    </h3>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-gray-800">
                            {
                              paymentMethods.find(
                                (p) => p.id === selectedPayment
                              )?.name
                            }
                          </p>
                          <p className="text-gray-600 text-sm mt-1">
                            {
                              paymentMethods.find(
                                (p) => p.id === selectedPayment
                              )?.description
                            }
                          </p>
                        </div>
                        <button
                          onClick={() => setStep(2)}
                          className="text-[#e39a89] hover:text-[#d87a6a] font-medium text-sm"
                        >
                          Change
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Terms & Conditions */}
                  <div className="mt-8">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="agreeTerms"
                        checked={agreeTerms}
                        onChange={(e) => setAgreeTerms(e.target.checked)}
                        className="mt-1"
                      />
                      <label
                        htmlFor="agreeTerms"
                        className="text-gray-700 text-sm"
                      >
                        I agree to the{" "}
                        <Link
                          href="/terms"
                          className="text-[#e39a89] hover:underline"
                        >
                          Terms and Conditions
                        </Link>{" "}
                        and{" "}
                        <Link
                          href="/privacy"
                          className="text-[#e39a89] hover:underline"
                        >
                          Privacy Policy
                        </Link>
                        . I understand that my order is subject to verification
                        and confirmation.
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              {step > 1 ? (
                <button
                  onClick={handlePrevStep}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
              ) : (
                <Link
                  href="/cart"
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Back to Cart
                </Link>
              )}

              {step < 3 ? (
                <button
                  onClick={handleNextStep}
                  className="px-8 py-3 bg-gradient-to-r from-[#e39a89] to-[#d87a6a] text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                >
                  Continue to {step === 1 ? "Delivery & Payment" : "Review"}
                </button>
              ) : (
                <button
                  onClick={handlePlaceOrder}
                  disabled={!agreeTerms}
                  className="px-8 py-3 bg-gradient-to-r from-[#e39a89] to-[#d87a6a] text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Place Order • ₵{total.toFixed(2)}
                </button>
              )}
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-800 mb-6">
                Order Summary
              </h2>

              {/* Cart Items */}
              <div className="space-y-4 mb-6 max-h-80 overflow-y-auto pr-2">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 pb-4 border-b border-gray-100 last:border-0"
                  >
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          width={80}
                          height={80}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-400 text-xs">
                            No image
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-800 line-clamp-1">
                        {item.name}
                      </h3>
                      <p className="text-gray-500 text-sm mt-1">
                        Qty: {item.quantity}
                      </p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="font-semibold text-gray-800">
                          ₵{(item.discountedPrice * item.quantity).toFixed(2)}
                        </span>
                        {item.discountedPrice < item.price && (
                          <span className="text-sm line-through text-gray-400">
                            ₵{(item.price * item.quantity).toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Totals */}
              <div className="space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>₵{subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Delivery</span>
                  <span>₵{deliveryFee.toFixed(2)}</span>
                </div>

                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-lg font-bold text-gray-800">
                    <span>Total</span>
                    <span>₵{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Security & Guarantees */}
              <div className="mt-8 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <FiLock className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 text-sm">
                      Secure Payment
                    </p>
                    <p className="text-gray-500 text-xs">
                      256-bit SSL encryption
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <FiCheck className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 text-sm">
                      Quality Guarantee
                    </p>
                    <p className="text-gray-500 text-xs">
                      100% authentic products
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <FiTruck className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 text-sm">
                      Reliable Delivery
                    </p>
                    <p className="text-gray-500 text-xs">
                      Track your order in real-time
                    </p>
                  </div>
                </div>
              </div>

              {/* Need Help */}
              <div className="mt-8 p-4 bg-gray-50 rounded-xl">
                <p className="text-gray-700 text-sm">
                  Need help?{" "}
                  <Link
                    href="/contact"
                    className="text-[#e39a89] hover:underline font-medium"
                  >
                    Contact our support team
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
