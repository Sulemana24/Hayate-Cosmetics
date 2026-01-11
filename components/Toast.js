// Toast.js
import React, { useEffect } from "react";

/**
 * @typedef {Object} ToastData
 * @property {string} id
 * @property {string} [title]
 * @property {string} message
 * @property {"success"|"error"|"info"} [type]
 * @property {number} [duration]
 */

/**
 * @param {{ toast: ToastData, onClose: (id: string) => void }} props
 */
export default function Toast({ toast, onClose }) {
  const { id, title, message, type = "info", duration = 5000 } = toast;

  useEffect(() => {
    const timer = setTimeout(() => onClose(id), duration);
    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  return (
    <div
      className={`p-4 rounded-lg shadow-lg border-l-4 min-w-full break-words ${
        type === "success"
          ? "bg-green-50 border-green-500 text-green-800"
          : type === "error"
          ? "bg-red-50 border-red-500 text-red-800"
          : "bg-blue-50 border-blue-500 text-blue-800"
      }`}
    >
      <div className="flex justify-between items-start">
        <div>
          {title && <h4 className="font-semibold">{title}</h4>}
          <p className="text-sm mt-1">{message}</p>
        </div>
        <button
          onClick={() => onClose(id)}
          className="ml-4 text-gray-500 hover:text-gray-700 font-bold"
        >
          ×
        </button>
      </div>
    </div>
  );
}
