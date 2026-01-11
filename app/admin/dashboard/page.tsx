"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  FiShoppingBag,
  FiDollarSign,
  FiUsers,
  FiTrendingUp,
  FiPackage,
  FiShoppingCart,
  FiActivity,
  FiArrowUp,
  FiArrowDown,
} from "react-icons/fi";
import { MdOutlineInventory, MdOutlineLocalShipping } from "react-icons/md";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  query,
  orderBy,
  Timestamp,
  limit,
} from "firebase/firestore";

interface Product {
  id: string;
  name: string;
  originalPrice: number;
  discountedPrice: number;
  category: string;
  quantity: number;
  status: "In Stock" | "Low Stock" | "Out of Stock";
  createdAt: Timestamp;
}

interface FirestoreOrder {
  orderCode: string;
  customerName: string;
  totalAmount: number;
  status: string;
  createdAt: Timestamp;
}

interface RecentOrder {
  id: string;
  customer: string;
  amount: string;
  totalAmount: number;
  status: string;
  date: string;
}

interface DashboardStats {
  totalProducts: number;
  inStockProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  inventoryItems: number;
  pendingOrders: number;
  conversionRate: number;
  averageOrderValue: number;
}

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    inStockProducts: 0,
    lowStockProducts: 0,
    outOfStockProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 89,
    inventoryItems: 0,
    pendingOrders: 0,
    conversionRate: 3.2,
    averageOrderValue: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);

  const fetchRecentOrders = async (): Promise<RecentOrder[]> => {
    const ordersRef = collection(db, "orders");
    const q = query(ordersRef, orderBy("createdAt", "desc"), limit(5));
    const snapshot = await getDocs(q);

    const recentOrders: RecentOrder[] = snapshot.docs.map((doc) => {
      const data = doc.data() as FirestoreOrder;
      return {
        id: data.orderCode,
        customer: data.customerName,
        totalAmount: data.totalAmount,
        amount: `₵${data.totalAmount.toFixed(2)}`,
        status: data.status.toLowerCase(),
        date: data.createdAt.toDate().toLocaleString(),
      };
    });

    return recentOrders;
  };

  useEffect(() => {
    const fetchDashboardStats = async () => {
      setLoading(true);
      try {
        const productsQuery = query(
          collection(db, "products"),
          orderBy("createdAt", "desc")
        );
        const productsSnapshot = await getDocs(productsQuery);
        const products = productsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Product[];

        const totalProducts = products.length;
        const inStockProducts = products.filter(
          (p) => p.status === "In Stock"
        ).length;
        const lowStockProducts = products.filter(
          (p) => p.status === "Low Stock"
        ).length;
        const outOfStockProducts = products.filter(
          (p) => p.status === "Out of Stock"
        ).length;
        const inventoryItems = products.reduce((sum, p) => sum + p.quantity, 0);

        const orders = await fetchRecentOrders();
        const totalOrders = orders.length;
        const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
        const pendingOrders = orders.filter(
          (o) => o.status === "pending" || o.status === "processing"
        ).length;
        const averageOrderValue =
          totalOrders > 0 ? totalRevenue / totalOrders : 0;

        setStats((prev) => ({
          ...prev,
          totalProducts,
          inStockProducts,
          lowStockProducts,
          outOfStockProducts,
          inventoryItems,
          totalOrders,
          totalRevenue,
          pendingOrders,
          averageOrderValue,
        }));

        setRecentOrders(orders);
      } catch (err) {
        console.error("Error fetching dashboard stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  const calculatePercentageChange = (current: number, previous: number) => {
    if (previous === 0) return 100;
    return ((current - previous) / previous) * 100;
  };

  const previousMonthStats = {
    totalProducts: 140,
    totalOrders: 300,
    totalRevenue: 22000,
    totalCustomers: 85,
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 border-4 border-[#e39a89] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-600 dark:text-gray-400">
              Loading dashboard...
            </p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1b3c35] dark:text-white mb-2">
          Dashboard Overview
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Welcome back! Here&apos;s what&apos;s happening with your store today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Revenue Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-r from-[#e39a89]/20 to-[#d87a6a]/20">
              <FiDollarSign className="w-6 h-6 text-[#e39a89]" />
            </div>
            <span className="text-sm font-medium text-green-600 dark:text-green-400 flex items-center">
              <FiArrowUp className="w-3 h-3 mr-1" />
              {calculatePercentageChange(
                stats.totalRevenue,
                previousMonthStats.totalRevenue
              ).toFixed(1)}
              %
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            Total Revenue
          </p>
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            ₵
            {stats.totalRevenue.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Last 30 days
          </p>
        </div>

        {/* Orders Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20">
              <FiShoppingCart className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-sm font-medium text-green-600 dark:text-green-400 flex items-center">
              <FiArrowUp className="w-3 h-3 mr-1" />
              {calculatePercentageChange(
                stats.totalOrders,
                previousMonthStats.totalOrders
              ).toFixed(1)}
              %
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            Total Orders
          </p>
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            {stats.totalOrders}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {stats.pendingOrders} pending
          </p>
        </div>

        {/* Products Card - Now with real data */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-900/20">
              <FiPackage className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="text-sm font-medium text-green-600 dark:text-green-400 flex items-center">
              <FiArrowUp className="w-3 h-3 mr-1" />
              {calculatePercentageChange(
                stats.totalProducts,
                previousMonthStats.totalProducts
              ).toFixed(1)}
              %
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            Total Products
          </p>
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            {stats.totalProducts}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {stats.inStockProducts} in stock • {stats.lowStockProducts} low
          </p>
        </div>

        {/* Customers Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-green-50 dark:bg-green-900/20">
              <FiUsers className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <span
              className={`text-sm font-medium flex items-center ${
                calculatePercentageChange(
                  stats.totalCustomers,
                  previousMonthStats.totalCustomers
                ) >= 0
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {calculatePercentageChange(
                stats.totalCustomers,
                previousMonthStats.totalCustomers
              ) >= 0 ? (
                <FiArrowUp className="w-3 h-3 mr-1" />
              ) : (
                <FiArrowDown className="w-3 h-3 mr-1" />
              )}
              {Math.abs(
                calculatePercentageChange(
                  stats.totalCustomers,
                  previousMonthStats.totalCustomers
                )
              ).toFixed(1)}
              %
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            Total Customers
          </p>
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            {stats.totalCustomers}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            New this month: 12
          </p>
        </div>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Product Status Breakdown */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/20">
              <FiTrendingUp className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <span className="text-sm font-medium text-green-600 dark:text-green-400">
              Product Status
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            Inventory Overview
          </p>

          <div className="space-y-3 mt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                In Stock
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {stats.inStockProducts}
                </span>
                <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{
                      width: `${
                        (stats.inStockProducts / stats.totalProducts) * 100
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Low Stock
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {stats.lowStockProducts}
                </span>
                <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-yellow-500 h-2 rounded-full"
                    style={{
                      width: `${
                        (stats.lowStockProducts / stats.totalProducts) * 100
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Out of Stock
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {stats.outOfStockProducts}
                </span>
                <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-red-500 h-2 rounded-full"
                    style={{
                      width: `${
                        (stats.outOfStockProducts / stats.totalProducts) * 100
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Average Order Value */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20">
              <FiActivity className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <span className="text-sm font-medium text-green-600 dark:text-green-400">
              {stats.averageOrderValue > 75.86 ? "+" : ""}₵
              {(stats.averageOrderValue - 75.86).toFixed(2)}
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            Avg. Order Value
          </p>
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            ₵{stats.averageOrderValue.toFixed(2)}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {stats.averageOrderValue > 75.86
              ? "Increased from last month"
              : "Decreased from last month"}
          </p>
        </div>

        {/* Inventory Status */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20">
              <MdOutlineInventory className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <span
              className={`text-sm font-medium ${
                stats.lowStockProducts > 0
                  ? "text-red-600 dark:text-red-400"
                  : "text-green-600 dark:text-green-400"
              }`}
            >
              {stats.lowStockProducts} item
              {stats.lowStockProducts !== 1 ? "s" : ""}{" "}
              {stats.lowStockProducts > 0 ? "low" : "all good"}
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            Inventory Status
          </p>
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            {stats.inventoryItems}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {stats.lowStockProducts} item
            {stats.lowStockProducts !== 1 ? "s" : ""} need
            {stats.lowStockProducts === 1 ? "s" : ""} restocking
          </p>
        </div>
      </div>

      {/* Third Row - Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              Recent Orders
            </h3>
            <button className="text-sm text-[#e39a89] hover:text-[#d87a6a] dark:text-white font-medium">
              View All
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-gray-500 dark:text-gray-400 border-b dark:border-gray-700">
                  <th className="pb-3 font-medium">Order ID</th>
                  <th className="pb-3 font-medium">Customer</th>
                  <th className="pb-3 font-medium">Amount</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b dark:border-gray-700 last:border-0"
                  >
                    <td className="py-3">
                      <span className="text-sm font-medium text-gray-800 dark:text-white">
                        {order.id}
                      </span>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {order.date}
                      </p>
                    </td>
                    <td className="py-3 text-sm text-gray-800 dark:text-white">
                      {order.customer}
                    </td>
                    <td className="py-3 text-sm font-medium text-gray-800 dark:text-white">
                      {order.amount}
                    </td>
                    <td className="py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          order.status === "delivered"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                            : order.status === "shipped"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                            : order.status === "processing"
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {order.status.charAt(0).toUpperCase() +
                          order.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Quick Stats Footer */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-[#e39a89]/10 to-[#d87a6a]/10 dark:from-[#1b3c35]/20 dark:to-[#2a4d45]/20 rounded-xl p-4 text-center">
          <FiShoppingBag className="w-5 h-5 text-[#e39a89] dark:text-[#1b3c35] mx-auto mb-2" />
          <p className="text-sm text-gray-800 dark:text-gray-400">
            Today&apos;s Orders
          </p>
          <p className="text-lg font-bold text-gray-800 dark:text-white">24</p>
        </div>
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-4 text-center">
          <MdOutlineLocalShipping className="w-5 h-5 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
          <p className="text-sm text-gray-800 dark:text-gray-400">To Ship</p>
          <p className="text-lg font-bold text-gray-800 dark:text-white">8</p>
        </div>
        <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-4 text-center">
          <FiTrendingUp className="w-5 h-5 text-green-600 dark:text-green-400 mx-auto mb-2" />
          <p className="text-sm text-gray-800 dark:text-gray-400">
            Product Growth
          </p>
          <p className="text-lg font-bold text-gray-800 dark:text-white">
            +
            {calculatePercentageChange(
              stats.totalProducts,
              previousMonthStats.totalProducts
            ).toFixed(1)}
            %
          </p>
        </div>
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-4 text-center">
          <FiUsers className="w-5 h-5 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
          <p className="text-sm text-gray-800 dark:text-gray-400">
            New Customers
          </p>
          <p className="text-lg font-bold text-gray-800 dark:text-white">5</p>
        </div>
      </div>
    </AdminLayout>
  );
}
