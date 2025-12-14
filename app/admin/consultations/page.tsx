"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  orderBy,
  query,
  updateDoc,
  doc,
  Timestamp,
} from "firebase/firestore";
import {
  FiCalendar,
  FiClock,
  FiUser,
  FiMail,
  FiEdit,
  FiTrash2,
  FiCheckCircle,
  FiSearch,
  FiFilter,
  FiChevronDown,
  FiX,
} from "react-icons/fi";

interface Consultation {
  id: string;
  name: string;
  email: string;
  plan: string;
  price: number;
  date: string;
  time: string;
  consultationType: string;
  status: string;
  createdAt: Timestamp;
}

export default function AdminConsultationsPage() {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);

  useEffect(() => {
    const fetchConsultations = async () => {
      try {
        const q = query(
          collection(db, "consultations"),
          orderBy("createdAt", "desc")
        );

        const snapshot = await getDocs(q);

        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Consultation, "id">),
        }));

        setConsultations(data);
      } catch (error) {
        console.error("Failed to fetch consultations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchConsultations();
  }, []);

  const markCompleted = async (id: string) => {
    if (!confirm("Mark this consultation as completed?")) return;

    try {
      await updateDoc(doc(db, "consultations", id), {
        status: "completed",
      });

      setConsultations((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: "completed" } : c))
      );
    } catch (error) {
      console.error("Failed to mark as completed:", error);
      alert("Failed to update status");
    }
  };

  const cancelConsultation = async (id: string) => {
    if (!confirm("Cancel this consultation?")) return;

    try {
      await updateDoc(doc(db, "consultations", id), {
        status: "cancelled",
      });

      setConsultations((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: "cancelled" } : c))
      );
    } catch (error) {
      console.error("Failed to cancel:", error);
      alert("Failed to cancel consultation");
    }
  };

  // Filter consultations
  const filteredConsultations = consultations.filter((consultation) => {
    const matchesSearch =
      consultation.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      consultation.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      consultation.plan.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      selectedStatus === "All" || consultation.status === selectedStatus;

    const matchesType =
      selectedType === "All" || consultation.consultationType === selectedType;

    return matchesSearch && matchesStatus && matchesType;
  });

  // Calculate stats
  const totalConsultations = consultations.length;
  const pendingCount = consultations.filter(
    (c) => c.status === "pending" || c.status === "scheduled"
  ).length;
  const completedCount = consultations.filter(
    (c) => c.status === "completed"
  ).length;
  const cancelledCount = consultations.filter(
    (c) => c.status === "cancelled"
  ).length;
  const totalRevenue = consultations.reduce((sum, c) => sum + c.price, 0);

  // Status options
  const statusOptions = [
    "All",
    "pending",
    "scheduled",
    "completed",
    "cancelled",
  ];

  // Clear filters
  const clearFilters = () => {
    setSearchQuery("");
    setSelectedStatus("All");
    setSelectedType("All");
  };

  const hasActiveFilters =
    searchQuery || selectedStatus !== "All" || selectedType !== "All";

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-4rem)] bg-gradient-to-br from-[#faf7f5] to-[#f0ece9] dark:from-gray-900 dark:to-gray-800">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 border-4 border-[#e39a89] dark:border-[#1b3c35] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-600 dark:text-gray-400">
              Loading consultations...
            </p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-4 md:p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#1b3c35] dark:text-white mb-2">
                Consultations Management
              </h1>
              <p className="text-gray-500 dark:text-gray-400">
                Manage all booked consultations and appointments
              </p>
            </div>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center justify-center gap-2 text-sm text-[#e39a89] hover:text-[#d87a6a] dark:text-[#1b3c35] dark:hover:text-[#2a4d45] px-4 py-2 border border-[#e39a89] dark:border-[#1b3c35] rounded-xl hover:bg-[#e39a89]/5 dark:hover:bg-[#1b3c35]/10 transition-colors duration-200"
              >
                <FiX className="w-4 h-4" />
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 transition-all hover:shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-green-300 dark:bg-green-400">
                <FiCalendar className="w-6 h-6 text-[#e39a89] dark:text-[#1b3c35]" />
              </div>
              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                +{consultations.length > 0 ? "18.5" : "0"}%
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Total Consultations
            </p>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
              {totalConsultations}
            </h3>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 transition-all hover:shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-green-300 dark:bg-green-400">
                <FiClock className="w-6 h-6 text-[#e39a89] dark:text-[#1b3c35]" />
              </div>
              <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                {pendingCount} pending
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Pending/Scheduled
            </p>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
              {pendingCount}
            </h3>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 transition-all hover:shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-green-300 dark:bg-green-400">
                <FiCheckCircle className="w-6 h-6 text-[#e39a89] dark:text-[#1b3c35]" />
              </div>
              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                +{completedCount > 0 ? "22.3" : "0"}%
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Completed
            </p>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
              {completedCount}
            </h3>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 transition-all hover:shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-green-300 dark:bg-green-400">
                <FiUser className="w-6 h-6 text-[#e39a89] dark:text-[#1b3c35]" />
              </div>
              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                ₵{totalRevenue}
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Total Revenue
            </p>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
              ₵{totalRevenue.toFixed(2)}
            </h3>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1">
              <div className="relative">
                <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by name, email, or plan..."
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#e39a89]/20 focus:border-[#e39a89] dark:focus:border-[#1b3c35] outline-none transition-all duration-200"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowStatusDropdown(!showStatusDropdown);
                  setShowTypeDropdown(false);
                }}
                className="flex items-center gap-2 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200 w-full md:w-auto"
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

        {/* Consultations List */}
        <div className="space-y-4">
          {filteredConsultations.length > 0 ? (
            filteredConsultations.map((c) => (
              <div
                key={c.id}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 transition-all hover:shadow-xl"
              >
                <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                  {/* Left Side - Client Info */}
                  <div className="flex-1 space-y-3">
                    <div>
                      <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-2">
                        {c.plan}
                      </h3>
                      <div className="flex flex-wrap gap-4">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-green-300 dark:bg-green-400">
                            <FiUser className="w-4 h-4 text-[#e39a89] dark:text-[#1b3c35]" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Client
                            </p>
                            <p className="font-medium text-gray-800 dark:text-white">
                              {c.name}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-green-300 dark:bg-green-400">
                            <FiMail className="w-4 h-4 text-[#e39a89] dark:text-[#1b3c35]" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Email
                            </p>
                            <p className="font-medium text-gray-800 dark:text-white">
                              {c.email}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-green-300 dark:bg-green-400">
                            <FiCalendar className="w-4 h-4 text-[#e39a89] dark:text-[#1b3c35]" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Date & Time
                            </p>
                            <p className="font-medium text-gray-800 dark:text-white">
                              {c.date} at {c.time}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                        {c.consultationType}
                      </span>
                    </div>
                  </div>

                  {/* Right Side - Actions & Status */}
                  <div className="flex flex-col items-start md:items-end gap-4">
                    <div className="text-right">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Price
                      </div>
                      <div className="font-bold text-lg text-[#e39a89] dark:text-[#07725b]">
                        GH₵{c.price.toFixed(2)}
                      </div>
                    </div>

                    <div className="flex flex-col md:items-end gap-2">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          c.status === "completed"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                            : c.status === "cancelled"
                            ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                            : c.status === "pending"
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                            : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                        }`}
                      >
                        {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                      </span>

                      {/* Action Buttons */}
                      <div className="flex gap-2 mt-2">
                        <button
                          title="Mark Completed"
                          onClick={() => markCompleted(c.id)}
                          disabled={
                            c.status === "completed" || c.status === "cancelled"
                          }
                          className={`p-2 rounded-lg transition-colors duration-200 ${
                            c.status === "completed" || c.status === "cancelled"
                              ? "opacity-50 cursor-not-allowed"
                              : "text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/30"
                          }`}
                        >
                          <FiCheckCircle className="w-4 h-4" />
                        </button>

                        <button
                          title="Cancel"
                          onClick={() => cancelConsultation(c.id)}
                          /* disabled={
                            c.status === "cancelled" || c.status === "completed"
                          } */
                          className={`p-2 rounded-lg transition-colors duration-200 ${
                            c.status === "cancelled" || c.status === "completed"
                              ? "opacity-50 cursor-not-allowed"
                              : "text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30"
                          }`}
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 border border-gray-100 dark:border-gray-700 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-[#e39a89]/10 to-[#d87a6a]/10 dark:from-[#1b3c35]/10 dark:to-[#2a4d45]/10 flex items-center justify-center">
                <FiCalendar className="w-8 h-8 text-[#e39a89] dark:text-[#1b3c35]" />
              </div>
              <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
                No consultations found
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {hasActiveFilters
                  ? "Try adjusting your filters or search term"
                  : "No consultations have been booked yet"}
              </p>
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
