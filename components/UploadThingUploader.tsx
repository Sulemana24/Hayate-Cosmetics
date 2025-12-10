"use client";

import { UploadButton } from "@uploadthing/react";
import { OurFileRouter } from "@/lib/uploadthing";
import { FiUpload, FiX, FiCamera } from "react-icons/fi";
import { useState } from "react";

interface UploadThingUploaderProps {
  onUploadComplete: (url: string) => void;
  currentImageUrl?: string;
}

export default function UploadThingUploader({
  onUploadComplete,
  currentImageUrl,
}: UploadThingUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(
    currentImageUrl || null
  );

  const handleRemoveImage = () => {
    setUploadedUrl(null);
    onUploadComplete(""); // Clear the image URL
  };

  return (
    <div className="space-y-4">
      {/* Preview Section */}
      {uploadedUrl ? (
        <div className="relative">
          <div className="w-full h-64 rounded-xl overflow-hidden bg-gradient-to-r from-[#e39a89]/10 to-[#d87a6a]/10">
            <img
              src={uploadedUrl}
              alt="Product preview"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute top-4 right-4 flex gap-2">
            <button
              type="button"
              onClick={() => setIsUploading(true)}
              className="p-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg hover:bg-white dark:hover:bg-gray-800 transition-colors duration-200"
              title="Change image"
            >
              <FiCamera className="w-4 h-4 text-gray-700 dark:text-gray-300" />
            </button>
            <button
              type="button"
              onClick={handleRemoveImage}
              className="p-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg hover:bg-white dark:hover:bg-gray-800 transition-colors duration-200"
              title="Remove image"
            >
              <FiX className="w-4 h-4 text-red-600" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => setIsUploading(true)}
          className="w-full h-64 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-[#e39a89] dark:hover:border-[#1b3c35] transition-colors duration-200 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <div className="p-4 rounded-full bg-gradient-to-r from-[#e39a89]/10 to-[#d87a6a]/10 mb-3">
            <FiUpload className="w-8 h-8 text-[#e39a89]" />
          </div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Click to upload product image
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            PNG, JPG, GIF up to 4MB
          </p>
        </div>
      )}

      {/* Upload Button (Hidden trigger) */}
      {isUploading && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Upload Product Image
            </h3>
            <UploadButton<OurFileRouter, "productImage">
              endpoint="productImage"
              onClientUploadComplete={(res) => {
                setIsUploading(false);
                if (res?.[0]?.url) {
                  setUploadedUrl(res[0].url);
                  onUploadComplete(res[0].url);
                }
              }}
              onUploadError={(error: Error) => {
                setIsUploading(false);
                alert(`Upload failed: ${error.message}`);
              }}
              appearance={{
                button:
                  "bg-gradient-to-r from-[#e39a89] to-[#d87a6a] text-white",
                allowedContent: "text-gray-500 dark:text-gray-400",
              }}
            />
            <button
              type="button"
              onClick={() => setIsUploading(false)}
              className="mt-4 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <p className="text-xs text-gray-500 dark:text-gray-400">
        Upload a high-quality product image. Leave empty to use default image.
      </p>
    </div>
  );
}
