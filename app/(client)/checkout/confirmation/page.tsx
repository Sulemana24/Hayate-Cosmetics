"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FiCheckCircle,
  FiShoppingBag,
  FiMail,
  FiClock,
  FiTruck,
  FiHome,
} from "react-icons/fi";

interface OrderData {
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    region: string;
  };
  items: Array<{
    name: string;
    quantity: number;
    discountedPrice: number;
  }>;
  delivery: {
    name: string;
    estimatedDays: string;
  };
  total: number;
  orderDate: string;
}

export default function ConfirmationPage() {
  const [orderNumber, setOrderNumber] = useState(
    () => `BEAUTY-${Date.now().toString().slice(-8)}`
  );
  const [order, setOrder] = useState<OrderData | null>(() => {
    const savedOrder = localStorage.getItem("beauty-store-last-order");
    return savedOrder ? JSON.parse(savedOrder) : null;
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.removeItem("beauty-store-last-order");
    }, 5 * 60 * 1000);

    return () => clearTimeout(timer);
  }, []);

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#faf7f5] to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e39a89] mx-auto"></div>
          <p className="mt-4 text-gray-600">
            Loading your order confirmation...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#faf7f5] to-white">
      <div className="container mx-auto px-4 md:px-6 py-16">
        <div className="max-w-3xl mx-auto">
          {/* Success Icon */}
          <div className="text-center mb-8">
            <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <FiCheckCircle className="w-16 h-16 text-green-600" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Order Confirmed!
            </h1>
            <p className="text-gray-600">
              Thank you for your order. We&apos;ve sent a confirmation to{" "}
              {order.customer.email}
            </p>
          </div>

          {/* Order Details Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Order Summary */}
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <FiShoppingBag className="w-5 h-5 text-[#e39a89]" />
                  Order Details
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order Number</span>
                    <span className="font-medium text-gray-800">
                      {orderNumber}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date</span>
                    <span className="font-medium text-gray-800">
                      {new Date(order.orderDate).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Amount</span>
                    <span className="font-bold text-gray-800">
                      ₵{order.total.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Method</span>
                    <span className="font-medium text-gray-800">
                      Mobile Money
                    </span>
                  </div>
                </div>
              </div>

              {/* Delivery Information */}
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <FiTruck className="w-5 h-5 text-[#e39a89]" />
                  Delivery Information
                </h2>
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <FiHome className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <p className="font-medium text-gray-800">
                        {order.customer.address}
                      </p>
                      <p className="text-gray-600">
                        {order.customer.city}, {order.customer.region}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiMail className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-600">
                      {order.customer.email}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiClock className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-600">
                      {order.delivery.estimatedDays}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="font-bold text-gray-800 mb-4">Order Items</h3>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0"
                  >
                    <div>
                      <p className="font-medium text-gray-800">{item.name}</p>
                      <p className="text-gray-500 text-sm">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                    <span className="font-semibold text-gray-800">
                      ₵{(item.discountedPrice * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-gradient-to-r from-[#faf7f5] to-white border border-gray-200 rounded-2xl p-6 md:p-8 mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6">
              What Happens Next?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📧</span>
                </div>
                <h3 className="font-bold text-gray-800 mb-2">
                  Order Confirmation
                </h3>
                <p className="text-gray-600 text-sm">
                  You&apos;ll receive an email with your order details and
                  payment instructions.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📦</span>
                </div>
                <h3 className="font-bold text-gray-800 mb-2">Processing</h3>
                <p className="text-gray-600 text-sm">
                  We&apos;ll prepare your order and notify you when it&apos;s
                  ready for shipment.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🚚</span>
                </div>
                <h3 className="font-bold text-gray-800 mb-2">Delivery</h3>
                <p className="text-gray-600 text-sm">
                  Track your order with real-time updates. Delivery in{" "}
                  {order.delivery.estimatedDays}.
                </p>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/collections"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#e39a89] to-[#d87a6a] text-white px-8 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity"
            >
              <FiShoppingBag className="w-5 h-5" />
              Continue Shopping
            </Link>

            <Link
              href="/orders"
              className="inline-flex items-center justify-center gap-2 border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
            >
              View Order History
            </Link>

            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 border-2 border-[#e39a89] text-[#e39a89] px-8 py-3 rounded-xl font-semibold hover:bg-[#e39a89]/5 transition-colors"
            >
              Contact Support
            </Link>
          </div>

          {/* Support Info */}
          <div className="mt-12 text-center">
            <p className="text-gray-600">
              Need help?{" "}
              <Link
                href="/contact"
                className="text-[#e39a89] hover:underline font-medium"
              >
                Contact our customer support
              </Link>{" "}
              or call us at{" "}
              <a
                href="tel:+233241234567"
                className="text-[#e39a89] hover:underline font-medium"
              >
                +233 24 123 4567
              </a>
            </p>
            <p className="text-gray-500 text-sm mt-2">
              We&apos;re available Monday to Saturday, 9:00 AM - 6:00 PM
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
