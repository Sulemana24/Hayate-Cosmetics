"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { FiUser, FiMail, FiLogOut, FiCalendar, FiClock } from "react-icons/fi";

interface Booking {
  id: string;
  plan: string;
  date: string;
  time: string;
  amount: number;
  status?: string;
}

export default function ProfilePage() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  // Redirect to login if not logged in (after auth is initialized)
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  // Fetch bookings once user is available
  useEffect(() => {
    if (!user) return;

    const fetchBookings = async () => {
      setLoadingBookings(true);
      try {
        const bookingsRef = collection(db, "bookings");
        const q = query(
          bookingsRef,
          where("userId", "==", user.uid),
          orderBy("date", "desc")
        );
        const snapshot = await getDocs(q);
        const fetchedBookings: Booking[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Booking, "id">),
        }));
        setBookings(fetchedBookings);
      } catch (error) {
        console.error("Failed to fetch bookings:", error);
      } finally {
        setLoadingBookings(false);
      }
    };

    fetchBookings();
  }, [user]);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  // Show loader while auth state is initializing
  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-700 dark:text-gray-300">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Profile Info */}
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          My Profile
        </h1>
        <div className="mt-6 space-y-4">
          <div>
            <FiMail className="inline w-5 h-5 mr-2" />
            {user.email}
          </div>
          <div>
            <FiUser className="inline w-5 h-5 mr-2" />
            {user.displayName || "Not set"}
          </div>
        </div>

        {/* Booked Consultations */}
        <div className="mt-8">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
            Booked Consultations
          </h2>
          {loadingBookings ? (
            <p className="text-gray-700 dark:text-gray-300">Loading...</p>
          ) : bookings.length === 0 ? (
            <p className="text-gray-700 dark:text-gray-300">
              You have no booked consultations.
            </p>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white">
                      {booking.plan}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      <FiCalendar className="inline w-4 h-4 mr-1" />
                      {booking.date}{" "}
                      <FiClock className="inline w-4 h-4 ml-2 mr-1" />
                      {booking.time}
                    </p>
                  </div>
                  <span className="font-bold text-[#e39a89]">
                    GH₵{booking.amount}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={handleLogout}
          className="mt-6 p-4 bg-red-500 text-white rounded-xl"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
