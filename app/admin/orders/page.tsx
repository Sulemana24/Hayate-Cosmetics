"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  FiSearch,
  FiFilter,
  FiEye,
  FiTrash2,
  FiChevronDown,
  FiClock,
  FiPackage,
  FiTruck,
  FiCheckCircle,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCalendar,
  FiNavigation,
} from "react-icons/fi";
import { db } from "@/lib/firebase";
import {
  collectionGroup,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
  updateDoc,
  Timestamp,
} from "firebase/firestore";

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  shippingAddress: string;
  city?: string;
  region?: string;
  country?: string;
  totalAmount: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentStatus: "paid" | "pending" | "failed";
  paymentMethod: string;
  shippingMethod?: string;
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
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const statusOptions = [
    "All",
    "pending",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
  ];

  // Fetch all orders safely using collectionGroup
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const q = query(
          collectionGroup(db, "orders"),
          orderBy("createdAt", "desc")
        );
        const snapshot = await getDocs(q);
        const ordersList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Order[];
        setOrders(ordersList);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // Delete order
  const handleDelete = async (id: string, orderNumber: string) => {
    if (
      !confirm(
        `Are you sure you want to delete order "${orderNumber}"? This cannot be undone.`
      )
    )
      return;
    try {
      await deleteDoc(doc(db, "orders", id));
      setOrders(orders.filter((o) => o.id !== id));
    } catch (error) {
      console.error(error);
      alert("Failed to delete order");
    }
  };

  // Update order status
  const updateOrderStatus = async (id: string, newStatus: Order["status"]) => {
    try {
      await updateDoc(doc(db, "orders", id), {
        status: newStatus,
        updatedAt: new Date(),
      });
      setOrders(
        orders.map((o) => (o.id === id ? { ...o, status: newStatus } : o))
      );
    } catch (error) {
      console.error(error);
      alert("Failed to update status");
    }
  };

  // Dynamic advance status
  const nextStatusMap = {
    pending: "processing",
    processing: "shipped",
    shipped: "delivered",
  } as const;
  const handleAdvanceStatus = (order: Order) => {
    const nextStatus =
      nextStatusMap[order.status as keyof typeof nextStatusMap];
    if (nextStatus) updateOrderStatus(order.id, nextStatus);
  };

  // Filtered and paginated orders
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerPhone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      false;
    const matchesStatus =
      selectedStatus === "All" || order.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const currentOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Helpers
  const getStatusInfo = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return {
          color: "bg-yellow-100 text-yellow-800",
          icon: <FiClock className="w-3 h-3 mr-1" />,
          bgColor: "bg-yellow-500",
        };
      case "processing":
        return {
          color: "bg-blue-100 text-blue-800",
          icon: <FiPackage className="w-3 h-3 mr-1" />,
          bgColor: "bg-blue-500",
        };
      case "shipped":
        return {
          color: "bg-indigo-100 text-indigo-800",
          icon: <FiTruck className="w-3 h-3 mr-1" />,
          bgColor: "bg-indigo-500",
        };
      case "delivered":
        return {
          color: "bg-green-100 text-green-800",
          icon: <FiCheckCircle className="w-3 h-3 mr-1" />,
          bgColor: "bg-green-500",
        };
      case "cancelled":
        return {
          color: "bg-red-100 text-red-800",
          icon: <FiX className="w-3 h-3 mr-1" />,
          bgColor: "bg-red-500",
        };
      default:
        return {
          color: "bg-gray-100 text-gray-800",
          icon: <FiClock className="w-3 h-3 mr-1" />,
          bgColor: "bg-gray-500",
        };
    }
  };

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

  const formatAddress = (order: Order) =>
    [order.shippingAddress, order.city, order.region, order.country]
      .filter(Boolean)
      .join(", ");

  if (loading)
    return (
      <AdminLayout>
        <div className="flex justify-center items-center min-h-screen">
          Loading...
        </div>
      </AdminLayout>
    );

  return (
    <AdminLayout>
      <div className="p-4 md:p-6">
        <h1 className="text-2xl font-bold mb-4">Orders Management</h1>

        {/* Search & Filter */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              className="w-full pl-10 pr-4 py-2 border rounded-xl"
              placeholder="Search by order, name, email, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="relative">
            <button
              onClick={() => setShowStatusDropdown(!showStatusDropdown)}
              className="px-4 py-2 border rounded-xl"
            >
              Status: {selectedStatus} <FiChevronDown className="inline" />
            </button>
            {showStatusDropdown && (
              <div className="absolute bg-white border rounded-xl mt-1 z-10">
                {statusOptions.map((status) => (
                  <button
                    key={status}
                    className={`w-full px-4 py-2 text-left ${
                      selectedStatus === status ? "font-bold" : ""
                    }`}
                    onClick={() => {
                      setSelectedStatus(status);
                      setShowStatusDropdown(false);
                    }}
                  >
                    {status}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="text-left text-gray-600 dark:text-gray-300">
                <th className="py-3 pl-4">Order</th>
                <th>Customer</th>
                <th>Shipping</th>
                <th>Amount</th>
                <th>Status</th>
                <th className="pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentOrders.length > 0 ? (
                currentOrders.map((order) => {
                  const statusInfo = getStatusInfo(order.status);
                  const { date, time } = formatDateTime(order.createdAt);
                  const address = formatAddress(order);

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/30"
                    >
                      <td className="py-3 pl-4">
                        <div className="font-bold">{order.orderNumber}</div>
                        <div className="text-xs text-gray-500">
                          {date} • {time}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          {order.items
                            .map((i) => `${i.name} x${i.quantity}`)
                            .join(", ")}
                        </div>
                      </td>
                      <td>
                        <div className="text-sm font-medium">
                          {order.customerName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {order.customerEmail}
                        </div>
                        {order.customerPhone && (
                          <div className="text-xs text-gray-500">
                            {order.customerPhone}
                          </div>
                        )}
                      </td>
                      <td>
                        <div className="text-xs">{address}</div>
                        {order.shippingMethod && (
                          <div className="text-xs text-gray-500">
                            Method: {order.shippingMethod}
                          </div>
                        )}
                      </td>
                      <td>
                        <div className="font-bold">
                          ₵{order.totalAmount.toFixed(2)}
                        </div>
                        <div className="text-xs">{order.paymentStatus}</div>
                      </td>
                      <td>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${statusInfo.color}`}
                        >
                          {statusInfo.icon}{" "}
                          {order.status.charAt(0).toUpperCase() +
                            order.status.slice(1)}
                        </span>
                        {["pending", "processing", "shipped"].includes(
                          order.status
                        ) && (
                          <button
                            onClick={() => handleAdvanceStatus(order)}
                            className="text-blue-600 text-xs mt-1 block"
                          >
                            → Advance Status
                          </button>
                        )}
                      </td>
                      <td className="pr-4 text-right flex justify-end gap-2">
                        <Link
                          href={`/admin/orders/view/${order.id}`}
                          title="View"
                        >
                          <FiEye />
                        </Link>
                        <button
                          onClick={() =>
                            updateOrderStatus(order.id, "cancelled")
                          }
                          disabled={
                            order.status === "cancelled" ||
                            order.status === "delivered"
                          }
                          className={`p-1 ${
                            order.status === "cancelled" ||
                            order.status === "delivered"
                              ? "opacity-50 cursor-not-allowed"
                              : "text-red-600"
                          }`}
                        >
                          <FiX />
                        </button>
                        <button
                          onClick={() =>
                            handleDelete(order.id, order.orderNumber)
                          }
                          className="text-red-600 p-1"
                        >
                          <FiTrash2 />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">
                    No orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
            >
              Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`${currentPage === i + 1 ? "font-bold" : ""}`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
