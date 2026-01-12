import React from "react";
import Toast from "./Toast";

/**
 * @param {{ toasts: Array<import("./Toast").ToastData>, hideToast: (id: string) => void }} props
 */
export default function ToastContainer({ toasts, hideToast }) {
  if (!toasts.length) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
      {toasts.map((toast) => (
        <div key={toast.id} className="transform transition-all duration-300">
          <Toast toast={toast} onClose={hideToast} />
        </div>
      ))}
    </div>
  );
}
