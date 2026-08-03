"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  query,
  where,
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
  FiRefreshCw,
  FiDownload,
} from "react-icons/fi";
import ReviewModal from "@/components/ReviewModal";

interface OrderItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  orderCode?: string;
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
    locality?: string;
    region?: string;
  };
  paymentStatus?: string;
  paymentMethod?: string;
}

type FirestoreTimestamp = Timestamp | Date | string | null | undefined;

const STATUS_STYLES: Record<
  string,
  { text: string; bg: string; border: string }
> = {
  pending_payment: {
    text: "text-amber-700 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-900/20",
    border: "border-amber-200 dark:border-amber-800",
  },
  processing: {
    text: "text-[#c9614d] dark:text-[#E39A89]",
    bg: "bg-[#E39A89]/10 dark:bg-[#E39A89]/15",
    border: "border-[#E39A89]/30 dark:border-[#E39A89]/30",
  },
  shipped: {
    text: "text-[#4d6b56] dark:text-[#a9c2ae]",
    bg: "bg-[#8FA593]/15 dark:bg-[#8FA593]/15",
    border: "border-[#8FA593]/30 dark:border-[#8FA593]/30",
  },
  delivered: {
    text: "text-[#1b3c35] dark:text-white",
    bg: "bg-[#1b3c35]/10 dark:bg-white/10",
    border: "border-[#1b3c35]/25 dark:border-white/25",
  },
  default: {
    text: "text-[#26261F]/70 dark:text-white/60",
    bg: "bg-[#1b3c35]/[0.05] dark:bg-white/5",
    border: "border-[#1b3c35]/15 dark:border-white/15",
  },
};

