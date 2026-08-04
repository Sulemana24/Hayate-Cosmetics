"use client";

import { useState, useEffect, useRef } from "react";
import { getAuth } from "firebase/auth";
import { db } from "@/lib/firebase";
import { useToast } from "@/components/ToastProvider";
import { collection, getDocs } from "firebase/firestore";
import { useRouter } from "next/navigation";

import {
  FiLock,
  FiCreditCard,
  FiTruck,
  FiCheckCircle,
  FiArrowLeft,
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
} from "react-icons/fi";

interface CartItem {
  id: string;
  productId: string;
  name: string;
  imageUrl?: string;
  price: number;
  quantity: number;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  regions: string;
  locality: string;
  country: string;
  paymentMethod: "card" | "paypal" | "mobile_money";
  saveInfo: boolean;
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

interface CreatedOrder {
  orderId: string;
  orderCode: string;
  amount: number;
  currency: string;
}

interface CreateOrderResponse {
  success: boolean;
  orderId?: string;
  orderCode?: string;
  amount?: number;
  currency?: string;
  message?: string;
  error?: string;
}

declare global {
  interface Window {
    PaystackPop: {
      setup: (options: PaystackOptions) => {
        openIframe: () => void;
      };
    };
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const auth = getAuth();
  const { showToast } = useToast();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const [activeStep, setActiveStep] = useState(1);

  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const [orderId, setOrderId] = useState("");

  const [tempOrderId, setTempOrderId] = useState("");

  const [paystackLoaded, setPaystackLoaded] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [creatingOrder, setCreatingOrder] = useState(false);

  const scriptRef = useRef<HTMLScriptElement | null>(null);

  const tempOrderIdRef = useRef<string>("");

  const handlePaymentCallbackRef = useRef<
    ((response: PaystackResponse) => void) | null
  >(null);

  const paystackPublicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "";

  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    regions: "",
    locality: "",
    country: "Ghana",
    paymentMethod: "mobile_money",
    saveInfo: true,
  });

