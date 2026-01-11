import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import ClientNavbar from "../../components/Navbar";
import ClientFooter from "../../components/Footer";
import { UploadThingProvider } from "../providers";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/components/ToastProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Hayate Cosmetics - Premium Beauty Products",
  description:
    "Discover premium skincare, fragrance, and beauty accessories for every skin type",
};

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <AuthProvider>
        <UploadThingProvider>
          <div className={`${inter.className} bg-gray-50 dark:bg-gray-900`}>
            <ClientNavbar />
            <main className="min-h-screen">{children}</main>
            <ClientFooter />
          </div>
        </UploadThingProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