function getStatusStyle(status: string) {
  return STATUS_STYLES[status] || STATUS_STYLES.default;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [refreshing, setRefreshing] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<{
    productId: string;
    productName: string;
    orderId: string;
  } | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

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
    if (
      order.paymentStatus === "pending" ||
      order.status === "pending_payment"
    ) {
      return "pending_payment";
    }

    if (order.paymentStatus === "paid" && order.status === "processing") {
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

  // Download receipt function
  // Download receipt function - FIXED VERSION
  const downloadReceipt = (order: Order) => {
    // Handle Firestore Timestamp properly
    let date: Date;

    if (order.createdAt instanceof Timestamp) {
      date = order.createdAt.toDate();
    } else if (order.createdAt instanceof Date) {
      date = order.createdAt;
    } else {
      date = new Date();
    }

    const formattedDate = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const formattedTime = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    const formattedDate2 = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const formattedTime2 = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const receiptHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Receipt #${order.orderCode || order.id.slice(-8).toUpperCase()}</title>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 40px 20px;
          background: white;
          color: #1b3c35;
        }
        .receipt {
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 40px;
          background: white;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          border-bottom: 2px solid #1b3c35;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .header h1 {
          font-size: 24px;
          margin: 0;
          color: #1b3c35;
        }
        .header .subtitle {
          color: #6b7280;
          font-size: 14px;
        }
        .header .order-info {
          text-align: right;
        }
        .header .order-info .order-number {
          font-size: 16px;
          font-weight: bold;
          color: #1b3c35;
        }
        .header .order-info .order-date {
          font-size: 14px;
          color: #6b7280;
          margin-top: 4px;
          
        }
        .status-badge {
          display: inline-block;
          padding: 4px 16px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 600;
          background: #10b981;
          color: white;
          margin-bottom: 24px;
        }
        .section {
          margin-bottom: 30px;
        }
        .section-title {
          font-size: 14px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #6b7280;
          margin-bottom: 12px;
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 8px;
        }
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 30px;
          margin-bottom: 30px;
        }
        .info-item {
          font-size: 14px;
        }
        .info-item .label {
          color: #6b7280;
          font-size: 12px;
          margin-bottom: 4px;
        }
        .info-item .value {
          font-weight: 500;
          color: #1b3c35;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        thead {
          background: #f9fafb;
        }
        th {
          text-align: left;
          padding: 12px 16px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #6b7280;
        }
        td {
          padding: 12px 16px;
          border-bottom: 1px solid #f3f4f6;
          font-size: 14px;
        }
        .total-row {
          background: #f9fafb;
          font-weight: bold;
        }
        .total-row td {
          padding: 16px;
        }
        .amount {
          text-align: right;
        }
        .grand-total {
          font-size: 18px;
          color: #1b3c35;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          text-align: center;
          color: #6b7280;
          font-size: 12px;
        }
        @media print {
          body { padding: 0; }
          .receipt { border: none; padding: 20px; }
        }
        @media (max-width: 640px) {
          .header { flex-direction: column; }
          .header .order-info { text-align: left; margin-top: 10px; }
          .info-grid { grid-template-columns: 1fr; gap: 15px; }
        }
      </style>
    </head>
    <body>
      <div class="receipt">
        <div class="header">
          <div>
            <h1>Hayate Cosmetics</h1>
            <div class="subtitle">Order Receipt</div>
          </div>
          <div class="order-info">
            <div class="order-number">#${order.orderCode || order.id.slice(-8).toUpperCase()}</div>
            <div class="order-date">Order date: ${formattedDate2} at ${formattedTime2}</div>
          </div>
        </div>

        <div class="status-badge">${getStatusText(getDisplayStatus(order))}</div>

        <div class="info-grid">
          <div class="info-item">
            <div class="label">Customer</div>
            <div class="value">${order.shippingAddress.firstName} ${order.shippingAddress.lastName}</div>
            <div style="font-size:12px;color:#6b7280;margin-top:4px;">${order.shippingAddress.email || "N/A"}</div>
          </div>
          <div class="info-item">
            <div class="label">Shipping Address</div>
            <div class="value">${order.shippingAddress.address || ""}</div>
            <div style="font-size:12px;color:#6b7280;">${order.shippingAddress.city}, ${order.shippingAddress.region}</div>
            <div style="font-size:12px;color:#6b7280;">${order.shippingAddress.locality || ""}</div>
          </div>
          <div class="info-item">
            <div class="label">Payment</div>
            <div class="value">${order.paymentMethod || "MOMO"}</div>
            <div style="font-size:12px;color:#6b7280;margin-top:4px;">Status: ${order.paymentStatus === "paid" ? "Paid" : "Pending"}</div>
            
          </div>
        </div>

        <div class="section">
          <div class="section-title">Order Items</div>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th style="text-align:center;">Quantity</th>
                <th style="text-align:right;">Price</th>
                <th style="text-align:right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.items
                .map(
                  (item) => `
                <tr>
                  <td>${item.name}</td>
                  <td style="text-align:center;">${item.quantity}</td>
                  <td style="text-align:right;">₵${item.price.toFixed(2)}</td>
                  <td style="text-align:right;">₵${(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              `,
                )
                .join("")}
              <tr class="total-row">
                <td colspan="3" style="text-align:right;font-size:16px;">Total</td>
                <td style="text-align:right;font-size:18px;color:#1b3c35;font-weight:bold;">₵${order.totalAmount.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="footer">
          <p>Thank you for choosing Hayate Cosmetics!</p>
          <p style="margin-top:4px;">This is a system-generated receipt. For any inquiries, please contact support.</p>
        </div>
      </div>
      <script>
        window.onload = function() { window.print(); }
      </script>
    </body>
    </html>
  `;

    // Create a Blob with the HTML content
    const blob = new Blob([receiptHTML], { type: "text/html" });
    const url = URL.createObjectURL(blob);

    // Open in new window for printing/saving
    const newWindow = window.open("", "_blank");
    if (newWindow) {
      newWindow.document.write(receiptHTML);
      newWindow.document.close();
    } else {
      // Fallback: download as HTML file
      const link = document.createElement("a");
      link.href = url;
      link.download = `receipt-${order.orderCode || order.id.slice(-8)}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const handleOpenReview = (
    productId: string,
    productName: string,
    orderId: string,
  ) => {
    setSelectedProduct({ productId, productName, orderId });
    setShowReviewModal(true);
  };

  const handleReviewSubmitted = () => {
    console.log("Review submitted successfully");
  };

  const filteredOrders =
    selectedStatus === "all"
      ? orders
      : orders.filter((order) => getDisplayStatus(order) === selectedStatus);

  const statusCounts = {
    all: orders.length,
    pending_payment: orders.filter(
      (order) => getDisplayStatus(order) === "pending_payment",
    ).length,
    processing: orders.filter(
      (order) => getDisplayStatus(order) === "processing",
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

      const ordersRef = collection(db, "orders");

      const q = query(
        ordersRef,
        where("userId", "==", currentUserId),
        orderBy("createdAt", "desc"),
      );

      const snapshot = await getDocs(q);

      const ordersList: Order[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();

        return {
          id: docSnap.id,
          orderCode: data.orderCode,
          items: Array.isArray(data.items) ? data.items : [],
          totalAmount: Number(data.totalAmount || 0),
          status: data.status || "pending",
          createdAt: data.createdAt,
          shippingAddress: data.shippingAddress || {
            firstName: data.customerName?.split(" ")[0] || "N/A",
            lastName: data.customerName?.split(" ").slice(1).join(" ") || "",
            city: "N/A",
          },
          paymentStatus: data.paymentStatus || "pending",
          paymentMethod: data.paymentMethod || "paystack",
        };
      });

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

        const ordersRef = collection(db, "orders");

        const q = query(
          ordersRef,
          where("userId", "==", currentUserId),
          orderBy("createdAt", "desc"),
        );

        const snapshot = await getDocs(q);

        const ordersList: Order[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();

          return {
            id: docSnap.id,
            orderCode: data.orderCode,
            items: Array.isArray(data.items) ? data.items : [],
            totalAmount: Number(data.totalAmount || 0),
            status: data.status || "pending",
            createdAt: data.createdAt,
            shippingAddress: data.shippingAddress || {
              firstName: data.customerName?.split(" ")[0] || "N/A",
              lastName: data.customerName?.split(" ").slice(1).join(" ") || "",
              city: "N/A",
            },
            paymentStatus: data.paymentStatus || "pending",
            paymentMethod: data.paymentMethod || "paystack",
          };
        });

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
      <div className="min-h-screen bg-[#FBF6EF] dark:bg-[#0f1e1a]">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-[#1b3c35]/[0.08] dark:bg-white/10 rounded-lg w-48 mb-8"></div>
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-64 bg-[#1b3c35]/[0.05] dark:bg-white/5 rounded-2xl"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF6EF] dark:bg-[#0f1e1a]">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-[#1b3c35] to-[#254f45] py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div>
              <button
                onClick={() => window.history.back()}
                className="flex items-center gap-2 text-white/60 hover:text-white mb-4 sm:mb-3 cursor-pointer text-sm font-medium transition-colors"
              >
                <FiArrowLeft className="w-4 h-4" />
                Back
              </button>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">
                My Orders
              </h1>
              <p className="text-white/60 mt-2">
                Track and manage all your purchases
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={refreshOrders}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/15 border border-white/15 text-white rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
              >
                <FiRefreshCw
                  className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
                />
                <span className="font-medium text-sm">Refresh</span>
              </button>
              <button
                onClick={() => (window.location.href = "/")}
                className="px-4 py-2.5 bg-[#E39A89] hover:bg-[#d9866f] text-white rounded-lg transition-colors font-medium text-sm cursor-pointer"
              >
                Shop More
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
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
                className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-all cursor-pointer ${
                  selectedStatus === status.id
                    ? "bg-[#1b3c35] text-white shadow-md"
                    : "bg-white dark:bg-[#16302a] text-[#1b3c35] dark:text-white/80 hover:bg-[#1b3c35]/[0.05] dark:hover:bg-white/10 ring-1 ring-black/5 dark:ring-white/10"
                }`}
              >
                <span className="flex items-center gap-2">
                  {status.label}
                  <span
                    className={`px-1.5 py-0.5 text-xs rounded-full ${
                      selectedStatus === status.id
                        ? "bg-white/20"
                        : "bg-[#1b3c35]/[0.08] dark:bg-white/10"
                    }`}
                  >
                    {status.count}
                  </span>
                </span>
              </button>
            ))}
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
            <div className="bg-white dark:bg-[#16302a] rounded-xl p-4 ring-1 ring-black/5 dark:ring-white/5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-[#26261F]/55 dark:text-white/55">
                    Total Orders
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-[#1b3c35] dark:text-white">
                    {orders.length}
                  </p>
                </div>
                <div className="p-2 bg-[#1b3c35]/[0.06] dark:bg-white/10 rounded-lg">
                  <FiShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-[#1b3c35] dark:text-white/80" />
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-[#16302a] rounded-xl p-4 ring-1 ring-black/5 dark:ring-white/5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-[#26261F]/55 dark:text-white/55">
                    Total Spent
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-[#1b3c35] dark:text-white">
                    ₵
                    {orders
                      .reduce((sum, order) => sum + (order.totalAmount || 0), 0)
                      .toFixed(2)}
                  </p>
                </div>
                <div className="p-2 bg-[#E39A89]/10 rounded-lg">
                  <FiDollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-[#c9614d] dark:text-[#E39A89]" />
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-[#16302a] rounded-xl p-4 ring-1 ring-black/5 dark:ring-white/5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-[#26261F]/55 dark:text-white/55">
                    In Progress
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-[#1b3c35] dark:text-white">
                    {statusCounts.processing + statusCounts.shipped}
                  </p>
                </div>
                <div className="p-2 bg-[#8FA593]/15 rounded-lg">
                  <FiClock className="w-5 h-5 sm:w-6 sm:h-6 text-[#4d6b56] dark:text-[#a9c2ae]" />
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-[#16302a] rounded-xl p-4 ring-1 ring-black/5 dark:ring-white/5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-[#26261F]/55 dark:text-white/55">
                    Completed
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-[#1b3c35] dark:text-white">
                    {statusCounts.delivered}
                  </p>
                </div>
                <div className="p-2 bg-[#1b3c35]/10 dark:bg-white/10 rounded-lg">
                  <FiCheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-[#1b3c35] dark:text-white/80" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-[#16302a] rounded-2xl ring-1 ring-black/5 dark:ring-white/5">
            <div className="max-w-md mx-auto px-4">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#1b3c35]/[0.05] dark:bg-white/10 flex items-center justify-center">
                <FiPackage className="w-9 h-9 text-[#1b3c35]/35 dark:text-white/40" />
              </div>
              <h3 className="text-xl font-bold text-[#1b3c35] dark:text-white mb-3">
                {selectedStatus === "all"
                  ? "No orders yet"
                  : `No ${selectedStatus.replace("_", " ")} orders`}
              </h3>
              <p className="text-[#26261F]/60 dark:text-white/60 mb-8 max-w-sm mx-auto">
                {selectedStatus === "all"
                  ? "Start shopping to see your orders here"
                  : `You don't have any ${selectedStatus.replace(
                      "_",
                      " ",
                    )} orders at the moment`}
              </p>
              <button
                onClick={() => (window.location.href = "/")}
                className="px-6 py-3 bg-[#1b3c35] hover:bg-[#254f45] text-white rounded-lg transition-colors font-medium cursor-pointer"
              >
                Start Shopping
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-5 sm:space-y-6">
            {filteredOrders.map((order) => {
              const displayStatus = getDisplayStatus(order);
              const statusStyle = getStatusStyle(displayStatus);
              const itemCount =
                order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

              return (
                <div
                  key={order.id}
                  className="group bg-white dark:bg-[#16302a] rounded-2xl ring-1 ring-black/5 dark:ring-white/5 hover:shadow-xl transition-shadow duration-300 overflow-hidden"
                >
                  {/* Order Header */}
                  <div className="p-4 sm:p-6 border-b border-[#1b3c35]/10 dark:border-white/10">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div
                          className={`p-3 rounded-xl shrink-0 ${statusStyle.bg} border ${statusStyle.border} ${statusStyle.text}`}
                        >
                          {getStatusIcon(displayStatus)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-3 flex-wrap">
                            <h3 className="text-base sm:text-lg font-bold text-[#1b3c35] dark:text-white">
                              Order: #
                              {order.orderCode ||
                                order.id.slice(-8).toUpperCase()}
                            </h3>
                            <span
                              className={`px-3 py-1 text-xs font-semibold rounded-full border ${statusStyle.bg} ${statusStyle.border} ${statusStyle.text}`}
                            >
                              {getStatusText(displayStatus)}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-2 text-sm text-[#26261F]/55 dark:text-white/55 flex-wrap">
                            <span className="flex items-center gap-1">
                              <FiCalendar className="w-4 h-4" />
                              {formatFirestoreDate(order.createdAt)}
                            </span>
                            <span className="flex items-center gap-1">
                              <FiShoppingBag className="w-4 h-4" />
                              {itemCount} item{itemCount !== 1 ? "s" : ""}
                            </span>
                            {order.paymentMethod && (
                              <span className="px-2 py-0.5 bg-[#1b3c35]/[0.06] dark:bg-white/10 rounded text-xs">
                                MOMO
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="lg:text-right">
                        <p className="text-2xl lg:text-3xl font-bold text-[#1b3c35] dark:text-white">
                          ₵{(order.totalAmount || 0).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Order Content */}
                  <div className="p-4 sm:p-6">
                    <div className="grid lg:grid-cols-2 gap-6">
                      {/* Order Items */}
                      <div>
                        <h4 className="font-semibold text-[#1b3c35] dark:text-white mb-4 flex items-center gap-2">
                          <FiShoppingBag className="w-4 h-4" />
                          Order Items
                        </h4>
                        <div className="space-y-3">
                          {order.items?.slice(0, 3).map((item, index) => (
                            <div
                              key={item.productId || index}
                              className="flex items-center justify-between p-3 bg-[#1b3c35]/[0.03] dark:bg-white/5 rounded-lg"
                            >
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-[#1b3c35] dark:text-white truncate">
                                  {item.name}
                                </p>
                                <p className="text-sm text-[#26261F]/55 dark:text-white/55">
                                  Qty: {item.quantity} × ₵
                                  {item.price.toFixed(2)}
                                </p>
                              </div>
                              <p className="font-semibold text-[#1b3c35] dark:text-white whitespace-nowrap ml-4">
                                ₵{(item.price * item.quantity).toFixed(2)}
                              </p>
                            </div>
                          ))}
                          {order.items && order.items.length > 3 && (
                            <div className="text-center pt-2">
                              <button className="text-sm text-[#c9614d] dark:text-[#E39A89] hover:opacity-80 font-medium flex items-center justify-center gap-1 mx-auto cursor-pointer">
                                View {order.items.length - 3} more items
                                <FiChevronRight className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Shipping Information */}
                      <div>
                        <h4 className="font-semibold text-[#1b3c35] dark:text-white mb-4 flex items-center gap-2">
                          <FiMapPin className="w-4 h-4" />
                          Shipping Information
                        </h4>
                        <div className="p-4 bg-[#1b3c35]/[0.03] dark:bg-white/5 rounded-xl">
                          <div className="space-y-2">
                            <div>
                              <p className="text-sm text-[#26261F]/55 dark:text-white/55">
                                Recipient
                              </p>
                              <p className="font-medium text-[#1b3c35] dark:text-white">
                                {order.shippingAddress.firstName}{" "}
                                {order.shippingAddress.lastName}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-[#26261F]/55 dark:text-white/55">
                                Region
                              </p>
                              <p className="font-medium text-[#1b3c35] dark:text-white mb-2">
                                {order.shippingAddress.region} Region
                              </p>
                              <p className="text-sm text-[#26261F]/55 dark:text-white/55">
                                City
                              </p>

                              <p className="font-medium text-[#1b3c35] dark:text-white">
                                {order.shippingAddress.city}
                              </p>
                              <p className="text-[#26261F]/75 dark:text-white/75 text-sm">
                                {order.shippingAddress.locality}
                                {order.shippingAddress.address
                                  ? `, ${order.shippingAddress.address}`
                                  : ""}
                              </p>
                            </div>
                            {order.shippingAddress.phone && (
                              <div>
                                <p className="text-sm text-[#26261F]/55 dark:text-white/55">
                                  Contact
                                </p>
                                <p className="font-medium text-[#1b3c35] dark:text-white">
                                  {order.shippingAddress.phone}
                                </p>
                              </div>
                            )}
                            <div>
                              <p className="text-sm text-[#26261F]/55 dark:text-white/55">
                                Payment Status
                              </p>
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                                  order.paymentStatus === "paid"
                                    ? "bg-[#8FA593]/15 text-[#4d6b56] dark:text-[#a9c2ae]"
                                    : "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
                                }`}
                              >
                                {order.paymentStatus === "paid"
                                  ? "Paid"
                                  : order.paymentStatus === "pending"
                                    ? "Pending"
                                    : order.paymentStatus}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3 pt-6 border-t border-[#1b3c35]/10 dark:border-white/10 mt-6">
                      {/* Download Receipt Button - Added */}
                      <button
                        onClick={() => downloadReceipt(order)}
                        className="px-4 py-2.5 bg-[#1b3c35]/10 text-[#1b3c35] dark:text-white dark:bg-white/10 border border-[#1b3c35]/20 dark:border-white/20 rounded-lg hover:bg-[#1b3c35]/20 dark:hover:bg-white/20 transition-colors font-medium text-sm flex items-center gap-2 cursor-pointer"
                      >
                        <FiDownload className="w-4 h-4" />
                        Download Receipt
                      </button>

                      {displayStatus === "delivered" && (
                        <button
                          onClick={() => {
                            if (order.items && order.items.length > 0) {
                              handleOpenReview(
                                order.items[0].productId,
                                order.items[0].name,
                                order.id,
                              );
                            }
                          }}
                          className="px-4 py-2.5 bg-[#8FA593]/15 text-[#4d6b56] dark:text-[#a9c2ae] border border-[#8FA593]/30 rounded-lg hover:bg-[#8FA593]/25 transition-colors font-medium text-sm cursor-pointer"
                        >
                          Leave Review
                        </button>
                      )}
                      {displayStatus === "pending_payment" && (
                        <button className="px-4 py-2.5 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors font-medium text-sm cursor-pointer">
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

        {/* Review Modal */}
        {selectedProduct && (
          <ReviewModal
            isOpen={showReviewModal}
            onClose={() => {
              setShowReviewModal(false);
              setSelectedProduct(null);
            }}
            productId={selectedProduct.productId}
            productName={selectedProduct.productName}
            orderId={selectedProduct.orderId}
            onReviewSubmitted={handleReviewSubmitted}
          />
        )}

        {/* Order Status Guide */}
        <div className="mt-10 sm:mt-12 pt-8 border-t border-[#1b3c35]/10 dark:border-white/10">
          <h3 className="text-lg font-bold text-[#1b3c35] dark:text-white mb-6">
            Order Status Guide
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
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
            ].map((guide) => {
              const style = getStatusStyle(guide.status);
              return (
                <div
                  key={guide.status}
                  className="bg-white dark:bg-[#16302a] rounded-xl p-4 ring-1 ring-black/5 dark:ring-white/5"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-lg ${style.bg} ${style.text}`}>
                      {getStatusIcon(guide.status)}
                    </div>
                    <span className="font-semibold text-[#1b3c35] dark:text-white">
                      {guide.title}
                    </span>
                  </div>
                  <p className="text-sm text-[#26261F]/60 dark:text-white/60">
                    {guide.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Need Help Section */}
        <div className="mt-8 p-6 bg-[#E39A89]/10 rounded-2xl border border-[#E39A89]/25">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-[#1b3c35] dark:text-white mb-2">
                Need help with your order?
              </h3>
              <p className="text-[#26261F]/65 dark:text-white/65 text-sm">
                Contact our support team for assistance with your orders
              </p>
            </div>
            <Link
              href="/contact"
              className="px-6 py-3 bg-[#1b3c35] hover:bg-[#254f45] text-white rounded-lg transition-colors font-medium whitespace-nowrap cursor-pointer shrink-0"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
