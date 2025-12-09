import AdminLayout from "@/components/admin/AdminLayout";
import ProtectedAdmin from "@/components/admin/ProtectedAdmin";

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

export default function AdminDashboardPage() {
  const metrics = {
    totalProducts: 156,
    totalOrders: 324,
    totalRevenue: 24580.5,
    totalCustomers: 89,
    inventoryItems: 456,
    pendingOrders: 12,
    conversionRate: 3.2,
    averageOrderValue: 75.86,
  };

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

  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1b3c35] mb-2">
          Dashboard Overview
        </h1>
        <p className="text-gray-500">
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
              12.5%
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            Total Revenue
          </p>
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            ₵{metrics.totalRevenue.toLocaleString()}
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
              8.3%
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            Total Orders
          </p>
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            {metrics.totalOrders}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {metrics.pendingOrders} pending
          </p>
        </div>

        {/* Products Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-900/20">
              <FiPackage className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="text-sm font-medium text-green-600 dark:text-green-400 flex items-center">
              <FiArrowUp className="w-3 h-3 mr-1" />
              5.2%
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            Total Products
          </p>
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            {metrics.totalProducts}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {metrics.inventoryItems} in inventory
          </p>
        </div>

        {/* Customers Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-green-50 dark:bg-green-900/20">
              <FiUsers className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <span className="text-sm font-medium text-red-600 dark:text-red-400 flex items-center">
              <FiArrowDown className="w-3 h-3 mr-1" />
              2.1%
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            Total Customers
          </p>
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            {metrics.totalCustomers}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            New this month: 12
          </p>
        </div>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Conversion Rate */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/20">
              <FiTrendingUp className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <span className="text-sm font-medium text-green-600 dark:text-green-400">
              +0.8%
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            Conversion Rate
          </p>
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            {metrics.conversionRate}%
          </h3>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
            <div
              className="bg-gradient-to-r from-[#e39a89] to-[#d87a6a] h-2 rounded-full"
              style={{ width: `${metrics.conversionRate * 10}%` }}
            />
          </div>
        </div>

        {/* Average Order Value */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20">
              <FiActivity className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <span className="text-sm font-medium text-green-600 dark:text-green-400">
              +₵5.20
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            Avg. Order Value
          </p>
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            ₵{metrics.averageOrderValue}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Increased from last month
          </p>
        </div>

        {/* Inventory Status */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20">
              <MdOutlineInventory className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <span className="text-sm font-medium text-red-600 dark:text-red-400">
              5 items low
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            Inventory Status
          </p>
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            {metrics.inventoryItems}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            5 items need restocking
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
            <button className="text-sm text-[#e39a89] hover:text-[#d87a6a] dark:text-[#1b3c35] dark:hover:text-[#2a4d45] font-medium">
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
            <button className="text-sm text-[#e39a89] hover:text-[#d87a6a] dark:text-[#1b3c35] dark:hover:text-[#2a4d45] font-medium">
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
          <p className="text-sm text-black">Today&apos;s Orders</p>
          <p className="text-lg font-bold text-gray-800 dark:text-white">24</p>
        </div>
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-4 text-center">
          <MdOutlineLocalShipping className="w-5 h-5 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
          <p className="text-sm text-black">To Ship</p>
          <p className="text-lg font-bold text-gray-800 dark:text-white">8</p>
        </div>
        <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-4 text-center">
          <FiTrendingUp className="w-5 h-5 text-green-600 dark:text-green-400 mx-auto mb-2" />
          <p className="text-sm text-black">Growth</p>
          <p className="text-lg font-bold text-gray-800 dark:text-white">
            +12.5%
          </p>
        </div>
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-4 text-center">
          <FiUsers className="w-5 h-5 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
          <p className="text-sm text-black">New Customers</p>
          <p className="text-lg font-bold text-gray-800 dark:text-white">5</p>
        </div>
      </div>
    </AdminLayout>
  );
}
