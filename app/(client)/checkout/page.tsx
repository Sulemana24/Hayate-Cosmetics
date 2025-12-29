"use client";

import { useState, useEffect, useRef } from "react";
import { getAuth } from "firebase/auth";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  doc,
  writeBatch,
  addDoc,
  updateDoc,
  serverTimestamp,
  FieldValue,
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

interface OrderUpdateData {
  paymentStatus: "completed";
  paymentReference: string;
  paymentDate: ReturnType<typeof serverTimestamp>;
  status: "processing";
  confirmedAt: ReturnType<typeof serverTimestamp>;
  updatedAt: ReturnType<typeof serverTimestamp>;
  transactionId?: string;
  transactionReference?: string;
  currency?: string;
  channel?: string;
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
  const shippingFee = totalPrice > 100 ? 0 : 10;
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

    try {
      const newOrderId = `HAY-${Math.floor(10000 + Math.random() * 90000)}`;
      const currentTimestamp = serverTimestamp();

      const orderData = {
        userId: currentUserId,
        items: cartItems,
        totalAmount: finalTotal,
        subtotal: totalPrice,
        shippingFee,
        tax: 0,
        status: "pending_payment",
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
        paymentMethod: "paystack",
        paymentStatus: "pending",
        customerName: `${formData.firstName} ${formData.lastName}`,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        createdAt: currentTimestamp, // Use serverTimestamp here
        orderId: newOrderId,
        userEmail: formData.email,
        // Add a date field for easier querying
        orderDate: new Date().toISOString(),
      };

      const orderRef = await addDoc(collection(db, "orders"), orderData);
      const tempId = orderRef.id;

      setTempOrderId(tempId);
      tempOrderIdRef.current = tempId;

      await addDoc(collection(db, "users", currentUserId, "orders"), {
        ...orderData,
        tempId: tempId,
        status: "pending_payment",
      });

      sessionStorage.setItem(
        "pendingOrder",
        JSON.stringify({
          ...orderData,
          tempId: tempId,
          cartItems,
          currentUserId,
        })
      );

      return tempId;
    } catch (error: unknown) {
      console.error("Error creating temp order:", error);
      throw error;
    }
  };

  const updateOrderAfterPayment = async (
    paymentReference: string,
    paymentResponse: PaystackResponse,
    tempId: string,
    userId: string
  ) => {
    if (!tempId || !userId) {
      console.error("Missing tempOrderId or currentUserId in callback");

      // Try to recover from session storage
      const pendingOrder = sessionStorage.getItem("pendingOrder");
      if (pendingOrder) {
        const orderData = JSON.parse(pendingOrder);
        tempId = orderData.tempId;
        userId = orderData.currentUserId;

        if (!tempId || !userId) {
          throw new Error("Cannot recover order data from session storage");
        }
      } else {
        throw new Error("Missing order data and no recovery available");
      }
    }

    try {
      const orderRef = doc(db, "orders", tempId);

      // Get current timestamp for consistent date
      const currentTimestamp = serverTimestamp();

      const updateData: Partial<OrderUpdateData> = {
        paymentStatus: "completed",
        paymentReference,
        paymentDate: currentTimestamp,
        status: "processing",
        confirmedAt: currentTimestamp,
        updatedAt: currentTimestamp,
        transactionId: paymentResponse.transaction || undefined,
        transactionReference: paymentResponse.reference || undefined,
        currency: paymentResponse.currency || "GHS",
        channel: paymentResponse.channel || undefined,
      };

      // Safely add optional fields
      if (paymentResponse.transaction) {
        updateData.transactionId = paymentResponse.transaction;
      }

      if (paymentResponse.reference) {
        updateData.transactionReference = paymentResponse.reference;
      }

      updateData.currency = paymentResponse.currency || "GHS";

      if (paymentResponse.channel) {
        updateData.channel = paymentResponse.channel;
      }

      console.log("Updating main order with data:", {
        tempId,
        userId,
        updateData,
      });

      // Update main order document
      await updateDoc(orderRef, updateData);

      // ALSO update the order in user's orders subcollection
      try {
        const userOrdersRef = collection(db, "users", userId, "orders");
        const userOrdersSnapshot = await getDocs(userOrdersRef);

        let userOrderId: string | null = null;
        userOrdersSnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.tempId === tempId) {
            userOrderId = doc.id;
          }
        });

        if (userOrderId) {
          const userOrderRef = doc(db, "users", userId, "orders", userOrderId);
          await updateDoc(userOrderRef, {
            paymentStatus: "completed",
            paymentReference: paymentReference,
            paymentDate: currentTimestamp,
            status: "processing",
            confirmedAt: currentTimestamp,
            updatedAt: currentTimestamp,
            transactionId: paymentResponse.transaction || "",
            transactionReference: paymentResponse.reference || paymentReference,
            currency: paymentResponse.currency || "GHS",
            channel: paymentResponse.channel || "",
          } as Partial<OrderUpdateData>);

          console.log("Updated user's order subcollection");
        } else {
          console.warn("Could not find user's order document to update");

          // Create a new entry in user's orders if not found
          const newUserOrderData = {
            orderId: tempId,
            tempId: tempId,
            userId: userId,
            items: cartItemsRef.current,
            totalAmount: finalTotal,
            subtotal: totalPrice,
            shippingFee,
            tax: 0,
            status: "processing",
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
            paymentMethod: "paystack",
            paymentStatus: "completed",
            paymentReference: paymentReference,
            paymentDate: currentTimestamp,
            customerName: `${formData.firstName} ${formData.lastName}`,
            customerEmail: formData.email,
            customerPhone: formData.phone,
            createdAt: currentTimestamp,
            confirmedAt: currentTimestamp,
            updatedAt: currentTimestamp,
            transactionId: paymentResponse.transaction || "",
            transactionReference: paymentResponse.reference || paymentReference,
            currency: paymentResponse.currency || "GHS",
            channel: paymentResponse.channel || "",
            userEmail: formData.email,
          };

          await addDoc(
            collection(db, "users", userId, "orders"),
            newUserOrderData
          );
          console.log("Created new order in user's subcollection");
        }
      } catch (userUpdateError) {
        console.error("Error updating user's order:", userUpdateError);
      }

      // Clear cart items
      if (userId && cartItemsRef.current.length > 0) {
        const batch = writeBatch(db);
        cartItemsRef.current.forEach((item) => {
          const cartItemRef = doc(db, "users", userId, "cart", item.id);
          batch.delete(cartItemRef);
        });
        await batch.commit();
        console.log("Cart cleared successfully");
      }

      setOrderId(tempId);
      setPaymentSuccess(true);
      sessionStorage.removeItem("pendingOrder");

      setCartItems([]);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error updating order after payment:", error);
        console.error("Error details:", {
          message: error.message,
          tempId,
          userId,
        });
      } else {
        console.error("Unknown error updating order:", error);
      }

      throw error;
    }
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

      // Load Paystack script when moving to payment step
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
    console.log("Paystack success response received");

    // Use refs instead of state to ensure we have the latest values
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
      console.error("Error processing payment success:", error);
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
    console.error("Payment failed:", response);
    setProcessing(false);
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

      const reference = `HAY-${Math.floor(10000 + Math.random() * 90000)}`;

      const paystackConfig: PaystackOptions = {
        key: paystackPublicKey,
        email: formData.email,
        amount: Math.round(finalTotal * 100),
        ref: reference,
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
          console.log("Paystack callback triggered");
          console.log("Current ref values:", {
            tempOrderIdRef: tempOrderIdRef.current,
            currentUserIdRef: currentUserIdRef.current,
          });

          if (response.status === "success") {
            onPaymentSuccess(response);
          } else {
            onPaymentFailed(response);
          }
        },
        onClose: () => {
          console.log("Payment modal closed by user");
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <FiTruck className="w-24 h-24 text-gray-300 dark:text-gray-700 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Your cart is empty
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Add items to your cart before proceeding to checkout.
          </p>
          <button
            onClick={() => router.push("/cart")}
            className="px-8 py-3 bg-[#d87a6a] text-white rounded-xl hover:bg-[#c76a5a] transition-colors font-medium"
          >
            Return to Cart
          </button>
        </div>
      </div>
    );
  }

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
              <FiCheckCircle className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Payment Successful!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              Your order has been placed successfully.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
              Order ID: <span className="font-mono font-bold">{orderId}</span>
            </p>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 mb-8 max-w-md mx-auto">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                Order Summary
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Items ({itemCount})</span>
                  <span>₵{totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>₵{shippingFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Total</span>
                  <span>₵{finalTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.push("/orders")}
                className="px-6 py-3 bg-[#d87a6a] text-white rounded-lg hover:bg-[#c76a5a] transition-colors"
              >
                View Orders
              </button>
              <button
                onClick={() => router.push("/")}
                className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Continue Shopping
              </button>
            </div>
            <p className="text-gray-500 dark:text-gray-500 text-sm mt-6">
              A confirmation email has been sent to {formData.email}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#d87a6a]/10 via-white to-[#fcefe9] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 md:py-16">
        <div className="relative container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Secure Checkout
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Complete your order with secure payment
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Progress Steps */}
          <div className="mb-12">
            <div className="flex items-center justify-center">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-12 h-12 rounded-full border-2 ${
                      activeStep >= step.id
                        ? "bg-[#d87a6a] border-[#d87a6a] text-white"
                        : "border-gray-300 dark:border-gray-700"
                    }`}
                  >
                    {step.icon}
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Step {step.id}
                    </p>
                    <p className="font-medium">{step.name}</p>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`h-0.5 w-16 mx-4 ${
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

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6 md:p-8 mb-8">
                {activeStep === 1 && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                      Shipping Information
                    </h2>
                    <div className="mb-8 bg-gradient-to-r from-[#d87a6a]/5 to-[#c76a5a]/5 rounded-2xl p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Contact Information
                      </h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            <FiUser className="w-4 h-4" />
                            First Name *
                          </label>
                          <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#d87a6a] focus:border-transparent"
                            placeholder="Enter your first name"
                            required
                          />
                        </div>
                        <div>
                          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            <FiUser className="w-4 h-4" />
                            Last Name *
                          </label>
                          <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#d87a6a] focus:border-transparent"
                            placeholder="Enter your last name"
                            required
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            <FiMail className="w-4 h-4" />
                            Email Address *
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#d87a6a] focus:border-transparent"
                            required
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            <FiPhone className="w-4 h-4" />
                            Phone Number *
                          </label>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#d87a6a] focus:border-transparent"
                            placeholder="0543456789"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-[#d87a6a]/5 to-[#c76a5a]/5 rounded-2xl p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Shipping Address
                      </h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            <FiMapPin className="w-4 h-4" />
                            Region *
                          </label>
                          <select
                            name="regions"
                            value={formData.regions}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#d87a6a] focus:border-transparent "
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
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            City/Town *
                          </label>
                          <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#d87a6a] focus:border-transparent"
                            placeholder="e.g Accra, Kumasi, Tamale"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Area/Locality *
                          </label>
                          <input
                            type="text"
                            name="locality"
                            value={formData.locality}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#d87a6a] focus:border-transparent"
                            placeholder="e.g Dungu, Abuakwa, Madina"
                            required
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Detailed Address(optional)
                          </label>
                          <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#d87a6a] focus:border-transparent"
                            placeholder="House number, Street name, Landmark"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeStep === 2 && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                      Payment Method
                    </h2>

                    <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl border border-blue-200 dark:border-blue-800">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <FiCreditCard className="w-5 h-5 text-[#d87a6a]" />
                        Secure Payment with Paystack
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Pay securely with card, mobile money, or bank transfer.
                        All payments are processed through Paystack&apos;s
                        secure payment gateway.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-white dark:bg-gray-800 text-xs font-medium rounded-full border">
                          Visa/Mastercard
                        </span>
                        <span className="px-3 py-1 bg-white dark:bg-gray-800 text-xs font-medium rounded-full border">
                          Mobile Money
                        </span>
                        <span className="px-3 py-1 bg-white dark:bg-gray-800 text-xs font-medium rounded-full border">
                          Bank Transfer
                        </span>
                      </div>
                    </div>

                    {/* Security Badge */}
                    <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800">
                      <FiLock className="w-5 h-5 text-green-600 dark:text-green-400" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          Bank-Level Security
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Your payment information is encrypted and secure
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {activeStep === 3 && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                      Order Review
                    </h2>

                    <div className="space-y-6">
                      {/* Shipping Information */}
                      <div className="bg-gradient-to-r from-[#d87a6a]/5 to-[#c76a5a]/5 rounded-2xl p-6">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                          Shipping Information
                        </h3>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Name
                            </p>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {formData.firstName} {formData.lastName}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Email
                            </p>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {formData.email}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Phone
                            </p>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {formData.phone}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Region
                            </p>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {formData.regions}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              City
                            </p>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {formData.city}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Area
                            </p>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {formData.locality}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Order Items */}
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
                              <div className="flex-1">
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {item.name}
                                </p>
                                <p className="text-sm text-gray-500">
                                  Qty: {item.quantity} × ₵
                                  {item.price.toFixed(2)}
                                </p>
                              </div>
                              <p className="font-semibold text-gray-900 dark:text-white">
                                ₵{(item.price * item.quantity).toFixed(2)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-8 pt-6 border-t">
                  {activeStep > 1 ? (
                    <button
                      onClick={handlePreviousStep}
                      className="flex items-center px-6 py-3 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                    >
                      <FiArrowLeft className="mr-2" />
                      Back
                    </button>
                  ) : (
                    <button
                      onClick={() => router.push("/cart")}
                      className="flex items-center px-6 py-3 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                    >
                      <FiArrowLeft className="mr-2" />
                      Return to Cart
                    </button>
                  )}

                  {activeStep < 3 ? (
                    <button
                      onClick={handleNextStep}
                      className="px-6 py-3 bg-[#d87a6a] text-white rounded-xl hover:bg-[#c76a5a] transition-colors font-medium"
                    >
                      Continue to {activeStep === 1 ? "Payment" : "Review"}
                    </button>
                  ) : (
                    <button
                      onClick={handlePayment}
                      disabled={processing || !paystackLoaded}
                      className="px-8 py-3 bg-gradient-to-r from-[#d87a6a] to-[#c76a5a] text-white rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 font-medium shadow-lg"
                    >
                      {processing ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Processing Payment...
                        </>
                      ) : !paystackLoaded ? (
                        "Loading Gateway..."
                      ) : (
                        <>
                          <FiLock className="w-5 h-5" />
                          Pay ₵{finalTotal.toFixed(2)} Now
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

            {/* Order Summary */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  Order Summary
                </h3>

                <div className="space-y-4 mb-6">
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center pb-4 border-b"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {item.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        ₵{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 border-t pt-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Subtotal
                    </span>
                    <span className="font-medium">
                      ₵{totalPrice.toFixed(2)}
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

              {/* Need Help */}
              <div className="bg-gradient-to-br from-[#d87a6a]/10 to-[#c76a5a]/10 rounded-3xl p-6">
                <h4 className="font-bold text-gray-900 dark:text-white mb-3">
                  Need Help?
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  If you encounter any issues with payment or have questions
                  about your order, please contact our support team.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <FiMail className="w-4 h-4" />
                    <span>yussifhayate@icloud.com</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <FiPhone className="w-4 h-4" />
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
