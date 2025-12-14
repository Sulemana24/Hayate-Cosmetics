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
  FiStar,
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
  where,
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

interface Order {
  id: string;
  amount: number;
  status: string;
  createdAt: Timestamp;
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
    totalCustomers: 89, // You might want to fetch this from Firebase too
    inventoryItems: 0,
    pendingOrders: 0,
    conversionRate: 3.2,
    averageOrderValue: 0,
  });

  const recentOrders = [
    {
      id: "#ORD-001",
      customer: "John Doe",
      amount: "₵245.99",
      status: "delivered",
      date: "2 min ago",
    },
    {
      id: "#ORD-002",
      customer: "Jane Smith",
      amount: "₵129.50",
      status: "processing",
      date: "15 min ago",
    },
    {
      id: "#ORD-003",
      customer: "Robert Johnson",
      amount: "₵89.99",
      status: "pending",
      date: "1 hour ago",
    },
    {
      id: "#ORD-004",
      customer: "Sarah Williams",
      amount: "₵345.75",
      status: "delivered",
      date: "2 hours ago",
    },
    {
      id: "#ORD-005",
      customer: "Michael Brown",
      amount: "₵67.25",
      status: "shipped",
      date: "3 hours ago",
    },
  ];

  const topProducts = [
    { name: "Wireless Headphones", sales: 45, revenue: "₵4,500", stock: 12 },
    { name: "Smart Watch", sales: 38, revenue: "₵7,600", stock: 8 },
    { name: "Laptop Stand", sales: 32, revenue: "₵1,920", stock: 24 },
    { name: "Coffee Maker", sales: 28, revenue: "₵3,920", stock: 5 },
    { name: "Yoga Mat", sales: 25, revenue: "₵1,250", stock: 16 },
  ];

  // Fetch dashboard statistics
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);

        // Fetch products
        const productsQuery = query(
          collection(db, "products"),
          orderBy("createdAt", "desc")
        );
        const productsSnapshot = await getDocs(productsQuery);
        const products = productsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Product[];

        // Calculate product statistics
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

        // Calculate total inventory items
        const inventoryItems = products.reduce(
          (sum, product) => sum + product.quantity,
          0
        );

        // Fetch orders (you need to create an orders collection in Firebase)
        // For now, using mock data for orders
        // const ordersQuery = query(collection(db, "orders"), orderBy("createdAt", "desc"));
        // const ordersSnapshot = await getDocs(ordersQuery);
        // const orders = ordersSnapshot.docs.map(doc => ({
        //   id: doc.id,
        //   ...doc.data()
        // })) as Order[];

        // Mock order data for now - replace with actual Firebase query
        const mockOrders = [
          {
            id: "1",
            amount: 245.99,
            status: "delivered",
            createdAt: Timestamp.now(),
          },
          {
            id: "2",
            amount: 129.5,
            status: "processing",
            createdAt: Timestamp.now(),
          },
          {
            id: "3",
            amount: 89.99,
            status: "pending",
            createdAt: Timestamp.now(),
          },
          {
            id: "4",
            amount: 345.75,
            status: "delivered",
            createdAt: Timestamp.now(),
          },
          {
            id: "5",
            amount: 67.25,
            status: "shipped",
            createdAt: Timestamp.now(),
          },
        ];

        const totalOrders = mockOrders.length;
        const totalRevenue = mockOrders.reduce(
          (sum, order) => sum + order.amount,
          0
        );
        const pendingOrders = mockOrders.filter(
          (o) => o.status === "pending" || o.status === "processing"
        ).length;
        const averageOrderValue =
          totalOrders > 0 ? totalRevenue / totalOrders : 0;

        setStats({
          totalProducts,
          inStockProducts,
          lowStockProducts,
          outOfStockProducts,
          totalOrders,
          totalRevenue,
          totalCustomers: 89,

          inventoryItems,
          pendingOrders,
          conversionRate: 3.2,
          averageOrderValue,
        });
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  // Calculate percentage changes (you can make these dynamic too)
  const calculatePercentageChange = (current: number, previous: number) => {
    if (previous === 0) return 100;
    return ((current - previous) / previous) * 100;
  };

  // Mock previous month data - you can fetch this from Firebase too
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

        {/* Top Products */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              Top Products
            </h3>
            <button className="text-sm text-[#e39a89] hover:text-[#d87a6a] dark:text-white font-medium">
              View All
            </button>
          </div>
          <div className="space-y-4">
            {topProducts.map((product, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-[#e39a89]/20 to-[#d87a6a]/20 rounded-lg flex items-center justify-center">
                    <FiStar className="w-5 h-5 text-[#e39a89]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-800 dark:text-white">
                      {product.name}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Stock: {product.stock}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-800 dark:text-white">
                    {product.revenue}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {product.sales} sales
                  </p>
                </div>
              </div>
            ))}
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
