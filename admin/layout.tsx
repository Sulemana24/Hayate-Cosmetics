// app/admin/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import AdminNavbar from "@/components/admin/AdminTopbar";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { UploadThingProvider } from "../app/providers";
import { ToastProvider } from "@/components/ToastProvider";
import ProtectedAdmin from "@/components/admin/ProtectedAdmin";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Admin Dashboard - Hayate Cosmetics",
  description: "Admin dashboard for managing Hayate Cosmetics",
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 dark:bg-gray-900`}>
        <ToastProvider>
          <ProtectedAdmin>
            <UploadThingProvider>
              <div className="flex min-h-screen">
                <AdminSidebar />
                <div className="flex-1 flex flex-col">
                  <AdminNavbar />
                  <main className="flex-1 overflow-auto p-6 bg-gray-50 dark:bg-gray-900">
                    {children}
                  </main>
                </div>
              </div>
            </UploadThingProvider>
          </ProtectedAdmin>
        </ToastProvider>
      </body>
    </html>
  );
}
