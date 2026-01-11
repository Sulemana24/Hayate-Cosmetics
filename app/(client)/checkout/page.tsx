"use client";

import { useState, useEffect, useRef } from "react";
import { getAuth } from "firebase/auth";
import { db } from "@/lib/firebase";
import { QueryDocumentSnapshot, DocumentData } from "firebase/firestore";
import {
  collection,
  getDocs,
  doc,
  writeBatch,
  addDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  FieldValue,
  increment,
} from "firebase/firestore";
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

export default function CheckoutPage() {
  const router = useRouter();
  const auth = getAuth();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(1);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [orderId, setOrderId] = useState<string>("");
  const [tempOrderId, setTempOrderId] = useState<string>("");
  const [paystackLoaded, setPaystackLoaded] = useState(false);
  const scriptRef = useRef<HTMLScriptElement | null>(null);
  const tempOrderIdRef = useRef<string>("");
  const currentUserIdRef = useRef<string>("");
  const cartItemsRef = useRef<CartItem[]>([]);

  const paystackPublicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "";

  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    regions: "",
    city: "",
    locality: "",
    country: "Ghana",
    paymentMethod: "mobile_money",
    saveInfo: true,
  });

  const totalPrice = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  const shippingFee = 0;
  const finalTotal = totalPrice + shippingFee;

  const itemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    tempOrderIdRef.current = tempOrderId;
  }, [tempOrderId]);

  useEffect(() => {
    currentUserIdRef.current = currentUserId || "";
  }, [currentUserId]);

  useEffect(() => {
    cartItemsRef.current = cartItems;
  }, [cartItems]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUserId(user.uid);
        currentUserIdRef.current = user.uid;
        setFormData((prev) => ({
          ...prev,
          email: user.email || "",
        }));
      } else {
        router.push("/login?redirect=/checkout");
      }
    });

    return () => unsubscribe();
  }, [router]);

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

        const items = snapshot.docs.map((docSnap) => {
          const { id, ...rest } = docSnap.data() as CartItem;
          return {
            id: docSnap.id,
            ...rest,
          };
        });

        setCartItems(items);
        cartItemsRef.current = items;
      } catch (err) {
        console.error("Failed to fetch cart:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [currentUserId]);

  const loadPaystackScript = () => {
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

  const createTempOrder = async (): Promise<string> => {
    if (!currentUserId) {
      throw new Error("User must be logged in to create an order");
    }

    const now = serverTimestamp();
    const orderCode = `HAY-${Math.floor(10000 + Math.random() * 90000)}`;

    const orderData = {
      userId: currentUserId,
      items: cartItemsRef.current,
      subtotal: totalPrice,
      shippingFee,
      tax: 0,
      totalAmount: finalTotal,

      status: "pending_payment",
      paymentStatus: "pending",
      paymentMethod: "paystack",

      shippingAddress: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        address: formData.address,
        city: formData.city,
        region: formData.regions,
        locality: formData.locality,
        country: formData.country,
        phone: formData.phone,
        email: formData.email,
      },

      customerName: `${formData.firstName} ${formData.lastName}`,
      customerEmail: formData.email,
      customerPhone: formData.phone,

      orderCode,
      createdAt: now,
      updatedAt: now,
    };

    const userOrderRef = doc(collection(db, "users", currentUserId, "orders"));

    const orderId = userOrderRef.id;

    await setDoc(userOrderRef, orderData);

    await setDoc(doc(db, "orders", orderId), {
      ...orderData,
      userId: currentUserId,
    });

    setTempOrderId(orderId);
    tempOrderIdRef.current = orderId;

    return orderId;
  };

  const updateOrderAfterPayment = async (
    paymentReference: string,
    paymentResponse: PaystackResponse,
    orderId: string,
    userId: string
  ) => {
    const updateData = {
      paymentStatus: "completed",
      paymentReference,
      status: "processing",
      confirmedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      transactionId: paymentResponse.transaction,
      transactionReference: paymentResponse.reference,
      currency: paymentResponse.currency || "GHS",
      channel: paymentResponse.channel || "MOMO",
    };

    await updateDoc(doc(db, "users", userId, "orders", orderId), updateData);

    await updateDoc(doc(db, "orders", orderId), updateData);

    const batch = writeBatch(db);
    cartItemsRef.current.forEach((item) => {
      batch.delete(doc(db, "users", userId, "cart", item.id));
    });
    await batch.commit();
  };

  const updateProductQuantities = async () => {
    const batch = writeBatch(db);

    cartItemsRef.current.forEach((item) => {
      if (!item.productId) {
        throw new Error("Missing productId in cart item");
      }

      const productRef = doc(db, "products", item.productId);

      batch.update(productRef, {
        quantity: increment(-item.quantity),
        updatedAt: serverTimestamp(),
      });
    });

    await batch.commit();
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
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
        (field) => !formData[field as keyof FormData]
      );

      if (missingFields.length > 0) {
        alert(
          `Please fill in all required fields: ${missingFields.join(", ")}`
        );
        return;
      }
    }

    if (activeStep < 3) {
      setActiveStep(activeStep + 1);

      if (activeStep === 1) {
        loadPaystackScript();
      }
    }
  };

  const handlePreviousStep = () => {
    if (activeStep > 1) {
      setActiveStep(activeStep - 1);
    }
  };

  const onPaymentSuccess = async (response: PaystackResponse) => {
    if (processing === false && paymentSuccess === true) {
      return;
    }

    setProcessing(true);

    const tempId = tempOrderIdRef.current;
    const userId = currentUserIdRef.current;
    const items = cartItemsRef.current;

    console.log("Callback data:", {
      tempId,
      userId,
      hasItems: items.length > 0,
      responseReference: response.reference,
    });

    try {
      await updateProductQuantities();
      await updateOrderAfterPayment(
        response.reference,
        response,
        tempId,
        userId
      );

      setPaymentSuccess(true);
      setProcessing(false);

      setOrderId(tempId);

      setCartItems([]);

      setTimeout(() => {
        router.push("/orders?payment=success");
      }, 3000);
    } catch (error: unknown) {
      console.error("Payment update error:", error);
      setProcessing(false);

      if (
        error instanceof Error &&
        error.message.includes("Missing order data")
      ) {
        alert(
          "Payment was successful but we couldn't find your order data. Please contact support with your payment reference."
        );
      } else {
        alert(
          "Payment was successful but there was an error updating your order. Please contact support."
        );
      }
    }
  };

  const onPaymentFailed = (response: PaystackResponse) => {
    alert(`Payment failed: ${response.message || "Please try again"}`);
  };

  const handlePayment = async () => {
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.phone
    ) {
      alert("Please complete your shipping information.");
      setActiveStep(1);
      return;
    }

    if (!currentUserId) {
      alert("Please log in to complete your order.");
      router.push("/login");
      return;
    }

    if (!paystackLoaded) {
      alert("Payment gateway is loading. Please wait.");
      return;
    }

    if (!window.PaystackPop) {
      alert("Payment service unavailable.");
      return;
    }

    if (!paystackPublicKey) {
      alert("Payment configuration error.");
      return;
    }

    setProcessing(true);

    try {
      const tempId = await createTempOrder();

      tempOrderIdRef.current = tempId;

      const paystackConfig: PaystackOptions = {
        key: paystackPublicKey,
        email: formData.email,
        amount: Math.round(finalTotal * 100),
        ref: tempId,
        currency: "GHS",
        metadata: {
          order_id: tempId,
          customer_name: `${formData.firstName} ${formData.lastName}`,
          customer_phone: formData.phone,
          items_count: itemCount,
          shipping_city: formData.city,
          shipping_region: formData.regions,
        },
        callback: (response: PaystackResponse) => {
          if (response.status === "success") {
            onPaymentSuccess(response);
          } else {
            onPaymentFailed(response);
          }
        },
        onClose: () => {
          setProcessing(false);
        },
      };

      const handler = window.PaystackPop.setup(paystackConfig);
      handler.openIframe();
    } catch (error) {
      console.error("Error initiating payment:", error);
      setProcessing(false);
      alert("Error preparing payment. Please try again.");
    }
  };

  const steps = [
    { id: 1, name: "Shipping", icon: <FiTruck /> },
    { id: 2, name: "Payment", icon: <FiCreditCard /> },
    { id: 3, name: "Review", icon: <FiCheckCircle /> },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#d87a6a] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
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
            className="px-6 py-2.5 sm:px-8 sm:py-3 bg-[#d87a6a] text-white rounded-lg sm:rounded-xl hover:bg-[#c76a5a] transition-colors font-medium text-sm sm:text-base w-full sm:w-auto"
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
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-6 sm:mb-8">
              Order ID: <span className="font-mono font-bold">{orderId}</span>
            </p>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8 max-w-md mx-auto">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm sm:text-base">
                Order Summary
              </h3>
              <div className="space-y-1.5 sm:space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Items ({itemCount})</span>
                  <span>₵{totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>₵{shippingFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base sm:text-lg font-bold pt-2 border-t">
                  <span>Total</span>
                  <span>₵{finalTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
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
            <p className="text-gray-500 dark:text-gray-500 text-xs sm:text-sm mt-4 sm:mt-6">
              A confirmation email has been sent to {formData.email}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section - Responsive */}
      <section className="relative bg-gradient-to-br from-[#d87a6a]/10 via-white to-[#fcefe9] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 sm:py-12 md:py-16 px-4">
        <div className="relative max-w-7xl mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
              Secure Checkout
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
              Complete your order with secure payment
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
        <div className="max-w-6xl mx-auto">
          {/* Progress Steps - Responsive */}
          <div className="mb-8 sm:mb-12 px-2">
            <div className="flex items-center justify-center flex-wrap gap-4 sm:gap-0">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className="hidden sm:flex items-center">
                    <div
                      className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 ${
                        activeStep >= step.id
                          ? "bg-[#d87a6a] border-[#d87a6a] text-white"
                          : "border-gray-300 dark:border-gray-700"
                      }`}
                    >
                      {step.icon}
                    </div>
                    <div className="ml-3 sm:ml-4">
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        Step {step.id}
                      </p>
                      <p className="font-medium text-sm sm:text-base">
                        {step.name}
                      </p>
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`hidden sm:block h-0.5 w-8 sm:w-16 mx-2 sm:mx-4 ${
                          activeStep > step.id
                            ? "bg-[#d87a6a]"
                            : "bg-gray-300 dark:bg-gray-700"
                        }`}
                      />
                    )}
                  </div>

                  {/* Mobile step indicator */}
                  <div className="sm:hidden flex flex-col items-center">
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                        activeStep >= step.id
                          ? "bg-[#d87a6a] border-[#d87a6a] text-white"
                          : "border-gray-300 dark:border-gray-700"
                      }`}
                    >
                      {step.icon}
                    </div>
                    <span className="text-xs mt-1">{step.name}</span>
                  </div>
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
                            <FiUser className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
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
                            <FiUser className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
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
                            <FiMail className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
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
                            <FiPhone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
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
                            <FiMapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            Region *
                          </label>
                          <select
                            name="regions"
                            value={formData.regions}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-700 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-[#d87a6a] focus:border-transparent"
                            required
                          >
                            <option value="" className="text-black">
                              Select Region
                            </option>
                            <option
                              value="Greater Accra"
                              className="text-black"
                            >
                              Greater Accra
                            </option>
                            <option value="Ashanti" className="text-black">
                              Ashanti
                            </option>
                            <option value="Eastern" className="text-black">
                              Eastern
                            </option>
                            <option value="Western" className="text-black">
                              Western
                            </option>
                            <option value="Central" className="text-black">
                              Central
                            </option>
                            <option value="Volta" className="text-black">
                              Volta
                            </option>
                            <option value="Northern" className="text-black">
                              Northern
                            </option>
                            <option value="Upper East" className="text-black">
                              Upper East
                            </option>
                            <option value="Upper West" className="text-black">
                              Upper West
                            </option>
                            <option value="Bono" className="text-black">
                              Bono
                            </option>
                            <option value="Bono East" className="text-black">
                              Bono East
                            </option>
                            <option value="Ahafo" className="text-black">
                              Ahafo
                            </option>
                            <option value="Savannah" className="text-black">
                              Savannah
                            </option>
                            <option value="North East" className="text-black">
                              North East
                            </option>
                            <option value="Oti" className="text-black">
                              Oti
                            </option>
                            <option
                              value="Western North"
                              className="text-black"
                            >
                              Western North
                            </option>
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
                            Detailed Address(optional)
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
                      Payment Method
                    </h2>

                    <div className="mb-6 sm:mb-8 p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl sm:rounded-2xl border border-blue-200 dark:border-blue-800">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
                        <FiCreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-[#d87a6a]" />
                        Secure Payment with Paystack
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3 sm:mb-4">
                        Pay securely with card, mobile money, or bank transfer.
                        All payments are processed through Paystack&apos;s
                        secure payment gateway.
                      </p>
                      <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        <span className="px-2 py-1 sm:px-3 sm:py-1 bg-white dark:bg-gray-800 text-xs font-medium rounded-full border">
                          Visa/Mastercard
                        </span>
                        <span className="px-2 py-1 sm:px-3 sm:py-1 bg-white dark:bg-gray-800 text-xs font-medium rounded-full border">
                          Mobile Money
                        </span>
                        <span className="px-2 py-1 sm:px-3 sm:py-1 bg-white dark:bg-gray-800 text-xs font-medium rounded-full border">
                          Bank Transfer
                        </span>
                      </div>
                    </div>

                    {/* Security Badge */}
                    <div className="flex items-start sm:items-center gap-3 p-3 sm:p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg sm:rounded-xl border border-green-200 dark:border-green-800">
                      <FiLock className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400 mt-0.5 sm:mt-0" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
                          Bank-Level Security
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          Your payment information is encrypted and secure
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {activeStep === 3 && (
                  <div>
                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
                      Order Review
                    </h2>

                    <div className="space-y-4 sm:space-y-6">
                      {/* Shipping Information */}
                      <div className="bg-gradient-to-r from-[#d87a6a]/5 to-[#c76a5a]/5 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 text-sm sm:text-base">
                          Shipping Information
                        </h3>
                        <div className="grid md:grid-cols-2 gap-3 sm:gap-4">
                          <div>
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                              Name
                            </p>
                            <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
                              {formData.firstName} {formData.lastName}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                              Email
                            </p>
                            <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
                              {formData.email}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                              Phone
                            </p>
                            <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
                              {formData.phone}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                              Region
                            </p>
                            <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
                              {formData.regions}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                              City
                            </p>
                            <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
                              {formData.city}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                              Area
                            </p>
                            <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
                              {formData.locality}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3 text-sm sm:text-base">
                          Order Items ({itemCount})
                        </h3>
                        <div className="space-y-2 sm:space-y-3">
                          {cartItems.map((item) => (
                            <div
                              key={item.id}
                              className="flex justify-between items-center bg-white dark:bg-gray-700 p-3 sm:p-4 rounded-lg sm:rounded-xl"
                            >
                              <div className="flex-1 pr-2">
                                <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base line-clamp-1">
                                  {item.name}
                                </p>
                                <p className="text-xs sm:text-sm text-gray-500">
                                  Qty: {item.quantity} × ₵
                                  {item.price.toFixed(2)}
                                </p>
                              </div>
                              <p className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base whitespace-nowrap">
                                ₵{(item.price * item.quantity).toFixed(2)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons - Responsive */}
                <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0 mt-6 sm:mt-8 pt-4 sm:pt-6 border-t">
                  {activeStep > 1 ? (
                    <button
                      onClick={handlePreviousStep}
                      className="flex items-center justify-center px-4 py-2.5 sm:px-6 sm:py-3 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-sm sm:text-base w-full sm:w-auto order-2 sm:order-1"
                    >
                      <FiArrowLeft className="mr-2 w-4 h-4" />
                      Back
                    </button>
                  ) : (
                    <button
                      onClick={() => router.push("/cart")}
                      className="flex items-center justify-center px-4 py-2.5 sm:px-6 sm:py-3 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-sm sm:text-base w-full sm:w-auto order-2 sm:order-1"
                    >
                      <FiArrowLeft className="mr-2 w-4 h-4" />
                      Return to Cart
                    </button>
                  )}

                  {activeStep < 3 ? (
                    <button
                      onClick={handleNextStep}
                      className="px-4 py-2.5 sm:px-6 sm:py-3 bg-[#d87a6a] text-white rounded-lg sm:rounded-xl hover:bg-[#c76a5a] transition-colors font-medium text-sm sm:text-base w-full sm:w-auto order-1 sm:order-2"
                    >
                      Continue to {activeStep === 1 ? "Payment" : "Review"}
                    </button>
                  ) : (
                    <button
                      onClick={handlePayment}
                      disabled={processing || !paystackLoaded}
                      className="px-6 py-2.5 sm:px-8 sm:py-3 bg-gradient-to-r from-[#d87a6a] to-[#c76a5a] text-white rounded-lg sm:rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 sm:gap-3 font-medium text-sm sm:text-base shadow-lg w-full sm:w-auto order-1 sm:order-2"
                    >
                      {processing ? (
                        <>
                          <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span className="whitespace-nowrap">
                            Processing...
                          </span>
                        </>
                      ) : !paystackLoaded ? (
                        "Loading Gateway..."
                      ) : (
                        <>
                          <FiLock className="w-4 h-4 sm:w-5 sm:h-5" />
                          <span>Pay ₵{finalTotal.toFixed(2)} Now</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 flex items-center mt-4 sm:mt-0">
                <FiLock className="mr-2 w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Your payment information is secure and encrypted
              </div>
            </div>

            {/* Order Summary Sidebar - Responsive */}
            <div className="space-y-4 sm:space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-lg sm:shadow-xl p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
                  Order Summary
                </h3>

                <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6 max-h-60 sm:max-h-80 overflow-y-auto pr-2">
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center pb-3 sm:pb-4 border-b"
                    >
                      <div className="flex-1 pr-2">
                        <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base line-clamp-1">
                          {item.name}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <p className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base whitespace-nowrap">
                        ₵{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 sm:space-y-3 border-t pt-3 sm:pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Subtotal
                    </span>
                    <span className="font-medium">
                      ₵{totalPrice.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Shipping
                    </span>
                    <span className="font-medium">
                      ₵{shippingFee.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between text-base sm:text-lg font-bold border-t pt-3 sm:pt-4">
                    <span>Total Amount</span>
                    <span className="text-xl sm:text-2xl text-[#d87a6a]">
                      ₵{finalTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Need Help - Responsive */}
              <div className="bg-gradient-to-br from-[#d87a6a]/10 to-[#c76a5a]/10 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                <h4 className="font-bold text-gray-900 dark:text-white mb-2 sm:mb-3 text-sm sm:text-base">
                  Need Help?
                </h4>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3 sm:mb-4">
                  If you encounter any issues with payment or have questions
                  about your order, please contact our support team.
                </p>
                <div className="space-y-1.5 sm:space-y-2">
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    <FiMail className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="break-all">yussifhayate@icloud.com</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    <FiPhone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
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
