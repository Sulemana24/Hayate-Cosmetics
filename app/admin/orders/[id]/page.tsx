"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  updateDoc,
  Timestamp,
  deleteDoc,
} from "firebase/firestore";
import { useToast } from "@/components/ToastProvider";
import {
  FiArrowLeft,
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiClock,
  FiPackage,
  FiCreditCard,
  FiTruck,
  FiPrinter,
  FiEdit,
  FiCheck,
  FiX,
  FiChevronDown,
  FiCheckCircle,
  FiHome,
  FiAlertCircle,
  FiTrash2,
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
  orderCode: string;
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
  userId?: string;
}

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const statusOptions = [
    {
      value: "pending",
      label: "Pending",
      icon: <FiClock className="w-4 h-4" />,
    },
    {
      value: "processing",
      label: "Processing",
      icon: <FiPackage className="w-4 h-4" />,
    },
    {
      value: "shipped",
      label: "Shipped",
      icon: <FiTruck className="w-4 h-4" />,
    },
    {
      value: "delivered",
      label: "Delivered",
      icon: <FiCheckCircle className="w-4 h-4" />,
    },
    {
      value: "cancelled",
      label: "Cancelled",
      icon: <FiX className="w-4 h-4" />,
    },
  ];

  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) return;

      try {
        const orderId = Array.isArray(id) ? id[0] : id;
        if (!orderId) return;

        const orderRef = doc(db, "orders", orderId);
        const orderSnap = await getDoc(orderRef);

        if (orderSnap.exists()) {
          const orderData = { id: orderSnap.id, ...orderSnap.data() } as Order;
          setOrder(orderData);
          setSelectedStatus(orderData.status);
        } else {
          showToast({
            title: "Error",
            message: "Order not found",
            type: "error",
          });
          router.push("/admin/orders");
        }
      } catch (error) {
        showToast({
          title: "Error",
          message: "Failed to load order details",
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, router, showToast]);

  const updateOrderStatus = async (newStatus: Order["status"]) => {
    if (!order) return;

    try {
      setUpdating(true);
      const orderRef = doc(db, "orders", order.id);

      await updateDoc(orderRef, {
        status: newStatus,
        updatedAt: new Date(),
      });

      setOrder({
        ...order,
        status: newStatus,
        updatedAt: Timestamp.now(),
      });

      showToast({
        title: "Success",
        message: `Order status updated to ${newStatus}`,
        type: "success",
      });

      setShowStatusDropdown(false);
    } catch (error) {
      showToast({
        title: "Error",
        message: "Failed to update order status",
        type: "error",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!order) return;

    try {
      await deleteDoc(doc(db, "orders", order.id));

      showToast({
        type: "success",
        title: "Order Deleted",
        message: `Order ${order.orderCode} was removed successfully.`,
      });

      router.push("/admin/orders");
    } catch (error) {
      showToast({
        type: "error",
        title: "Delete Failed",
        message: "Failed to delete order. Please try again.",
      });
    }
  };

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <FiClock className="w-4 h-4" />;
      case "processing":
        return <FiPackage className="w-4 h-4" />;
      case "shipped":
        return <FiTruck className="w-4 h-4" />;
      case "delivered":
        return <FiHome className="w-4 h-4" />;
      case "cancelled":
        return <FiX className="w-4 h-4" />;
      default:
        return <FiAlertCircle className="w-4 h-4" />;
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

  const handlePrint = () => {
    window.print();
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

  if (!order) {
    return (
      <AdminLayout>
        <div className="p-6 text-center">
          <FiPackage className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            Order Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            The order you&apos;re looking for doesn&apos;t exist.
          </p>
        </div>
      </AdminLayout>
    );
  }

  const { date, time, fullDate } = formatDateTime(order.createdAt);
  const address = formatAddress(order);

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <button
            onClick={() => router.push("/admin/orders")}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
          >
            <FiArrowLeft /> Back to Orders
          </button>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <FiPrinter /> Print
            </button>

            {order.status !== "delivered" && order.status !== "cancelled" && (
              <div className="relative">
                <button
                  onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                  className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <FiEdit /> Update Status <FiChevronDown />
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
                          key={status.value}
                          onClick={() => {
                            updateOrderStatus(status.value as Order["status"]);
                          }}
                          disabled={updating || status.value === order.status}
                          className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 first:rounded-t-xl last:rounded-l-xl flex items-center gap-2 ${
                            status.value === order.status
                              ? "text-gray-400 cursor-not-allowed"
                              : "text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {status.icon}
                          {status.label}
                          {status.value === order.status && (
                            <FiCheck className="ml-auto text-green-500" />
                          )}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
            >
              <FiTrash2 /> Delete
            </button>
          </div>
        </div>

        {/* Order Details */}
        <div id="receipt" className="print-container">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden print:shadow-none print:rounded-none">
            {/* Receipt Header */}
            <div className="bg-gradient-to-r from-[#e39a89] to-[#d87a6a] p-6 text-white print:bg-white print:text-gray-900 print:border-b print:border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold mb-1">Hayate Cosmetics</h1>
                  <p className="text-white/80 print:text-gray-600">
                    Order Receipt
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm opacity-90 print:text-gray-600">
                    Order #{order.orderCode}
                  </p>
                  <p className="text-sm opacity-75 print:text-gray-500">
                    {date}
                  </p>
                </div>
              </div>
            </div>

            {/* Receipt Content */}
            <div className="p-6 print:p-4">
              {/* Status Badges */}
              <div className="flex flex-wrap gap-3 mb-6 print:mb-4">
                <span
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(
                    order.status,
                  )}`}
                >
                  {getStatusIcon(order.status)}
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
                <span
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${getPaymentStatusColor(
                    order.paymentStatus,
                  )}`}
                >
                  <FiCreditCard className="w-4 h-4" />
                  {order.paymentStatus === "paid"
                    ? "Paid"
                    : order.paymentStatus === "pending"
                      ? "Pending Payment"
                      : "Payment Failed"}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print:gap-4">
                {/* Customer Info */}
                <div className="space-y-3 print:space-y-2">
                  <h3 className="font-semibold text-gray-700 dark:text-gray-300 print:text-gray-800 text-sm uppercase tracking-wider">
                    Customer Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-3">
                      <FiUser className="w-4 h-4 text-gray-400 mt-0.5 print:text-gray-500" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white print:text-gray-900">
                          {order.customerName}
                        </p>
                        <p className="text-gray-500 dark:text-gray-400 print:text-gray-500">
                          Customer Name
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <FiMail className="w-4 h-4 text-gray-400 mt-0.5 print:text-gray-500" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white print:text-gray-900">
                          {order.customerEmail}
                        </p>
                        <p className="text-gray-500 dark:text-gray-400 print:text-gray-500">
                          Email Address
                        </p>
                      </div>
                    </div>
                    {order.customerPhone && (
                      <div className="flex items-start gap-3">
                        <FiPhone className="w-4 h-4 text-gray-400 mt-0.5 print:text-gray-500" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white print:text-gray-900">
                            {order.customerPhone}
                          </p>
                          <p className="text-gray-500 dark:text-gray-400 print:text-gray-500">
                            Phone Number
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Shipping Info */}
                <div className="space-y-3 print:space-y-2">
                  <h3 className="font-semibold text-gray-700 dark:text-gray-300 print:text-gray-800 text-sm uppercase tracking-wider">
                    Shipping Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-3">
                      <FiMapPin className="w-4 h-4 text-gray-400 mt-0.5 print:text-gray-500" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white print:text-gray-900">
                          {order.shippingAddress.firstName}{" "}
                          {order.shippingAddress.lastName}
                        </p>
                        <p className="text-gray-500 dark:text-gray-400 print:text-gray-500">
                          {order.shippingAddress.address}
                        </p>
                        <p className="text-gray-500 dark:text-gray-400 print:text-gray-500">
                          {order.shippingAddress.city},{" "}
                          {order.shippingAddress.region}
                        </p>
                        <p className="text-gray-500 dark:text-gray-400 print:text-gray-500">
                          {order.shippingAddress.country}
                        </p>
                      </div>
                    </div>
                    {order.trackingNumber && (
                      <div className="flex items-start gap-3">
                        <FiPackage className="w-4 h-4 text-gray-400 mt-0.5 print:text-gray-500" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white print:text-gray-900">
                            {order.trackingNumber}
                          </p>
                          <p className="text-gray-500 dark:text-gray-400 print:text-gray-500">
                            Tracking Number
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="space-y-3 print:space-y-2">
                  <h3 className="font-semibold text-gray-700 dark:text-gray-300 print:text-gray-800 text-sm uppercase tracking-wider">
                    Order Summary
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400 print:text-gray-500">
                        Order Date
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white print:text-gray-900">
                        {date}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400 print:text-gray-500">
                        Payment Method
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white print:text-gray-900">
                        {order.paymentMethod}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400 print:text-gray-500">
                        Shipping Method
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white print:text-gray-900">
                        {order.shippingMethod}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400 print:text-gray-500">
                        Items
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white print:text-gray-900">
                        {order.items.length} items
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="mt-6 print:mt-4">
                <h3 className="font-semibold text-gray-700 dark:text-gray-300 print:text-gray-800 text-sm uppercase tracking-wider mb-4">
                  Order Items
                </h3>
                <div className="border border-gray-200 dark:border-gray-700 print:border-gray-300 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800 print:bg-gray-100">
                      <tr className="text-left text-sm text-gray-600 dark:text-gray-400 print:text-gray-600">
                        <th className="px-4 py-3">Product</th>
                        <th className="px-4 py-3 text-center">Quantity</th>
                        <th className="px-4 py-3 text-right">Price</th>
                        <th className="px-4 py-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700 print:divide-gray-300">
                      {order.items.map((item) => (
                        <tr key={item.productId} className="text-sm">
                          <td className="px-4 py-3">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white print:text-gray-900">
                                {item.name}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 print:text-gray-500">
                                ID: {item.productId.slice(0, 8)}...
                              </p>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center text-gray-900 dark:text-white print:text-gray-900">
                            {item.quantity}
                          </td>
                          <td className="px-4 py-3 text-right text-gray-900 dark:text-white print:text-gray-900">
                            ₵{item.price.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white print:text-gray-900">
                            ₵{(item.price * item.quantity).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50 dark:bg-gray-800 print:bg-gray-100 border-t border-gray-200 dark:border-gray-700 print:border-gray-300">
                      <tr>
                        <td
                          colSpan={3}
                          className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-300 print:text-gray-700"
                        >
                          Total
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-lg text-gray-900 dark:text-white print:text-gray-900">
                          ₵{order.totalAmount.toFixed(2)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 print:border-gray-300 text-center text-sm text-gray-500 dark:text-gray-400 print:text-gray-500">
                <p>Thank you for choosing Hayate Cosmetics!</p>
                <p className="text-xs mt-1">
                  This is a system-generated receipt. For any inquiries, please
                  contact support on 0533842202/ 0549188561.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full p-6 shadow-2xl">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <FiAlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Delete Order
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Are you sure you want to delete order{" "}
                  <strong>#{order.orderCode}</strong>? This action cannot be
                  undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Delete Order
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #receipt,
          #receipt * {
            visibility: visible;
          }
          #receipt {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .print-container {
            margin: 0;
            padding: 0;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:rounded-none {
            border-radius: 0 !important;
          }
          .print\\:bg-white {
            background-color: white !important;
          }
          .print\\:text-gray-900 {
            color: #1a1a1a !important;
          }
          .print\\:text-gray-800 {
            color: #2d2d2d !important;
          }
          .print\\:text-gray-700 {
            color: #4a4a4a !important;
          }
          .print\\:text-gray-600 {
            color: #6b6b6b !important;
          }
          .print\\:text-gray-500 {
            color: #8a8a8a !important;
          }
          .print\\:border-gray-300 {
            border-color: #d1d1d1 !important;
          }
          .print\\:border-gray-200 {
            border-color: #e5e5e5 !important;
          }
          .print\\:bg-gray-100 {
            background-color: #f5f5f5 !important;
          }
          .print\\:p-4 {
            padding: 1rem !important;
          }
          .print\\:mb-4 {
            margin-bottom: 1rem !important;
          }
          .print\\:mt-4 {
            margin-top: 1rem !important;
          }
          .print\\:space-y-2 > * + * {
            margin-top: 0.5rem !important;
          }
        }
      `}</style>
    </AdminLayout>
  );
}