  const totalPrice = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );

  const shippingFee = 0;

  const finalTotal = totalPrice + shippingFee;

  const itemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    tempOrderIdRef.current = tempOrderId;
  }, [tempOrderId]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setAuthReady(true);

      if (user) {
        setCurrentUserId(user.uid);

        setFormData((prev) => ({
          ...prev,
          email: user.email || prev.email,
        }));
      } else {
        setCurrentUserId(null);
        router.push("/login?redirect=/checkout");
      }
    });

    return () => unsubscribe();
  }, [router, auth]);

  useEffect(() => {
    if (!currentUserId) {
      setLoading(false);
      return;
    }

    const fetchCart = async () => {
      try {
        setLoading(true);

        const cartRef = collection(db, "users", currentUserId, "cart");

        const snapshot = await getDocs(cartRef);

        const items: CartItem[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data() as Omit<CartItem, "id">;

          return {
            id: docSnap.id,
            ...data,
          };
        });

        setCartItems(items);
      } catch (error) {
        showToast({
          type: "error",
          message: "Failed to load cart items. Please try again.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [currentUserId, showToast]);

  const loadPaystackScript = () => {
    if (document.querySelector('script[src*="paystack"]')) {
      setPaystackLoaded(true);
      return;
    }

    const script = document.createElement("script");

    script.src = "https://js.paystack.co/v1/inline.js";

    script.async = true;

    script.onload = () => {
      setPaystackLoaded(true);
    };

    script.onerror = () => {
      setPaystackLoaded(false);

      showToast({
        type: "error",
        message: "Failed to load payment gateway. Please try again later.",
      });
    };

    scriptRef.current = script;

    document.head.appendChild(script);
  };

  const createTempOrder = async (): Promise<CreatedOrder> => {
    if (creatingOrder) {
      throw new Error("An order is already being prepared.");
    }

    const user = auth.currentUser;

    if (!user) {
      throw new Error("Your session has expired. Please log in again.");
    }

    try {
      setCreatingOrder(true);

      const idToken = await user.getIdToken(true);

      if (!idToken) {
        throw new Error("Unable to authenticate your session.");
      }

      const payload = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        regions: formData.regions.trim(),
        locality: formData.locality.trim(),
        country: formData.country,
      };

      const response = await fetch("/api/checkout/create-order", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${idToken}`,
        },

        credentials: "same-origin",

        cache: "no-store",

        body: JSON.stringify(payload),
      });

      const responseText = await response.text();

      let data: CreateOrderResponse | null = null;

      try {
        data = responseText ? JSON.parse(responseText) : null;
      } catch {
        throw new Error(
          `Checkout server returned an invalid response (${response.status}).`,
        );
      }

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            `Unable to create order. Server returned ${response.status}.`,
        );
      }

      if (!data?.success) {
        throw new Error(
          data?.message || "The server could not create your order.",
        );
      }

      if (!data.orderId) {
        throw new Error("The server created an invalid order.");
      }

      const createdOrder: CreatedOrder = {
        orderId: String(data.orderId),
        orderCode: String(data.orderCode || data.orderId),
        amount: Number(data.amount),
        currency: data.currency || "GHS",
      };

      if (!Number.isFinite(createdOrder.amount) || createdOrder.amount <= 0) {
        throw new Error("Invalid order amount returned by the server.");
      }

      setTempOrderId(createdOrder.orderId);

      tempOrderIdRef.current = createdOrder.orderId;

      return createdOrder;
    } catch (error) {
      if (error instanceof TypeError && error.message === "Failed to fetch") {
        throw new Error(
          "Unable to connect to the checkout server. Make sure your Next.js server is running and that /api/checkout/create-order exists.",
        );
      }

      throw error;
    } finally {
      setCreatingOrder(false);
    }
  };

  const verifyPayment = async (reference: string, orderId: string) => {
    if (!auth.currentUser) {
      throw new Error("Your session has expired. Please log in again.");
    }

    const idToken = await auth.currentUser.getIdToken();

    const response = await fetch("/api/checkout/verify-payment", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",

        Authorization: `Bearer ${idToken}`,
      },

      body: JSON.stringify({
        reference,
        orderId,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Payment verification failed.");
    }

    return data;
  };

  const onPaymentSuccess = async (
    response: PaystackResponse,
    orderId: string,
  ) => {
    if (!orderId) {
      showToast({
        type: "error",
        message:
          "Payment was successful but we could not identify your order. Please contact support.",
      });

      setProcessing(false);
      return;
    }

    try {
      setProcessing(true);

      await verifyPayment(response.reference, orderId);

      setPaymentSuccess(true);

      setProcessing(false);

      setOrderId(orderId);

      setCartItems([]);

      showToast({
        type: "success",
        message: "Payment successful! Your order has been confirmed.",
      });

      setTimeout(() => {
        router.push("/orders?payment=success");
      }, 3000);
    } catch (error) {
      showToast({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Payment was successful but we could not confirm your order. Please contact support.",
      });

      setProcessing(false);
    }
  };

  const onPaymentFailed = (response: PaystackResponse) => {
    showToast({
      type: "error",
      message: "Payment failed or was cancelled. Please try again.",
    });

    setProcessing(false);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;

      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleNextStep = async () => {
    if (activeStep === 1) {
      const requiredFields = [
        "firstName",
        "lastName",
        "email",
        "phone",
        "regions",
        "city",
        "locality",
      ];

      const missingFields = requiredFields.filter(
        (field) => !formData[field as keyof FormData],
      );

      if (missingFields.length > 0) {
        showToast({
          type: "error",
          message: "Please complete all required shipping information.",
        });

        return;
      }

      loadPaystackScript();

      setActiveStep(2);
    }
  };

  const handlePreviousStep = () => {
    if (activeStep > 1) {
      setActiveStep(activeStep - 1);
    }
  };

  const handlePayment = async () => {
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.phone ||
      !formData.regions ||
      !formData.city ||
      !formData.locality
    ) {
      showToast({
        type: "error",
        message: "Please complete all required shipping information.",
      });

      setActiveStep(1);

      return;
    }

    if (!auth.currentUser) {
      showToast({
        type: "error",
        message: "You must be logged in to proceed with payment.",
      });

      router.push("/login?redirect=/checkout");

      return;
    }

    if (!paystackLoaded) {
      showToast({
        type: "error",
        message: "Payment gateway is loading. Please wait.",
      });

      loadPaystackScript();

      return;
    }

    if (!window.PaystackPop) {
      showToast({
        type: "error",
        message: "Payment gateway is not available. Please try again later.",
      });

      return;
    }

    if (!paystackPublicKey) {
      showToast({
        type: "error",
        message: "Payment configuration error.",
      });

      return;
    }

    if (processing) {
      return;
    }

    setProcessing(true);

    try {
      const createdOrder = await createTempOrder();

      const serverOrderId = createdOrder.orderId;

      const callbackFn = async (response: PaystackResponse) => {
        if (response.status === "success") {
          await onPaymentSuccess(response, serverOrderId);
        } else {
          onPaymentFailed(response);
        }
      };

      handlePaymentCallbackRef.current = callbackFn;

      const paystackConfig: PaystackOptions = {
        key: paystackPublicKey,

        email: formData.email,

        amount: Math.round(createdOrder.amount * 100),

        ref: serverOrderId,

        currency: createdOrder.currency,

        metadata: {
          order_id: serverOrderId,

          order_code: createdOrder.orderCode,

          customer_name: `${formData.firstName} ${formData.lastName}`,

          customer_phone: formData.phone,

          items_count: itemCount,

          shipping_city: formData.city,

          shipping_region: formData.regions,
        },

        callback: (response: PaystackResponse) => {
          if (handlePaymentCallbackRef.current) {
            handlePaymentCallbackRef.current(response);
          } else {
            if (response.status === "success") {
              onPaymentSuccess(response, tempOrderIdRef.current);
            } else {
              onPaymentFailed(response);
            }
          }
        },

        onClose: () => {
          setProcessing(false);
        },
      };

      const handler = window.PaystackPop.setup(paystackConfig);

      handler.openIframe();
    } catch (error) {
      setProcessing(false);

      showToast({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Error preparing payment. Please try again.",
      });
    }
  };

  useEffect(() => {
    return () => {
      handlePaymentCallbackRef.current = null;
    };
  }, []);

  const steps = [
    {
      id: 1,
      name: "Shipping",
      icon: <FiTruck />,
    },
    {
      id: 2,
      name: "Review & Pay",
      icon: <FiCreditCard />,
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#d87a6a] border-t-transparent rounded-full animate-spin mx-auto mb-4" />

          <p className="text-gray-600 dark:text-gray-400">
            Loading your cart...
          </p>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0 && !paymentSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <div className="text-center max-w-md">
          <FiTruck className="w-16 h-16 sm:w-24 sm:h-24 text-gray-300 dark:text-gray-700 mx-auto mb-4 sm:mb-6" />

          <h1 className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
            Your cart is empty
          </h1>

          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base mb-6 sm:mb-8">
            Add items to your cart before proceeding to checkout.
          </p>

          <button
            onClick={() => router.push("/cart")}
            className="px-6 py-2.5 sm:px-8 sm:py-3 bg-[#d87a6a] text-white rounded-lg sm:rounded-xl hover:bg-[#c76a5a] transition-colors font-medium text-sm sm:text-base w-full sm:w-auto cursor-pointer"
          >
            Return to Cart
          </button>
        </div>
      </div>
    );
  }

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 sm:py-12 md:py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl shadow-xl p-6 sm:p-8 text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
              <FiCheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
              Payment Successful!
            </h2>

            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base mb-2">
              Your order has been placed successfully.
            </p>

            {orderId && (
              <p className="text-xs sm:text-sm text-gray-500 mb-6">
                Order ID: {orderId}
              </p>
            )}

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <button
                onClick={() => router.push("/orders")}
                className="px-4 py-2.5 sm:px-6 sm:py-3 bg-[#d87a6a] text-white rounded-lg hover:bg-[#c76a5a] transition-colors text-sm sm:text-base w-full sm:w-auto"
              >
                View Orders
              </button>

              <button
                onClick={() => router.push("/")}
                className="px-4 py-2.5 sm:px-6 sm:py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm sm:text-base w-full sm:w-auto"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <section className="relative bg-gradient-to-br from-[#d87a6a]/10 via-white to-[#fcefe9] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 sm:py-12 md:py-16 px-4">
        <div className="relative max-w-7xl mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
              {activeStep === 1 ? "Shipping Information" : "Review & Pay"}
            </h1>

            <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
              {activeStep === 1
                ? "Enter your shipping details to continue"
                : "Review your order and complete payment"}
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 sm:mb-12 px-2">
            <div className="flex items-center justify-center max-w-md mx-auto">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 ${
                        activeStep >= step.id
                          ? "bg-[#d87a6a] border-[#d87a6a] text-white"
                          : "border-gray-300 dark:border-gray-700"
                      }`}
                    >
                      {step.icon}
                    </div>

                    <p className="text-xs sm:text-sm font-medium mt-2 text-gray-700 dark:text-gray-300">
                      {step.name}
                    </p>
                  </div>

                  {index < steps.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-2 ${
                        activeStep > step.id
                          ? "bg-[#d87a6a]"
                          : "bg-gray-300 dark:bg-gray-700"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-lg sm:shadow-xl p-4 sm:p-6 md:p-8 mb-6 sm:mb-8">
                {activeStep === 1 && (
                  <div>
                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
                      Shipping Information
                    </h2>

                    <div className="mb-6 sm:mb-8 bg-gradient-to-r from-[#d87a6a]/5 to-[#c76a5a]/5 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
                        Contact Information
                      </h3>

                      <div className="grid md:grid-cols-2 gap-3 sm:gap-4">
                        <div>
                          <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
                            <FiUser />
                            First Name *
                          </label>

                          <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-700 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-[#d87a6a] focus:border-transparent"
                            placeholder="Enter your first name"
                            required
                          />
                        </div>

                        <div>
                          <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
                            <FiUser />
                            Last Name *
                          </label>

                          <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-700 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-[#d87a6a] focus:border-transparent"
                            placeholder="Enter your last name"
                            required
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
                            <FiMail />
                            Email Address *
                          </label>

                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-700 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-[#d87a6a] focus:border-transparent"
                            required
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
                            <FiPhone />
                            Phone Number *
                          </label>

                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-700 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-[#d87a6a] focus:border-transparent"
                            placeholder="0543456789"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-[#d87a6a]/5 to-[#c76a5a]/5 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
                        Shipping Address
                      </h3>

                      <div className="grid md:grid-cols-2 gap-3 sm:gap-4">
                        <div className="md:col-span-2">
                          <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
                            <FiMapPin />
                            Region *
                          </label>

                          <select
                            name="regions"
                            value={formData.regions}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-700 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-[#d87a6a] focus:border-transparent cursor-pointer"
                            required
                          >
                            <option value="">Select Region</option>

                            {[
                              "Ahafo",
                              "Ashanti",
                              "Bono",
                              "Bono East",
                              "Central",
                              "Eastern",
                              "Greater Accra",
                              "North East",
                              "Northern",
                              "Oti",
                              "Savannah",
                              "Upper East",
                              "Upper West",
                              "Volta",
                              "Western",
                              "Western North",
                            ].map((region) => (
                              <option
                                key={region}
                                value={region}
                                className="text-black"
                              >
                                {region}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
                            City/Town *
                          </label>

                          <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-700 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-[#d87a6a] focus:border-transparent"
                            placeholder="e.g Accra, Kumasi, Tamale"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
                            Area/Locality *
                          </label>

                          <input
                            type="text"
                            name="locality"
                            value={formData.locality}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-700 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-[#d87a6a] focus:border-transparent"
                            placeholder="e.g Dungu, Abuakwa, Madina"
                            required
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
                            Detailed Address (optional)
                          </label>

                          <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-700 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-[#d87a6a] focus:border-transparent"
                            placeholder="House number, Street name, Landmark"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeStep === 2 && (
                  <div>
                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
                      Review & Pay
                    </h2>

                    <div className="space-y-4 sm:space-y-6">
                      <div className="bg-gradient-to-r from-[#d87a6a]/5 to-[#c76a5a]/5 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
                          Shipping Information
                        </h3>

                        <div className="grid md:grid-cols-2 gap-3 sm:gap-4">
                          <div>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              Name
                            </p>
                            <p className="font-medium">
                              {formData.firstName} {formData.lastName}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              Email
                            </p>
                            <p className="font-medium">{formData.email}</p>
                          </div>

                          <div>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              Phone
                            </p>
                            <p className="font-medium">{formData.phone}</p>
                          </div>

                          <div>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              Region
                            </p>
                            <p className="font-medium">{formData.regions}</p>
                          </div>

                          <div>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              City
                            </p>
                            <p className="font-medium">{formData.city}</p>
                          </div>

                          <div>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              Area
                            </p>
                            <p className="font-medium">{formData.locality}</p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                          Order Items ({itemCount})
                        </h3>

                        <div className="space-y-3">
                          {cartItems.map((item) => (
                            <div
                              key={item.id}
                              className="flex justify-between items-center bg-white dark:bg-gray-700 p-4 rounded-xl"
                            >
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {item.name}
                                </p>

                                <p className="text-sm text-gray-500">
                                  Qty: {item.quantity} × ₵
                                  {item.price.toFixed(2)}
                                </p>
                              </div>

                              <p className="font-semibold">
                                ₵{(item.price * item.quantity).toFixed(2)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row justify-between gap-3 mt-6 pt-6 border-t">
                  {activeStep === 2 ? (
                    <button
                      onClick={handlePreviousStep}
                      disabled={processing}
                      className="flex items-center justify-center px-4 py-3 text-gray-700 dark:text-gray-300 w-full sm:w-auto cursor-pointer disabled:opacity-50"
                    >
                      <FiArrowLeft className="mr-2" />
                      Back to Shipping
                    </button>
                  ) : (
                    <button
                      onClick={() => router.push("/cart")}
                      className="flex items-center justify-center px-4 py-3 text-gray-700 dark:text-gray-300 w-full sm:w-auto cursor-pointer"
                    >
                      <FiArrowLeft className="mr-2" />
                      Return to Cart
                    </button>
                  )}

                  {activeStep === 1 ? (
                    <button
                      onClick={handleNextStep}
                      className="px-6 py-3 bg-[#d87a6a] text-white rounded-xl hover:bg-[#c76a5a] font-medium w-full sm:w-auto cursor-pointer"
                    >
                      Review Order
                    </button>
                  ) : (
                    <button
                      onClick={handlePayment}
                      disabled={processing || !paystackLoaded}
                      className="px-6 py-3 bg-gradient-to-r from-[#d87a6a] to-[#c76a5a] text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 font-medium shadow-lg w-full sm:w-auto cursor-pointer"
                    >
                      {processing ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />

                          <span>Processing...</span>
                        </>
                      ) : !paystackLoaded ? (
                        "Loading Gateway..."
                      ) : (
                        <>
                          <FiLock />

                          <span>Pay ₵{finalTotal.toFixed(2)} Now</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                <FiLock className="mr-2" />
                Your payment information is secure and encrypted
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  Order Summary
                </h3>

                <div className="space-y-4 mb-6 max-h-80 overflow-y-auto pr-2">
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center pb-4 border-b"
                    >
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {item.name}
                        </p>

                        <p className="text-sm text-gray-500">
                          Qty: {item.quantity}
                        </p>
                      </div>

                      <p className="font-semibold">
                        ₵{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 border-t pt-4">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>

                    <span className="font-medium">
                      ₵{totalPrice.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>

                    <span className="font-medium">
                      ₵{shippingFee.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between text-lg font-bold border-t pt-4">
                    <span>Total Amount</span>

                    <span className="text-2xl text-[#d87a6a]">
                      ₵{finalTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-[#d87a6a]/10 to-[#c76a5a]/10 rounded-2xl p-6">
                <h4 className="font-bold text-gray-900 dark:text-white mb-3">
                  Need Help?
                </h4>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  If you encounter any issues with payment or have questions
                  about your order, please contact our support team.
                </p>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <FiMail />
                    <span>yussifhayate@icloud.com</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <FiPhone />
                    <span>0549188561</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
