"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  doc,
  updateDoc,
} from "firebase/firestore";
import { FiUser, FiMail, FiLogOut, FiCalendar, FiClock } from "react-icons/fi";

interface Booking {
  id: string;
  plan: string;
  date: string;
  time: string;
  price: number;
  status: string;
  consultationType: string;
}

export default function ProfilePage() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [rescheduleId, setRescheduleId] = useState<string | null>(null);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [rescheduling, setRescheduling] = useState(false);

  const isUpcomingConsultation = (date: string, time: string) => {
    const consultationDate = new Date(`${date} ${time}`);
    return consultationDate >= new Date();
  };

  const upcomingBookings = bookings.filter((b) =>
    isUpcomingConsultation(b.date, b.time)
  );

  const pastBookings = bookings.filter(
    (b) => !isUpcomingConsultation(b.date, b.time)
  );

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
        const consultationsRef = collection(db, "consultations");

        const q = query(
          consultationsRef,
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc")
        );

        const snapshot = await getDocs(q);

        const fetchedBookings: Booking[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Booking, "id">),
        }));

        setBookings(fetchedBookings);
      } catch (error) {
        console.error("Failed to fetch consultations:", error);
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

  const handleReschedule = async () => {
    if (!rescheduleId || !newDate || !newTime) return;

    try {
      setRescheduling(true);

      await updateDoc(doc(db, "consultations", rescheduleId), {
        date: newDate,
        time: newTime,
        status: "rescheduled",
      });

      setBookings((prev) =>
        prev.map((b) =>
          b.id === rescheduleId
            ? { ...b, date: newDate, time: newTime, status: "rescheduled" }
            : b
        )
      );

      setRescheduleId(null);
      setNewDate("");
      setNewTime("");
    } catch (error) {
      console.error("Reschedule failed:", error);
    } finally {
      setRescheduling(false);
    }
  };

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
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
              Upcoming Consultations
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Please Note: To change plan, contact us on{" "}
              <span className="font-bold text-white ">0533842202</span>{" "}
              directly. Thank you.
            </p>
          </div>

          {upcomingBookings.length === 0 ? (
            <p className="text-gray-700 dark:text-gray-300">
              No upcoming consultations.
            </p>
          ) : (
            <div className="space-y-4">
              {upcomingBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-xl p-4"
                >
                  <div className="flex justify-between items-center">
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

                    <div className="text-right">
                      <p className="font-bold text-[#e39a89]">
                        GH₵{booking.price}
                      </p>
                      <span className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-700">
                        {booking.status}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setRescheduleId(booking.id)}
                    className="mt-3 text-sm text-[#e39a89] hover:underline"
                  >
                    Reschedule
                  </button>

                  {rescheduleId === booking.id && (
                    <div className="mt-4 space-y-3">
                      <input
                        type="date"
                        value={newDate}
                        min={new Date().toISOString().split("T")[0]}
                        onChange={(e) => setNewDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border"
                      />
                      <input
                        type="time"
                        value={newTime}
                        onChange={(e) => setNewTime(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border"
                      />

                      <button
                        onClick={handleReschedule}
                        disabled={rescheduling}
                        className="w-full py-2 bg-[#e39a89] text-white rounded-lg"
                      >
                        {rescheduling ? "Updating..." : "Confirm Reschedule"}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
            Past Consultations
          </h2>

          {pastBookings.length === 0 ? (
            <p className="text-gray-700 dark:text-gray-300">
              No past consultations.
            </p>
          ) : (
            <div className="space-y-4 opacity-70">
              {pastBookings.map((booking) => (
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
                  <span className="text-xs px-3 py-1 rounded-full bg-gray-200 text-gray-700">
                    Completed
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
