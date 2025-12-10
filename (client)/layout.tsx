import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import ClientNavbar from "../components/Navbar";
import ClientFooter from "../components/Footer";
import { UploadThingProvider } from "../app/providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Hayate Cosmetics - Premium Beauty Products",
  description:
    "Discover premium skincare, fragrance, and beauty accessories for every skin type",
};

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 dark:bg-gray-900`}>
        <UploadThingProvider>
          <ClientNavbar />
          <main className="min-h-screen">{children}</main>
          <ClientFooter />
        </UploadThingProvider>
      </body>
    </html>
  );
}
