"use client";

import { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  query,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { FiPackage, FiCheckCircle, FiClock, FiTruck } from "react-icons/fi";

interface OrderItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  orderId: string;
  items: OrderItem[];
  totalAmount: number;
  status: string;
  createdAt: Date;
  shippingAddress: {
    firstName: string;
    lastName: string;
    city: string;
  };
  paymentStatus?: string;
}

type FirestoreTimestamp = Timestamp | Date | string | null | undefined;

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const auth = getAuth();

  const formatFirestoreDate = (timestamp: FirestoreTimestamp): string => {
    if (!timestamp) return "N/A";

    try {
      let date: Date;

      if (timestamp instanceof Timestamp) {
        date = timestamp.toDate();
      } else if (timestamp instanceof Date) {
        date = timestamp;
      } else if (typeof timestamp === "string") {
        date = new Date(timestamp);
      } else {
        return "Date not available";
      }

      if (isNaN(date.getTime())) return "Invalid date";

      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      console.error("Error formatting date:", error, timestamp);
      return "Invalid date";
    }
  };

  const getDisplayStatus = (order: Order): string => {
    if (order.paymentStatus === "pending") {
      return "pending_payment";
    }
    if (order.paymentStatus === "completed" && order.status === "processing") {
      return "processing";
    }
    return order.status || "pending";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending_payment":
        return <FiClock className="text-red-500" />;
      case "processing":
        return <FiClock className="text-yellow-500" />;
      case "shipped":
        return <FiTruck className="text-blue-500" />;
      case "delivered":
        return <FiCheckCircle className="text-green-500" />;
      default:
        return <FiPackage className="text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending_payment":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "processing":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "shipped":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "delivered":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending_payment":
        return "Pending Payment";
      case "processing":
        return "Processing";
      case "shipped":
        return "Shipped";
      case "delivered":
        return "Delivered";
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  useEffect(() => {
    if (auth.currentUser) {
      setCurrentUserId(auth.currentUser.uid);
    } else {
      // Optional: redirect to login if not authenticated
      // window.location.href = "/login";
    }
  }, [auth.currentUser]);

  useEffect(() => {
    if (!currentUserId) return;

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const ordersRef = collection(db, "users", currentUserId, "orders");
        const q = query(ordersRef, orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);

        const ordersList = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            // Ensure items is always an array
            items: data.items || [],
            // Ensure shippingAddress exists
            shippingAddress: data.shippingAddress || {
              firstName: "N/A",
              lastName: "N/A",
              city: "N/A",
            },
            // Ensure status exists
            status: data.status || "pending",
            // Ensure paymentStatus exists
            paymentStatus: data.paymentStatus || "pending",
          };
        }) as Order[];

        console.log("Fetched orders:", ordersList); // Debug log
        setOrders(ordersList);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [currentUserId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#d87a6a]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        My Orders
      </h1>

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <FiPackage className="w-24 h-24 text-gray-300 dark:text-gray-700 mx-auto mb-6" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No orders yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Your orders will appear here once you make a purchase.
          </p>
          <button
            onClick={() => (window.location.href = "/")}
            className="px-6 py-3 bg-[#d87a6a] text-white rounded-lg hover:bg-[#c76a5a] transition-colors"
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const displayStatus = getDisplayStatus(order);

            return (
              <div
                key={order.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(displayStatus)}
                      <span className="font-semibold text-gray-900 dark:text-white">
                        Order #{order.orderId || order.id}
                      </span>
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          displayStatus
                        )}`}
                      >
                        {getStatusText(displayStatus)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Placed on {formatFirestoreDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="mt-4 md:mt-0 text-right">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      ₵{order.totalAmount?.toFixed(2) || "0.00"}
                    </p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-3">
                    <span>Shipping to: </span>
                    <span className="ml-2 font-medium">
                      {order.shippingAddress.firstName}{" "}
                      {order.shippingAddress.lastName},{" "}
                      {order.shippingAddress.city}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {order.items && order.items.length > 0 ? (
                      <>
                        {order.items.slice(0, 3).map((item, index) => (
                          <div
                            key={item.productId || index}
                            className="flex justify-between text-sm"
                          >
                            <span>
                              {item.name} × {item.quantity}
                            </span>
                            <span>
                              ₵{(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            +{order.items.length - 3} more items
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        No items in this order
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t text-xs text-gray-400">
                    <p>Order ID: {order.id}</p>
                    <p>Status: {order.status}</p>
                    <p>Payment Status: {order.paymentStatus}</p>
                    <p>Display Status: {displayStatus}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
