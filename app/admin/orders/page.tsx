"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AdminLayout from "@/components/admin/AdminLayout";
import Image from "next/image";
import {
  FiSearch,
  FiFilter,
  FiEye,
  FiEdit,
  FiTrash2,
  FiChevronDown,
  FiPackage,
  FiShoppingBag,
  FiDollarSign,
  FiTruck,
  FiCheckCircle,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiUser,
  FiMail,
  FiMapPin,
  FiCalendar,
  FiPhone,
  FiNavigation,
} from "react-icons/fi";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
  Timestamp,
  updateDoc,
} from "firebase/firestore";

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  city: string;
  region: string;
  country: string;
  totalAmount: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentStatus: "paid" | "pending" | "failed";
  paymentMethod: string;
  shippingMethod: string;
  trackingNumber?: string;
  items: Array<{
    productId: string;
    name: string;
    price: number;
    quantity: number;
    imageUrl?: string;
  }>;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export default function OrdersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  const statusOptions = [
    "All",
    "pending",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
  ];

 
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        const items = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Order[];
        setOrders(items);
      } catch (error) {
        console.error("Firestore fetch failed:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);


  const handleDelete = async (id: string, orderNumber: string) => {
    if (
      !confirm(
        `Are you sure you want to delete order "${orderNumber}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await deleteDoc(doc(db, "orders", id));
      setOrders(orders.filter((o) => o.id !== id));
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete order");
    }
  };

 
  const updateOrderStatus = async (id: string, newStatus: Order["status"]) => {
    try {
      await updateDoc(doc(db, "orders", id), {
        status: newStatus,
        updatedAt: new Date(),
      });

      setOrders(
        orders.map((order) =>
          order.id === id ? { ...order, status: newStatus } : order
        )
      );
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("Failed to update order status");
    }
  };

  
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerPhone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.trackingNumber &&
        order.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      selectedStatus === "All" || order.status === selectedStatus;

    const matchesPaymentStatus =
      selectedPaymentStatus === "All" ||
      order.paymentStatus === selectedPaymentStatus;

    return matchesSearch && matchesStatus && matchesPaymentStatus;
  });


  const sortedOrders = [...filteredOrders].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return b.createdAt.seconds - a.createdAt.seconds;
      case "oldest":
        return a.createdAt.seconds - b.createdAt.seconds;
      case "amount-low":
        return a.totalAmount - b.totalAmount;
      case "amount-high":
        return b.totalAmount - a.totalAmount;
      default:
        return 0;
    }
  });

 
  const totalPages = Math.ceil(sortedOrders.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = sortedOrders.slice(indexOfFirstItem, indexOfLastItem);


  const getStatusInfo = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return {
          color:
            "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
          icon: <FiClock className="w-3 h-3 mr-1" />,
          bgColor: "bg-yellow-500",
        };
      case "processing":
        return {
          color:
            "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
          icon: <FiPackage className="w-3 h-3 mr-1" />,
          bgColor: "bg-blue-500",
        };
      case "shipped":
        return {
          color:
            "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
          icon: <FiTruck className="w-3 h-3 mr-1" />,
          bgColor: "bg-indigo-500",
        };
      case "delivered":
        return {
          color:
            "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
          icon: <FiCheckCircle className="w-3 h-3 mr-1" />,
          bgColor: "bg-green-500",
        };
      case "cancelled":
        return {
          color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
          icon: <FiX className="w-3 h-3 mr-1" />,
          bgColor: "bg-red-500",
        };
      default:
        return {
          color:
            "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
          icon: <FiClock className="w-3 h-3 mr-1" />,
          bgColor: "bg-gray-500",
        };
    }
  };

  
  const getPaymentStatusColor = (status: Order["paymentStatus"]) => {
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

 
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const processingOrders = orders.filter(
    (o) => o.status === "processing"
  ).length;
  const shippedOrders = orders.filter((o) => o.status === "shipped").length;
  const deliveredOrders = orders.filter((o) => o.status === "delivered").length;
  const totalRevenue = orders.reduce(
    (sum, order) => sum + order.totalAmount,
    0
  );


  const hasActiveFilters =
    searchQuery || selectedStatus !== "All" || selectedPaymentStatus !== "All";


  const formatDateTime = (timestamp: Timestamp) => {
    const date = timestamp.toDate();
    return {
      date: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      time: date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
    };
  };


  const formatAddress = (order: Order) => {
    const parts = [order.shippingAddress];
    if (order.city) parts.push(order.city);
    if (order.region) parts.push(order.region);
    if (order.country) parts.push(order.country);
    return parts.join(", ");
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-4rem)] bg-gradient-to-br from-[#faf7f5] to-[#f0ece9] dark:from-gray-900 dark:to-gray-800">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 border-4 border-[#e39a89] dark:border-[#1b3c35] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-600 dark:text-gray-400">
              Loading orders...
            </p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-4 md:p-6">
       
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#1b3c35] dark:text-white mb-2">
                Orders Management
              </h1>
              <p className="text-gray-500 dark:text-gray-400">
                Manage customer orders, shipments, and payments
              </p>
            </div>
            {hasActiveFilters && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedStatus("All");
                  setSelectedPaymentStatus("All");
                }}
                className="inline-flex items-center justify-center gap-2 text-sm text-[#e39a89] hover:text-[#d87a6a] dark:text-[#1b3c35] dark:hover:text-[#2a4d45] px-4 py-2 border border-[#e39a89] dark:border-[#1b3c35] rounded-xl hover:bg-[#e39a89]/5 dark:hover:bg-[#1b3c35]/10 transition-colors duration-200"
              >
                <FiX className="w-4 h-4" />
                Clear Filters
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 transition-all hover:shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-green-300 dark:bg-green-400">
                <FiShoppingBag className="w-6 h-6 text-[#e39a89] dark:text-[#1b3c35]" />
              </div>
              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                +{orders.length > 0 ? "24.5" : "0"}%
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Total Orders
            </p>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
              {totalOrders}
            </h3>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 transition-all hover:shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-green-300 dark:bg-green-400">
                <FiClock className="w-6 h-6 text-[#e39a89] dark:text-[#1b3c35]" />
              </div>
              <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                {pendingOrders}
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Pending
            </p>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
              {pendingOrders}
            </h3>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 transition-all hover:shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-green-300 dark:bg-green-400">
                <FiTruck className="w-6 h-6 text-[#e39a89] dark:text-[#1b3c35]" />
              </div>
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                {shippedOrders}
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Shipped
            </p>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
              {shippedOrders}
            </h3>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 transition-all hover:shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-green-300 dark:bg-green-400">
                <FiCheckCircle className="w-6 h-6 text-[#e39a89] dark:text-[#1b3c35]" />
              </div>
              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                {deliveredOrders}
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Delivered
            </p>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
              {deliveredOrders}
            </h3>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 transition-all hover:shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-green-300 dark:bg-green-400">
                <FiDollarSign className="w-6 h-6 text-[#e39a89] dark:text-[#1b3c35]" />
              </div>
              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                +{totalRevenue > 0 ? "18.2" : "0"}%
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Total Revenue
            </p>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
              ₵
              {totalRevenue.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </h3>
          </div>
        </div>

      
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
           
            <div className="flex-1">
              <div className="relative">
                <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by order #, name, email, phone, or tracking #..."
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#e39a89]/20 focus:border-[#e39a89] dark:focus:border-[#1b3c35] outline-none transition-all duration-200"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

           
            <div className="relative">
              <button
                onClick={() => {
                  setShowStatusDropdown(!showStatusDropdown);
                }}
                className="flex items-center gap-2 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200 w-full"
              >
                <FiFilter className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700 dark:text-gray-300">
                  Status: {selectedStatus}
                </span>
                <FiChevronDown className="w-5 h-5 text-gray-400" />
              </button>

              {showStatusDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowStatusDropdown(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-20">
                    {statusOptions.map((status) => (
                      <button
                        key={status}
                        onClick={() => {
                          setSelectedStatus(status);
                          setShowStatusDropdown(false);
                        }}
                        className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 first:rounded-t-xl last:rounded-b-xl ${
                          selectedStatus === status
                            ? "text-[#e39a89] dark:text-[#1b3c35] font-medium"
                            : "text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr className="text-left text-sm text-gray-500 dark:text-gray-400">
                  <th className="py-4 pl-6 font-medium">Order Details</th>
                  <th className="py-4 font-medium">Customer </th>
                  <th className="py-4 font-medium">Shipping </th>
                  <th className="py-4 font-medium">Amount</th>
                  <th className="py-4 font-medium">Status</th>
                  <th className="py-4 pr-6 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {currentOrders.length > 0 ? (
                  currentOrders.map((order) => {
                    const statusInfo = getStatusInfo(order.status);
                    const { date, time } = formatDateTime(order.createdAt);
                    const address = formatAddress(order);

                    return (
                      <tr
                        key={order.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors duration-150"
                      >
                        
                        <td className="py-4 pl-6">
                          <div className="space-y-3">
                            <div>
                              <h4 className="font-bold text-gray-800 dark:text-white mb-1">
                                {order.orderNumber}
                              </h4>
                              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <FiCalendar className="w-3 h-3" />
                                <span>{date}</span>
                                <span className="mx-1">•</span>
                                <FiClock className="w-3 h-3" />
                                <span>{time}</span>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="text-sm text-gray-600 dark:text-gray-300">
                                {order.items.length} item
                                {order.items.length !== 1 ? "s" : ""} •{" "}
                                {order.paymentMethod}
                              </div>
                              {order.trackingNumber && (
                                <div className="flex items-center gap-1 text-xs">
                                  <FiNavigation className="w-3 h-3 text-blue-500" />
                                  <span className="text-blue-600 dark:text-blue-400 font-medium">
                                    {order.trackingNumber}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="py-4">
                          <div className="space-y-2">
                            <div className="flex items-start gap-2">
                              <FiUser className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="font-medium text-gray-800 dark:text-white">
                                  {order.customerName}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <FiMail className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {order.customerEmail}
                                </p>
                              </div>
                            </div>
                            {order.customerPhone && (
                              <div className="flex items-start gap-2">
                                <FiPhone className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {order.customerPhone}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Shipping Info Column - NEW */}
                        <td className="py-4">
                          <div className="space-y-2 max-w-xs">
                            <div className="flex items-start gap-2">
                              <FiMapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                  {address}
                                </p>
                              </div>
                            </div>
                            {order.shippingMethod && (
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                <span className="font-medium">Method:</span>{" "}
                                {order.shippingMethod}
                              </div>
                            )}
                            {/* Shipping status indicator */}
                            <div className="flex items-center gap-2 mt-1">
                              <div
                                className={`w-2 h-2 rounded-full ${statusInfo.bgColor}`}
                              ></div>
                              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                {order.status.charAt(0).toUpperCase() +
                                  order.status.slice(1)}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Amount Column */}
                        <td className="py-4">
                          <div className="space-y-1">
                            <div className="text-lg font-bold text-gray-800 dark:text-white">
                              ₵{order.totalAmount.toFixed(2)}
                            </div>
                            <div
                              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getPaymentStatusColor(
                                order.paymentStatus
                              )}`}
                            >
                              {order.paymentStatus.charAt(0).toUpperCase() +
                                order.paymentStatus.slice(1)}
                            </div>
                          </div>
                        </td>

                        {/* Status Column */}
                        <td className="py-4">
                          <div className="space-y-2">
                            <span
                              className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${statusInfo.color}`}
                            >
                              {statusInfo.icon}
                              {order.status.charAt(0).toUpperCase() +
                                order.status.slice(1)}
                            </span>
                            <div className="text-xs space-y-1">
                              {order.status === "pending" && (
                                <button
                                  onClick={() =>
                                    updateOrderStatus(order.id, "processing")
                                  }
                                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors w-full text-left"
                                >
                                  → Mark as Processing
                                </button>
                              )}
                              {order.status === "processing" && (
                                <button
                                  onClick={() =>
                                    updateOrderStatus(order.id, "shipped")
                                  }
                                  className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors w-full text-left"
                                >
                                  → Mark as Shipped
                                </button>
                              )}
                              {order.status === "shipped" && (
                                <button
                                  onClick={() =>
                                    updateOrderStatus(order.id, "delivered")
                                  }
                                  className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 transition-colors w-full text-left"
                                >
                                  → Mark as Delivered
                                </button>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Actions Column */}
                        <td className="py-4 pr-6">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/admin/orders/view/${order.id}`}
                              className="p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30 rounded-lg transition-colors duration-200"
                              title="View Details"
                            >
                              <FiEye className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() =>
                                updateOrderStatus(order.id, "cancelled")
                              }
                              disabled={
                                order.status === "cancelled" ||
                                order.status === "delivered"
                              }
                              className={`p-2 rounded-lg transition-colors duration-200 ${
                                order.status === "cancelled" ||
                                order.status === "delivered"
                                  ? "opacity-50 cursor-not-allowed text-gray-400"
                                  : "text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30"
                              }`}
                              title="Cancel Order"
                            >
                              <FiX className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                handleDelete(order.id, order.orderNumber)
                              }
                              className="p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 rounded-lg transition-colors duration-200"
                              title="Delete"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-300 dark:bg-green-400 flex items-center justify-center">
                        <FiShoppingBag className="w-8 h-8 text-[#e39a89] dark:text-[#1b3c35]" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
                        No orders found
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400 mb-4">
                        {hasActiveFilters
                          ? "Try adjusting your filters or search term"
                          : "No orders have been placed yet"}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {currentOrders.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Showing{" "}
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {indexOfFirstItem + 1}-
                    {Math.min(indexOfLastItem, sortedOrders.length)}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {sortedOrders.length}
                  </span>{" "}
                  orders
                  {hasActiveFilters && (
                    <span className="ml-2 text-xs px-2 py-1 bg-[#e39a89]/10 text-[#e39a89] rounded">
                      Filtered
                    </span>
                  )}
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      <FiChevronLeft className="w-4 h-4" />
                    </button>

                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-10 h-10 rounded-lg font-medium transition-colors duration-200 ${
                            currentPage === pageNum
                              ? "bg-gradient-to-r from-[#e39a89] to-[#d87a6a] text-white"
                              : "border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      <FiChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            © {new Date().getFullYear()} Hayate Cosmetics. All rights reserved.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}
