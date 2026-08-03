"use client";

import { onAuthStateChanged, signOut } from "firebase/auth";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { auth } from "@/lib/firebase";
import { allowedAdmins } from "@/lib/admin";

export default function ProtectedAdmin({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === "/admin" || pathname === "/admin/") {
      console.log("🔒 On admin auth page, skipping protection");
      setLoading(false);
      setIsAuthorized(true);
      return;
    }

    const unsub = onAuthStateChanged(auth, async (user) => {
      console.log("🔒 Auth state changed. User:", user?.email || "No user");

      if (!user) {
        console.log("🔒 No user found, redirecting to /admin");
        router.push("/admin");
        setLoading(false);
        return;
      }

      try {
        const email = user.email?.toLowerCase().trim();
        console.log("🔒 Checking email:", email);

        // Check if email is in allowed admins list
        if (!email || !allowedAdmins.includes(email)) {
          console.log("🔒 Email not allowed, signing out");
          await signOut(auth);
          router.push("/admin");
          setLoading(false);
          return;
        }

        // Email is allowed, grant access
        console.log("✅ Admin access granted for:", email);
        setIsAuthorized(true);
        setLoading(false);
      } catch (error) {
        console.error("🔒 Error checking admin access:", error);
        await signOut(auth);
        router.push("/admin");
        setLoading(false);
      }
    });

    return () => unsub();
  }, [router, pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#d87a6a] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Verifying admin access...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
