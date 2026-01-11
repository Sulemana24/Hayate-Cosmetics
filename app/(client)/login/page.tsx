import { Suspense } from "react";
import LoginClient from "./LoginClient";
import { ToastProvider } from "@/components/ToastProvider";

export default function LoginPage() {
  return (
    <ToastProvider>
      <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
        <LoginClient />
      </Suspense>
    </ToastProvider>
  );
}
