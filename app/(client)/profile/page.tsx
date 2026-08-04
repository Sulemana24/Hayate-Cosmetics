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
import {
  FiUser,
  FiMail,
  FiLogOut,
  FiCalendar,
  FiClock,
  FiPhoneCall,
} from "react-icons/fi";
import { useToast } from "@/components/ToastProvider";

interface Booking {
  id: string;
  plan: string;
  date: string;
  time: string;
  price: number;
  status: string;
  consultationType: string;
}

// Shared tokens with the rest of the storefront: ink #1b3c35, clay #E39A89
// (→ #c9614d for AA-safe text-on-light), sage #8FA593, cream base #FBF6EF.

function getInitials(name: string | null | undefined, email: string | null) {
  if (name && name.trim()) {
    const parts = name.trim().split(" ");
    return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
  }
  return (email?.[0] || "?").toUpperCase();
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
  const showToast = useToast();

  const isUpcomingConsultation = (date: string, time: string) => {
    const consultationDate = new Date(`${date} ${time}`);
    return consultationDate >= new Date();
  };

  const upcomingBookings = bookings.filter((b) =>
    isUpcomingConsultation(b.date, b.time),
  );

  const pastBookings = bookings.filter(
    (b) => !isUpcomingConsultation(b.date, b.time),
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
          orderBy("createdAt", "desc"),
        );

        const snapshot = await getDocs(q);

        const fetchedBookings: Booking[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Booking, "id">),
        }));

        setBookings(fetchedBookings);
      } catch (error) {
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
      <div className="min-h-screen flex items-center justify-center bg-[#FBF6EF] dark:bg-[#0f1e1a]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#E39A89]"></div>
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
            : b,
        ),
      );

      setRescheduleId(null);
      setNewDate("");
      setNewTime("");
    } catch (error) {
    } finally {
      setRescheduling(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF6EF] dark:bg-[#0f1e1a]">
      {/* Profile Header */}
      <div className="bg-gradient-to-br from-[#1b3c35] to-[#254f45]">
        <div className="container mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#E39A89]/20 border-2 border-[#E39A89]/40 flex items-center justify-center text-white text-xl sm:text-2xl font-bold shrink-0">
                {getInitials(user.displayName, user.email)}
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight truncate">
                  {user.displayName || "My Profile"}
                </h1>
                <div className="flex items-center gap-2 mt-2 text-white/65 text-sm">
                  <FiMail className="w-4 h-4 shrink-0" />
                  <span className="truncate">{user.email}</span>
                </div>
                {!user.displayName && (
                  <div className="flex items-center gap-2 mt-1 text-white/45 text-sm">
                    <FiUser className="w-4 h-4 shrink-0" />
                    Name not set
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/15 border border-white/15 text-white rounded-lg font-medium text-sm transition-colors shrink-0"
            >
              <FiLogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-10">
        {/* Upcoming Consultations */}
        <div>
          <div className="mb-6">
            <h2 className="text-xl font-bold text-[#1b3c35] dark:text-white mb-3 tracking-tight">
              Upcoming Consultations
            </h2>
            <div className="flex items-start gap-2.5 p-3.5 bg-[#E39A89]/10 border border-[#E39A89]/25 rounded-lg text-sm">
              <FiPhoneCall className="w-4 h-4 mt-0.5 text-[#c9614d] dark:text-[#E39A89] shrink-0" />
              <p className="text-[#26261F]/75 dark:text-white/75">
                To change plan, contact us on{" "}
                <span className="font-bold text-[#1b3c35] dark:text-white">
                  0533842202
                </span>{" "}
                directly. Thank you.
              </p>
            </div>
          </div>

          {loadingBookings ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="animate-pulse h-24 bg-[#1b3c35]/[0.05] dark:bg-white/5 rounded-xl"
                />
              ))}
            </div>
          ) : upcomingBookings.length === 0 ? (
            <div className="text-center py-10 bg-white dark:bg-[#16302a] ring-1 ring-black/5 dark:ring-white/5 rounded-xl">
              <p className="text-[#26261F]/55 dark:text-white/55">
                No upcoming consultations.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-white dark:bg-[#16302a] ring-1 ring-black/5 dark:ring-white/5 rounded-xl p-4 sm:p-5"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <p className="font-semibold text-[#1b3c35] dark:text-white">
                        {booking.plan}
                      </p>
                      <p className="text-[#26261F]/55 dark:text-white/55 text-sm mt-1 flex items-center flex-wrap gap-x-3 gap-y-1">
                        <span className="inline-flex items-center gap-1">
                          <FiCalendar className="w-4 h-4" />
                          {booking.date}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <FiClock className="w-4 h-4" />
                          {booking.time}
                        </span>
                      </p>
                    </div>

                    <div className="text-left sm:text-right shrink-0">
                      <p className="font-bold text-[#1b3c35] dark:text-white">
                        GH₵{booking.price}
                      </p>
                      <span className="inline-block mt-1 text-xs px-3 py-1 rounded-full bg-[#8FA593]/15 text-[#4d6b56] dark:text-[#a9c2ae] font-medium">
                        {booking.status}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      setRescheduleId(
                        rescheduleId === booking.id ? null : booking.id,
                      )
                    }
                    className="mt-3 text-sm text-[#c9614d] dark:text-[#E39A89] hover:opacity-80 font-medium"
                  >
                    {rescheduleId === booking.id ? "Cancel" : "Reschedule"}
                  </button>

                  {rescheduleId === booking.id && (
                    <div className="mt-4 pt-4 border-t border-[#1b3c35]/10 dark:border-white/10 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="date"
                          value={newDate}
                          min={new Date().toISOString().split("T")[0]}
                          onChange={(e) => setNewDate(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-[#1b3c35]/15 dark:border-white/15 bg-white dark:bg-[#0f1e1a] text-[#1b3c35] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#E39A89]"
                        />
                        <input
                          type="time"
                          value={newTime}
                          onChange={(e) => setNewTime(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-[#1b3c35]/15 dark:border-white/15 bg-white dark:bg-[#0f1e1a] text-[#1b3c35] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#E39A89]"
                        />
                      </div>

                      <button
                        onClick={handleReschedule}
                        disabled={rescheduling || !newDate || !newTime}
                        className="w-full py-2.5 bg-[#1b3c35] hover:bg-[#254f45] text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

        {/* Past Consultations */}
        <div className="mt-10 sm:mt-12">
          <h2 className="text-xl font-bold text-[#1b3c35] dark:text-white mb-4 tracking-tight">
            Past Consultations
          </h2>

          {loadingBookings ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div
                  key={`past-${i}`}
                  className="animate-pulse h-16 bg-[#1b3c35]/[0.05] dark:bg-white/5 rounded-xl"
                />
              ))}
            </div>
          ) : pastBookings.length === 0 ? (
            <div className="text-center py-10 bg-white dark:bg-[#16302a] ring-1 ring-black/5 dark:ring-white/5 rounded-xl">
              <p className="text-[#26261F]/55 dark:text-white/55">
                No past consultations.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {pastBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-white/70 dark:bg-[#16302a]/60 ring-1 ring-black/5 dark:ring-white/5 rounded-xl p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-2"
                >
                  <div>
                    <p className="font-medium text-[#1b3c35]/80 dark:text-white/80">
                      {booking.plan}
                    </p>
                    <p className="text-[#26261F]/50 dark:text-white/50 text-sm mt-0.5 flex items-center flex-wrap gap-x-3">
                      <span className="inline-flex items-center gap-1">
                        <FiCalendar className="w-4 h-4" />
                        {booking.date}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <FiClock className="w-4 h-4" />
                        {booking.time}
                      </span>
                    </p>
                  </div>
                  <span className="self-start sm:self-center text-xs px-3 py-1 rounded-full bg-[#1b3c35]/[0.06] dark:bg-white/10 text-[#1b3c35]/60 dark:text-white/60 font-medium shrink-0">
                    Completed
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
