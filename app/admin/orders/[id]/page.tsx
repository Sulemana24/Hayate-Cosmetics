"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import { db } from "@/lib/firebase";
import { doc, getDoc, Timestamp } from "firebase/firestore";
import {
  FiArrowLeft,
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCalendar,
  FiClock,
  FiDollarSign,
  FiShoppingBag,
  FiPackage,
  FiCreditCard,
  FiTruck,
} from "react-icons/fi";

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  shippingAddress: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    region: string;
    locality: string;
    country: string;
    phone: string;
    email: string;
  };
  city?: string;
  region?: string;
  country?: string;
  totalAmount: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentStatus: "paid" | "pending" | "failed";
  paymentMethod: string;
  shippingMethod: string;
  trackingNumber?: string;
  items: OrderItem[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) return;

      try {
        const orderId = Array.isArray(id) ? id[0] : id;
        if (!orderId) return;

        const orderRef = doc(db, "orders", orderId);
        const orderSnap = await getDoc(orderRef);

        if (orderSnap.exists()) {
          setOrder({ id: orderSnap.id, ...orderSnap.data() } as Order);
        } else {
          alert("Order not found");
          router.back();
        }
      } catch (error) {
        console.error("Failed to fetch order:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, router]);

  const formatDateTime = (timestamp: Timestamp) => {
    const date = timestamp.toDate();
    return {
      date: date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      time: date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      fullDate: date.toISOString(),
    };
  };

  const formatAddress = (order: Order) => {
    const addr = order.shippingAddress;
    return `${addr.firstName} ${addr.lastName}, ${addr.address}, ${addr.city}, ${addr.region}, ${addr.country}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "processing":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "shipped":
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300";
      case "delivered":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "failed":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="bg-gray-100 dark:bg-gray-800 h-48 rounded-xl"
                ></div>
              ))}
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 h-64 rounded-xl"></div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!order) return <AdminLayout>Order not found</AdminLayout>;

  const { date, time, fullDate } = formatDateTime(order.createdAt);
  const address = formatAddress(order);

  return (
    <AdminLayout>
      <div className="p-6 order-detail-container">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white mb-6 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 back-button"
        >
          <FiArrowLeft /> Back to Orders
        </button>

        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white">
              Order #{order.orderNumber}
            </h1>
            <div className="flex items-center gap-3">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                  order.status
                )}`}
              >
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(
                  order.paymentStatus
                )}`}
              >
                Payment: {order.paymentStatus}
              </span>
            </div>
          </div>
          <div className="mt-4 md:mt-0">
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <FiCalendar />
              <time dateTime={fullDate}>
                {date} at {time}
              </time>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Customer Info */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 info-card lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                <FiUser className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="font-semibold text-lg text-gray-800 dark:text-white">
                Customer Information
              </h2>
            </div>
            <div className="space-y-3 text-gray-600 dark:text-gray-300">
              <div className="flex items-center gap-3">
                <div className="text-gray-400">
                  <FiUser />
                </div>
                <div>
                  <p className="font-medium text-gray-800 dark:text-white">
                    {order.customerName}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Customer Name
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-gray-400">
                  <FiMail />
                </div>
                <div>
                  <p className="font-medium text-gray-800 dark:text-white">
                    {order.customerEmail}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Email Address
                  </p>
                </div>
              </div>
              {order.customerPhone && (
                <div className="flex items-center gap-3">
                  <div className="text-gray-400">
                    <FiPhone />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white">
                      {order.customerPhone}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Phone Number
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Shipping Info */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 info-card lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-50 dark:bg-green-900/30 rounded-lg">
                <FiTruck className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="font-semibold text-lg text-gray-800 dark:text-white">
                Shipping Information
              </h2>
            </div>
            <div className="space-y-3 text-gray-600 dark:text-gray-300">
              <div className="flex items-start gap-3">
                <div className="text-gray-400 mt-1">
                  <FiMapPin />
                </div>
                <div>
                  <p className="font-medium text-gray-800 dark:text-white mb-1">
                    Shipping Address
                  </p>
                  <p className="text-sm">{address}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-gray-400">
                  <FiShoppingBag />
                </div>
                <div>
                  <p className="font-medium text-gray-800 dark:text-white">
                    {order.shippingMethod}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Shipping Method
                  </p>
                </div>
              </div>
              {order.trackingNumber && (
                <div className="flex items-center gap-3">
                  <div className="text-gray-400">
                    <FiPackage />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white">
                      {order.trackingNumber}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Tracking Number
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Payment & Order Summary */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 info-card lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                <FiCreditCard className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h2 className="font-semibold text-lg text-gray-800 dark:text-white">
                Payment & Order Summary
              </h2>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600 dark:text-gray-300">
                    Subtotal
                  </span>
                  <span className="font-medium text-gray-800 dark:text-white">
                    ₵{order.totalAmount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600 dark:text-gray-300">
                    Shipping
                  </span>
                  <span className="font-medium text-gray-800 dark:text-white">
                    ₵0.00
                  </span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-lg font-semibold text-gray-800 dark:text-white">
                    Total Amount
                  </span>
                  <span className="text-xl font-bold text-gray-800 dark:text-white">
                    ₵{order.totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">
                    Payment Method
                  </span>
                  <span className="font-medium text-gray-800 dark:text-white">
                    {order.paymentMethod}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">
                    Items Count
                  </span>
                  <span className="font-medium text-gray-800 dark:text-white">
                    {order.items.length} items
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <h2 className="font-semibold text-lg text-gray-800 dark:text-white">
              Order Items ({order.items.length})
            </h2>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {order.items.map((item, index) => (
              <div
                key={item.productId}
                className="p-6 order-item hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-150"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-16 h-16 rounded-lg object-cover border border-gray-200 dark:border-gray-700"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                        <FiPackage className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white mb-1">
                        {item.name}
                      </p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-gray-500 dark:text-gray-400">
                          Product ID: {item.productId}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400">
                          Quantity: {item.quantity}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="font-medium text-gray-800 dark:text-white">
                        ₵{(item.price * item.quantity).toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        ₵{item.price.toFixed(2)} × {item.quantity}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions Footer */}
        <div className="mt-6 flex flex-wrap gap-3 justify-end">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Print Order
          </button>
          {order.status !== "delivered" && order.status !== "cancelled" && (
            <button
              onClick={() => {
                /* Handle status update */
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Update Status
            </button>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
