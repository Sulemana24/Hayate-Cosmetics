import React from "react";
import { ToastProvider } from "@/components/ToastProvider";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        {children}
      </div>
    </ToastProvider>
  );
}
