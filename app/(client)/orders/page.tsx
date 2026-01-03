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
import {
  FiPackage,
  FiCheckCircle,
  FiClock,
  FiTruck,
  FiMapPin,
  FiDollarSign,
  FiCalendar,
  FiShoppingBag,
  FiArrowLeft,
  FiChevronRight,
  FiEye,
  FiRefreshCw,
} from "react-icons/fi";

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
    address?: string;
    phone?: string;
    email?: string;
  };
  paymentStatus?: string;
  paymentMethod?: string;
}

type FirestoreTimestamp = Timestamp | Date | string | null | undefined;

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [refreshing, setRefreshing] = useState(false);

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
        return <FiClock className="w-4 h-4 sm:w-5 sm:h-5" />;
      case "processing":
        return <FiPackage className="w-4 h-4 sm:w-5 sm:h-5" />;
      case "shipped":
        return <FiTruck className="w-4 h-4 sm:w-5 sm:h-5" />;
      case "delivered":
        return <FiCheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />;
      default:
        return <FiPackage className="w-4 h-4 sm:w-5 sm:h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending_payment":
        return "text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400";
      case "processing":
        return "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "shipped":
        return "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400";
      case "delivered":
        return "text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400";
      default:
        return "text-gray-600 bg-gray-50 dark:bg-gray-900/20 dark:text-gray-400";
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

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "pending_payment":
        return "border-red-200 dark:border-red-800";
      case "processing":
        return "border-yellow-200 dark:border-yellow-800";
      case "shipped":
        return "border-blue-200 dark:border-blue-800";
      case "delivered":
        return "border-green-200 dark:border-green-800";
      default:
        return "border-gray-200 dark:border-gray-800";
    }
  };

  const filteredOrders =
    selectedStatus === "all"
      ? orders
      : orders.filter((order) => getDisplayStatus(order) === selectedStatus);

  const statusCounts = {
    all: orders.length,
    pending_payment: orders.filter(
      (order) => getDisplayStatus(order) === "pending_payment"
    ).length,
    processing: orders.filter(
      (order) => getDisplayStatus(order) === "processing"
    ).length,
    shipped: orders.filter((order) => getDisplayStatus(order) === "shipped")
      .length,
    delivered: orders.filter((order) => getDisplayStatus(order) === "delivered")
      .length,
  };

  const refreshOrders = async () => {
    if (!currentUserId) return;

    try {
      setRefreshing(true);
      const ordersRef = collection(db, "users", currentUserId, "orders");
      const q = query(ordersRef, orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);

      const ordersList = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          items: data.items || [],
          shippingAddress: data.shippingAddress || {
            firstName: "N/A",
            lastName: "N/A",
            city: "N/A",
          },
          status: data.status || "pending",
          paymentStatus: data.paymentStatus || "pending",
        };
      }) as Order[];

      setOrders(ordersList);
    } catch (error) {
      console.error("Failed to refresh orders:", error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (auth.currentUser) {
      setCurrentUserId(auth.currentUser.uid);
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
            items: data.items || [],
            shippingAddress: data.shippingAddress || {
              firstName: "N/A",
              lastName: "N/A",
              city: "N/A",
            },
            status: data.status || "pending",
            paymentStatus: data.paymentStatus || "pending",
          };
        }) as Order[];

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
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded-lg w-48 mb-8"></div>
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-64 bg-gray-100 dark:bg-gray-800 rounded-2xl"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-[#d87a6a]/10 via-white to-[#fcefe9] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <button
                onClick={() => window.history.back()}
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 sm:mb-0"
              >
                <FiArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Back</span>
              </button>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                My Orders
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Track and manage all your purchases
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={refreshOrders}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                <FiRefreshCw
                  className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
                />
                <span className="font-medium text-sm">Refresh</span>
              </button>
              <button
                onClick={() => (window.location.href = "/")}
                className="px-4 py-2.5 bg-gradient-to-r from-[#d87a6a] to-[#c76a5a] text-white rounded-lg hover:opacity-90 transition-opacity font-medium text-sm"
              >
                Shop More
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
        {/* Status Filter Tabs */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 mb-6">
            {[
              { id: "all", label: "All Orders", count: statusCounts.all },
              {
                id: "pending_payment",
                label: "Payment Pending",
                count: statusCounts.pending_payment,
              },
              {
                id: "processing",
                label: "Processing",
                count: statusCounts.processing,
              },
              { id: "shipped", label: "Shipped", count: statusCounts.shipped },
              {
                id: "delivered",
                label: "Delivered",
                count: statusCounts.delivered,
              },
            ].map((status) => (
              <button
                key={status.id}
                onClick={() => setSelectedStatus(status.id)}
                className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
                  selectedStatus === status.id
                    ? "bg-gradient-to-r from-[#d87a6a] to-[#c76a5a] text-white shadow-lg"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
                }`}
              >
                <span className="flex items-center gap-2">
                  {status.label}
                  <span
                    className={`px-1.5 py-0.5 text-xs rounded-full ${
                      selectedStatus === status.id
                        ? "bg-white/20"
                        : "bg-gray-100 dark:bg-gray-700"
                    }`}
                  >
                    {status.count}
                  </span>
                </span>
              </button>
            ))}
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Total Orders
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {orders.length}
                  </p>
                </div>
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <FiShoppingBag className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Total Spent
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    ₵
                    {orders
                      .reduce((sum, order) => sum + (order.totalAmount || 0), 0)
                      .toFixed(2)}
                  </p>
                </div>
                <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <FiDollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    In Progress
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {statusCounts.processing + statusCounts.shipped}
                  </p>
                </div>
                <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <FiClock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Completed
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {statusCounts.delivered}
                  </p>
                </div>
                <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <FiCheckCircle className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
                <FiPackage className="w-12 h-12 text-gray-400 dark:text-gray-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                {selectedStatus === "all"
                  ? "No orders yet"
                  : `No ${selectedStatus.replace("_", " ")} orders`}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-sm mx-auto">
                {selectedStatus === "all"
                  ? "Start shopping to see your orders here"
                  : `You don't have any ${selectedStatus.replace(
                      "_",
                      " "
                    )} orders at the moment`}
              </p>
              <button
                onClick={() => (window.location.href = "/")}
                className="px-6 py-3 bg-gradient-to-r from-[#d87a6a] to-[#c76a5a] text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
              >
                Start Shopping
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => {
              const displayStatus = getDisplayStatus(order);
              const itemCount =
                order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

              return (
                <div
                  key={order.id}
                  className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-200 dark:border-gray-700"
                >
                  {/* Order Header */}
                  <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div
                          className={`p-3 rounded-xl ${getStatusColor(
                            displayStatus
                          )} border ${getStatusBadgeColor(displayStatus)}`}
                        >
                          {getStatusIcon(displayStatus)}
                        </div>
                        <div>
                          <div className="flex items-center gap-3 flex-wrap">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                              Order #
                              {order.orderId ||
                                order.id.slice(-8).toUpperCase()}
                            </h3>
                            <span
                              className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                                displayStatus
                              )} border ${getStatusBadgeColor(displayStatus)}`}
                            >
                              {getStatusText(displayStatus)}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-2 text-sm text-gray-600 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <FiCalendar className="w-4 h-4" />
                              {formatFirestoreDate(order.createdAt)}
                            </span>
                            <span className="flex items-center gap-1">
                              <FiShoppingBag className="w-4 h-4" />
                              {itemCount} item{itemCount !== 1 ? "s" : ""}
                            </span>
                            {order.paymentMethod && (
                              <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                                {order.paymentMethod}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="lg:text-right">
                        <p className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                          ₵{(order.totalAmount || 0).toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          Includes shipping & taxes
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Order Content */}
                  <div className="p-6">
                    <div className="grid lg:grid-cols-2 gap-6">
                      {/* Order Items */}
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                          <FiShoppingBag className="w-4 h-4" />
                          Order Items
                        </h4>
                        <div className="space-y-3">
                          {order.items?.slice(0, 3).map((item, index) => (
                            <div
                              key={item.productId || index}
                              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg"
                            >
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 dark:text-white truncate">
                                  {item.name}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  Qty: {item.quantity} × ₵
                                  {item.price.toFixed(2)}
                                </p>
                              </div>
                              <p className="font-semibold text-gray-900 dark:text-white whitespace-nowrap ml-4">
                                ₵{(item.price * item.quantity).toFixed(2)}
                              </p>
                            </div>
                          ))}
                          {order.items && order.items.length > 3 && (
                            <div className="text-center pt-2">
                              <button className="text-sm text-[#d87a6a] hover:text-[#c76a5a] font-medium flex items-center justify-center gap-1 mx-auto">
                                View {order.items.length - 3} more items
                                <FiChevronRight className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Shipping Information */}
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                          <FiMapPin className="w-4 h-4" />
                          Shipping Information
                        </h4>
                        <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-xl">
                          <div className="space-y-2">
                            <div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Recipient
                              </p>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {order.shippingAddress.firstName}{" "}
                                {order.shippingAddress.lastName}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Location
                              </p>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {order.shippingAddress.city}
                                {order.shippingAddress.address &&
                                  `, ${order.shippingAddress.address}`}
                              </p>
                            </div>
                            {order.shippingAddress.phone && (
                              <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  Contact
                                </p>
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {order.shippingAddress.phone}
                                </p>
                              </div>
                            )}
                            <div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Payment Status
                              </p>
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                                  order.paymentStatus === "completed"
                                    ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                                    : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                                }`}
                              >
                                {order.paymentStatus === "completed"
                                  ? "Paid"
                                  : "Pending"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3 pt-6 border-t border-gray-200 dark:border-gray-700 mt-6">
                      <button className="px-4 py-2.5 bg-gradient-to-r from-[#d87a6a] to-[#c76a5a] text-white rounded-lg hover:opacity-90 transition-opacity font-medium text-sm flex items-center gap-2">
                        <FiEye className="w-4 h-4" />
                        View Details
                      </button>
                      <button className="px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors font-medium text-sm">
                        Track Order
                      </button>
                      {displayStatus === "delivered" && (
                        <button className="px-4 py-2.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors font-medium text-sm">
                          Leave Review
                        </button>
                      )}
                      {displayStatus === "pending_payment" && (
                        <button className="px-4 py-2.5 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors font-medium text-sm">
                          Complete Payment
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Order Status Guide */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
            Order Status Guide
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                status: "pending_payment",
                title: "Payment Pending",
                desc: "Awaiting payment confirmation",
              },
              {
                status: "processing",
                title: "Processing",
                desc: "Order is being prepared",
              },
              {
                status: "shipped",
                title: "Shipped",
                desc: "Order is on its way",
              },
              {
                status: "delivered",
                title: "Delivered",
                desc: "Order has been delivered",
              },
            ].map((guide) => (
              <div
                key={guide.status}
                className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={`p-2 rounded-lg ${getStatusColor(guide.status)}`}
                  >
                    {getStatusIcon(guide.status)}
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {guide.title}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {guide.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Need Help Section */}
        <div className="mt-8 p-6 bg-gradient-to-r from-[#d87a6a]/10 to-[#c76a5a]/10 rounded-2xl border border-[#d87a6a]/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                Need help with your order?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Contact our support team for assistance with your orders
              </p>
            </div>
            <button className="px-6 py-3 bg-[#d87a6a] text-white rounded-lg hover:bg-[#c76a5a] transition-colors font-medium whitespace-nowrap">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
