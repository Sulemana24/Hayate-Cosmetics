"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FiArrowLeft,
  FiSave,
  FiDollarSign,
  FiPercent,
  FiTag,
} from "react-icons/fi";
import { MdOutlineCategory, MdOutlineInventory } from "react-icons/md";

import { db } from "@/lib/firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import UploadThingUploader from "@/components/UploadThingUploader";

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    originalPrice: "",
    discountedPrice: "",
    category: "",
    subCategory: "",
    quantity: "",
    status: "In Stock" as "In Stock" | "Low Stock" | "Out of Stock",
    imageUrl: "",
  });

  const productCategories = ["Skincare", "Fragrance", "Accessories"];
  const subCategoriesMap: Record<string, string[]> = {
    Skincare: [
      "Cleanser",
      "Moisturizer",
      "Serum",
      "Sunscreen",
      "Mask",
      "Lotion",
    ],
    Fragrance: ["Perfume", "Body Mists", "Essential Oil", "Deodorant"],
    Accessories: ["Tools", "Bags", "Gift Sets"],
  };

  const statusOptions = ["In Stock", "Low Stock", "Out of Stock"];

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setProductForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "category" ? { subCategory: "" } : {}),
    }));
  };

  const handleImageUploadComplete = (url: string) => {
    setProductForm((prev) => ({ ...prev, imageUrl: url }));
  };

  const calculateDiscount = () => {
    const original = parseFloat(productForm.originalPrice) || 0;
    const discounted = parseFloat(productForm.discountedPrice) || 0;
    if (original > 0 && discounted > 0) {
      return Math.round(((original - discounted) / original) * 100);
    }
    return 0;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "In Stock":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "Low Stock":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "Out of Stock":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const productData = {
        name: productForm.name.trim(),
        description: productForm.description.trim(),

        category: productForm.category,
        categorySlug: productForm.category.toLowerCase(),

        subCategory: productForm.subCategory,
        subCategorySlug: productForm.subCategory.toLowerCase(),

        originalPrice: parseFloat(productForm.originalPrice),
        discountedPrice: parseFloat(productForm.discountedPrice),
        quantity: parseInt(productForm.quantity),
        status: productForm.status,
        imageUrl: productForm.imageUrl || null,

        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      // Validate data
      if (productData.discountedPrice > productData.originalPrice) {
        alert("Discounted price cannot be higher than original price");
        setLoading(false);
        return;
      }

      if (productData.quantity < 0) {
        alert("Quantity cannot be negative");
        setLoading(false);
        return;
      }

      if (productData.originalPrice <= 0 || productData.discountedPrice <= 0) {
        alert("Price must be greater than 0");
        setLoading(false);
        return;
      }

      const docRef = await addDoc(collection(db, "products"), productData);

      alert("Product added successfully!");
      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      console.error("Error adding product:", error);
      alert("Failed to add product. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/products"
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              <FiArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-[#1b3c35] dark:text-white">
                Add New Product
              </h1>
              <p className="text-gray-500 dark:text-gray-400">
                Fill in the details below to add a new product to your store
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Product Name */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-[#1b3c35] dark:text-white mb-4">
                Basic Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={productForm.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#e39a89]/20 focus:border-[#e39a89] dark:focus:border-[#1b3c35] outline-none transition-all duration-200"
                    placeholder="Enter product name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    required
                    value={productForm.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#e39a89]/20 focus:border-[#e39a89] dark:focus:border-[#1b3c35] outline-none transition-all duration-200 resize-none"
                    placeholder="Enter product description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category *
                  </label>
                  <div className="relative">
                    <select
                      name="category"
                      required
                      value={productForm.category}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#e39a89]/20 focus:border-[#e39a89] dark:focus:border-[#1b3c35] outline-none transition-all duration-200 appearance-none"
                    >
                      <option value="">Select category</option>
                      {productCategories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                    <MdOutlineCategory className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                  </div>
                </div>
                {productForm.category && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Sub-Category *
                    </label>
                    <div className="relative">
                      <select
                        name="subCategory"
                        required={!!productForm.category}
                        value={productForm.subCategory}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#e39a89]/20 focus:border-[#e39a89] dark:focus:border-[#1b3c35] outline-none transition-all duration-200 appearance-none"
                      >
                        <option value="">Select sub-category</option>
                        {subCategoriesMap[productForm.category]?.map((sub) => (
                          <option key={sub} value={sub}>
                            {sub}
                          </option>
                        ))}
                      </select>
                      <MdOutlineCategory className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Image Upload with UploadThing */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-[#1b3c35] dark:text-white mb-4">
                Product Image
              </h3>

              <UploadThingUploader
                onUploadComplete={handleImageUploadComplete}
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Pricing */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-[#1b3c35] dark:text-white mb-4 flex items-center gap-2">
                <FiDollarSign className="w-5 h-5" />
                Pricing
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Original Price *
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                        ₵
                      </span>
                      <input
                        type="number"
                        name="originalPrice"
                        required
                        min="0.01"
                        step="0.01"
                        value={productForm.originalPrice}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#e39a89]/20 focus:border-[#e39a89] dark:focus:border-[#1b3c35] outline-none transition-all duration-200"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Discounted Price *
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                        ₵
                      </span>
                      <input
                        type="number"
                        name="discountedPrice"
                        required
                        min="0.01"
                        step="0.01"
                        value={productForm.discountedPrice}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#e39a89]/20 focus:border-[#e39a89] dark:focus:border-[#1b3c35] outline-none transition-all duration-200"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>

                {/* Discount Percentage */}
                {productForm.originalPrice && productForm.discountedPrice && (
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#e39a89]/5 to-[#d87a6a]/5 dark:from-[#1b3c35]/10 dark:to-[#2a4d45]/10 rounded-xl">
                    <div className="flex items-center gap-2">
                      <FiPercent className="w-4 h-4 text-[#e39a89]" />
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Discount Applied
                      </span>
                    </div>
                    <span className="text-sm font-bold text-green-600">
                      {calculateDiscount()}% OFF
                    </span>
                  </div>
                )}

                <div className="text-xs text-gray-500 dark:text-gray-400">
                  * Discounted price must be lower than or equal to original
                  price
                </div>
              </div>
            </div>

            {/* Inventory */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-[#1b3c35] dark:text-white mb-4 flex items-center gap-2">
                <MdOutlineInventory className="w-5 h-5" />
                Inventory
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Quantity *
                    </label>
                    <input
                      type="number"
                      name="quantity"
                      required
                      min="0"
                      value={productForm.quantity}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#e39a89]/20 focus:border-[#e39a89] dark:focus:border-[#1b3c35] outline-none transition-all duration-200"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Status *
                    </label>
                    <select
                      name="status"
                      required
                      value={productForm.status}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#e39a89]/20 focus:border-[#e39a89] dark:focus:border-[#1b3c35] outline-none transition-all duration-200"
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-[#1b3c35] dark:text-white mb-4">
                Product Preview
              </h3>
              <div className="bg-gradient-to-r from-[#e39a89]/5 to-[#d87a6a]/5 dark:from-[#1b3c35]/10 dark:to-[#2a4d45]/10 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg bg-gradient-to-r from-[#e39a89]/20 to-[#d87a6a]/20 flex items-center justify-center overflow-hidden">
                    {productForm.imageUrl ? (
                      <img
                        src={productForm.imageUrl}
                        alt="Product preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FiTag className="w-6 h-6 text-[#e39a89]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-lg font-semibold text-gray-800 dark:text-white truncate">
                      {productForm.name || "Product Name"}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                      {productForm.description ||
                        "Product description will appear here"}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center gap-1">
                        {productForm.originalPrice && (
                          <span className="text-sm text-gray-400 line-through">
                            ₵{parseFloat(productForm.originalPrice).toFixed(2)}
                          </span>
                        )}
                        {productForm.discountedPrice && (
                          <span className="text-lg font-bold text-[#e39a89]">
                            ₵
                            {parseFloat(productForm.discountedPrice).toFixed(2)}
                          </span>
                        )}
                        {calculateDiscount() > 0 && (
                          <span className="text-xs font-bold text-green-600 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded">
                            -{calculateDiscount()}%
                          </span>
                        )}
                      </div>
                      {productForm.status && (
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            productForm.status
                          )}`}
                        >
                          {productForm.status}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <Link
                href="/admin/products"
                className="flex-1 px-6 py-3.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 text-center"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3.5 bg-gradient-to-r from-[#e39a89] to-[#d87a6a] hover:from-[#d87a6a] hover:to-[#c86a5a] text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Adding Product...
                  </>
                ) : (
                  <>
                    <FiSave className="w-4 h-4" />
                    Add Product
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
