"use client";

import { onAuthStateChanged, getIdTokenResult, signOut } from "firebase/auth";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";

export default function ProtectedAdmin({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/admin/auth");
        return;
      }

      try {
        const tokenResult = await getIdTokenResult(user);
        const isAdmin = tokenResult.claims.role === "admin";

        if (!isAdmin) {
          await signOut(auth);
          router.push("/admin/auth");
          return;
        }

        setLoading(false);
      } catch (error) {
        console.error("Error checking admin role:", error);
        await signOut(auth);
        router.push("/admin/auth");
      }
    });

    return () => unsub();
  }, [router]);

  if (loading) return null;

  return <>{children}</>;
}
