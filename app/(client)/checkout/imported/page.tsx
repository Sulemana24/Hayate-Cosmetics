"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useToast } from "@/components/ToastProvider";
import { getAuth } from "firebase/auth";
import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import {
  FiArrowLeft,
  FiShoppingBag,
  FiDollarSign,
  FiUsers,
  FiMessageCircle,
  FiCheck,
  FiClock,
  FiGlobe,
  FiPackage,
  FiInfo,
} from "react-icons/fi";
import { IoLogoWhatsapp } from "react-icons/io";

interface CartItem {
  productId: string;
  name: string;
  imageUrl: string;
  price: number;
  category: string;
  quantity: number;
  isPreOrder?: boolean;
  estimatedDelivery?: string;
}

export default function ImportedCheckoutPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState<"checkout" | "payment" | "complete">(
    "checkout",
  );
  const [paymentMethod, setPaymentMethod] = useState<
    "paystack" | "mobile_money"
  >("paystack");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  const auth = getAuth();

  // WhatsApp group link (replace with your actual group invite link)
  const WHATSAPP_GROUP_LINK =
    "https://chat.whatsapp.com/your-group-invite-link";

  useEffect(() => {
    const fetchCart = async () => {
      const user = auth.currentUser;
      if (!user) {
        showToast({
          title: "Error",
          message: "Please sign in to checkout",
          type: "error",
        });
        router.push("/login");
        return;
      }

      try {
        const cartRef = collection(db, "users", user.uid, "cart");
        const q = query(cartRef, where("isPreOrder", "==", true));
        const snapshot = await getDocs(q);

        const items = snapshot.docs.map((doc) => ({
          productId: doc.id,
          ...doc.data(),
        })) as CartItem[];

        if (items.length === 0) {
          showToast({
            title: "Info",
            message: "No imported/pre-order items in your cart",
            type: "info",
          });
          router.push("/cart");
          return;
        }

        setCartItems(items);
      } catch (error) {
        console.error("Error fetching cart:", error);
        showToast({
          title: "Error",
          message: "Failed to load cart items",
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [auth.currentUser, router, showToast]);

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const handlePayment = async () => {
    if (!agreedToTerms) {
      showToast({
        title: "Error",
        message: "Please agree to the terms and conditions",
        type: "error",
      });
      return;
    }

    if (!whatsappNumber.trim()) {
      showToast({
        title: "Error",
        message: "Please enter your WhatsApp number",
        type: "error",
      });
      return;
    }

    setProcessing(true);

    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User not authenticated");

      // Create order
      const orderData = {
        userId: user.uid,
        userEmail: user.email,
        customerName: user.displayName || "Customer",
        items: cartItems,
        totalAmount: calculateTotal(),
        status: "pending_payment",
        paymentStatus: "pending",
        paymentMethod: paymentMethod,
        orderType: "imported",
        isPreOrder: true,
        estimatedDelivery: cartItems[0]?.estimatedDelivery || "2 months",
        whatsappNumber: whatsappNumber,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const orderRef = doc(collection(db, "orders"));
      await setDoc(orderRef, orderData);
      setOrderId(orderRef.id);

      // Clear cart items
      const userCartRef = collection(db, "users", user.uid, "cart");
      for (const item of cartItems) {
        const itemRef = doc(userCartRef, item.productId);
        await setDoc(itemRef, { ...item, isPreOrder: false, buyNow: false });
      }

      // Here you would integrate with Paystack or Mobile Money API
      // For demo, we'll simulate payment
      await simulatePayment();

      // Update order status
      await updateDoc(orderRef, {
        paymentStatus: "paid",
        status: "processing",
        updatedAt: serverTimestamp(),
      });

      setStep("complete");
      showToast({
        title: "Success",
        message: "Pre-order placed successfully!",
        type: "success",
      });
    } catch (error) {
      console.error("Payment error:", error);
      showToast({
        title: "Error",
        message: "Payment failed. Please try again.",
        type: "error",
      });
    } finally {
      setProcessing(false);
    }
  };

  // Simulate payment processing (replace with actual payment integration)
  const simulatePayment = () => {
    return new Promise((resolve) => {
      setTimeout(resolve, 2000);
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBF6EF] dark:bg-[#0f1e1a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E39A89]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF6EF] dark:bg-[#0f1e1a]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-[#1b3c35]/70 dark:text-white/70 hover:text-[#c9614d] dark:hover:text-[#E39A89] font-medium transition-colors mb-4"
          >
            <FiArrowLeft className="w-5 h-5" />
            Back to Cart
          </button>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#bc0686]/10 rounded-xl">
              <FiGlobe className="w-6 h-6 text-[#bc0686]" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#1b3c35] dark:text-white">
                Imported Goods Checkout
              </h1>
              <p className="text-[#26261F]/60 dark:text-white/60">
                Pre-order imported items - No shipping address required
              </p>
            </div>
          </div>
        </div>

        {step === "checkout" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Summary */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-[#16302a] ring-1 ring-black/5 dark:ring-white/5 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-[#1b3c35] dark:text-white mb-4 flex items-center gap-2">
                  <FiShoppingBag className="w-5 h-5" />
                  Order Summary ({cartItems.length} items)
                </h2>

                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div
                      key={item.productId}
                      className="flex gap-4 items-center border-b border-[#1b3c35]/10 dark:border-white/10 pb-4 last:border-0 last:pb-0"
                    >
                      <div className="w-16 h-16 rounded-lg bg-[#1b3c35]/5 dark:bg-white/5 overflow-hidden flex-shrink-0">
                        {item.imageUrl ? (
                          <Image
                            src={item.imageUrl}
                            alt={item.name}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <FiPackage className="w-6 h-6 text-[#1b3c35]/30 dark:text-white/30" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-[#1b3c35] dark:text-white">
                          {item.name}
                        </h3>
                        <p className="text-sm text-[#26261F]/55 dark:text-white/55">
                          Qty: {item.quantity} × ₵{item.price.toFixed(2)}
                        </p>
                        {item.isPreOrder && (
                          <span className="inline-flex items-center gap-1 text-xs text-[#bc0686] dark:text-[#d47a9e]">
                            <FiClock className="w-3 h-3" />
                            Pre-order
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-[#1b3c35] dark:text-white">
                          ₵{(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t border-[#1b3c35]/10 dark:border-white/10">
                  <div className="flex justify-between text-lg font-bold text-[#1b3c35] dark:text-white">
                    <span>Total</span>
                    <span>₵{calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Pre-order Info */}
              <div className="bg-gradient-to-r from-[#E39A89]/10 to-[#bc0686]/10 rounded-xl p-4 border border-[#E39A89]/20">
                <div className="flex items-start gap-3">
                  <FiClock className="w-5 h-5 text-[#bc0686] mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-[#1b3c35] dark:text-white text-sm">
                      Pre-order Information
                    </h4>
                    <p className="text-sm text-[#26261F]/70 dark:text-white/70">
                      This is a pre-order for imported goods. Estimated
                      delivery:
                      <strong className="text-[#bc0686]"> 2 months</strong> from
                      order date.
                    </p>
                    <ul className="mt-2 text-xs text-[#26261F]/60 dark:text-white/60 space-y-1">
                      <li className="flex items-center gap-1">
                        <FiCheck className="w-3 h-3 text-[#8FA593]" />
                        No shipping address required
                      </li>
                      <li className="flex items-center gap-1">
                        <FiCheck className="w-3 h-3 text-[#8FA593]" />
                        Pay now, receive your items in 2 months
                      </li>
                      <li className="flex items-center gap-1">
                        <FiCheck className="w-3 h-3 text-[#8FA593]" />
                        Join WhatsApp group for updates
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Checkout Form */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-[#16302a] ring-1 ring-black/5 dark:ring-white/5 rounded-2xl p-6 sticky top-24">
                <h2 className="text-lg font-semibold text-[#1b3c35] dark:text-white mb-4">
                  Complete Pre-order
                </h2>

                <div className="space-y-4">
                  {/* WhatsApp Number */}
                  <div>
                    <label className="block text-sm font-medium text-[#1b3c35] dark:text-white/90 mb-1.5">
                      WhatsApp Number *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#26261F]/40 dark:text-white/40">
                        <IoLogoWhatsapp className="w-5 h-5 text-[#25D366]" />
                      </span>
                      <input
                        type="tel"
                        value={whatsappNumber}
                        onChange={(e) => setWhatsappNumber(e.target.value)}
                        placeholder="e.g., 0244123456"
                        className="w-full pl-10 pr-4 py-3 bg-[#FBF6EF] dark:bg-[#0f1e1a] rounded-xl ring-1 ring-[#1b3c35]/15 dark:ring-white/15 focus:ring-[#E39A89] focus:outline-none transition-all text-[#1b3c35] dark:text-white"
                        required
                      />
                    </div>
                    <p className="text-xs text-[#26261F]/50 dark:text-white/50 mt-1.5">
                      We&apos;ll add you to the WhatsApp group for order updates
                    </p>
                  </div>

                  {/* Payment Method */}
                  <div>
                    <label className="block text-sm font-medium text-[#1b3c35] dark:text-white/90 mb-1.5">
                      Payment Method *
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setPaymentMethod("paystack")}
                        className={`p-3 rounded-xl border-2 transition-all ${
                          paymentMethod === "paystack"
                            ? "border-[#E39A89] bg-[#E39A89]/10"
                            : "border-[#1b3c35]/15 dark:border-white/15 hover:border-[#E39A89]/50"
                        }`}
                      >
                        <div className="text-center">
                          <FiDollarSign className="w-6 h-6 mx-auto text-[#1b3c35] dark:text-white" />
                          <span className="text-xs font-medium text-[#1b3c35] dark:text-white">
                            Card/Paystack
                          </span>
                        </div>
                      </button>
                      <button
                        onClick={() => setPaymentMethod("mobile_money")}
                        className={`p-3 rounded-xl border-2 transition-all ${
                          paymentMethod === "mobile_money"
                            ? "border-[#E39A89] bg-[#E39A89]/10"
                            : "border-[#1b3c35]/15 dark:border-white/15 hover:border-[#E39A89]/50"
                        }`}
                      >
                        <div className="text-center">
                          <FiUsers className="w-6 h-6 mx-auto text-[#1b3c35] dark:text-white" />
                          <span className="text-xs font-medium text-[#1b3c35] dark:text-white">
                            Mobile Money
                          </span>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Terms */}
                  <div className="flex items-start gap-2.5">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="mt-1 w-4 h-4 rounded border-[#1b3c35]/30 dark:border-white/30 text-[#E39A89] focus:ring-[#E39A89]"
                    />
                    <label
                      htmlFor="terms"
                      className="text-sm text-[#26261F]/70 dark:text-white/70"
                    >
                      I agree to the pre-order terms and understand that
                      delivery takes approximately 2 months.
                    </label>
                  </div>

                  {/* WhatsApp Group */}
                  <div className="bg-[#25D366]/10 p-3 rounded-xl border border-[#25D366]/20">
                    <div className="flex items-center gap-2 text-sm text-[#1b3c35] dark:text-white">
                      <IoLogoWhatsapp className="w-5 h-5 text-[#25D366] flex-shrink-0" />
                      <span>Join our WhatsApp group for updates</span>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="pt-4 border-t border-[#1b3c35]/10 dark:border-white/10">
                    <div className="flex justify-between text-lg font-bold text-[#1b3c35] dark:text-white">
                      <span>Total</span>
                      <span>₵{calculateTotal().toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Submit */}
                  <button
                    onClick={handlePayment}
                    disabled={
                      processing || !agreedToTerms || !whatsappNumber.trim()
                    }
                    className="w-full py-3.5 bg-[#E39A89] hover:bg-[#d9866f] text-white rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {processing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Processing Payment...
                      </>
                    ) : (
                      <>
                        <FiDollarSign className="w-5 h-5" />
                        Pay ₵{calculateTotal().toFixed(2)}
                      </>
                    )}
                  </button>

                  <p className="text-xs text-center text-[#26261F]/50 dark:text-white/50">
                    You&apos;ll receive order confirmation via WhatsApp
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment Processing Step */}
        {step === "payment" && (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#E39A89] mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold text-[#1b3c35] dark:text-white mb-2">
              Processing Payment
            </h2>
            <p className="text-[#26261F]/60 dark:text-white/60">
              Please wait while we confirm your payment...
            </p>
          </div>
        )}

        {/* Completion Step */}
        {step === "complete" && (
          <div className="bg-white dark:bg-[#16302a] ring-1 ring-black/5 dark:ring-white/5 rounded-2xl p-8 sm:p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#8FA593]/20 flex items-center justify-center">
              <FiCheck className="w-10 h-10 text-[#4d6b56] dark:text-[#a9c2ae]" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-[#1b3c35] dark:text-white mb-3">
              Pre-Order Successful! 🎉
            </h2>

            <p className="text-[#26261F]/60 dark:text-white/60 max-w-md mx-auto mb-6">
              Your pre-order has been confirmed. You&apos;ll receive updates via
              WhatsApp. Estimated delivery: 2 months from today.
            </p>

            <div className="bg-[#FBF6EF] dark:bg-[#0f1e1a] rounded-xl p-6 max-w-sm mx-auto mb-8">
              <div className="flex items-center gap-3 justify-center">
                <IoLogoWhatsapp className="w-6 h-6 text-[#25D366]" />
                <span className="text-sm font-medium text-[#1b3c35] dark:text-white">
                  Order ID: #{orderId?.slice(-8).toUpperCase()}
                </span>
              </div>
              <p className="text-sm text-[#26261F]/50 dark:text-white/50 mt-2">
                WhatsApp: {whatsappNumber}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={WHATSAPP_GROUP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#25D366] text-white rounded-xl font-semibold hover:opacity-90 transition-opacity"
              >
                <IoLogoWhatsapp className="w-5 h-5" />
                Join WhatsApp Group
              </a>
              <button
                onClick={() => router.push("/")}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#1b3c35] hover:bg-[#254f45] text-white rounded-xl font-semibold transition-colors"
              >
                Continue Shopping
              </button>
            </div>

            <p className="text-xs text-[#26261F]/40 dark:text-white/40 mt-6">
              You&apos;ll receive a confirmation message on WhatsApp with your
              order details.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
