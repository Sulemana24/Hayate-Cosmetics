"use client";

import { useState, useEffect, useRef } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import ProtectedAdmin from "@/components/admin/ProtectedAdmin";

import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  query,
  orderBy,
  Timestamp,
} from "firebase/firestore";

import {
  FiSearch,
  FiFilter,
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiChevronDown,
  FiPackage,
  FiShoppingBag,
  FiDollarSign,
  FiX,
  FiUpload,
  FiTag,
  FiSave,
  FiPercent,
  FiCamera,
} from "react-icons/fi";

import { MdOutlineInventory, MdOutlineCategory } from "react-icons/md";

interface Product {
  id: string;
  name: string;
  description: string;
  originalPrice: number;
  discountedPrice: number;
  category: string;
  quantity: number;
  status: "In Stock" | "Low Stock" | "Out of Stock";

  createdAt: Timestamp;
}

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    originalPrice: "",
    discountedPrice: "",
    category: "",
    quantity: "",
    status: "In Stock" as "In Stock" | "Low Stock" | "Out of Stock",
  });
  const [imagePreview, setImagePreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = ["All", "Cosmetics", "Fragrance", "Accessories"];
  const productCategories = ["Cosmetics", "Fragrance", "Accessories"];
  const statusOptions = ["In Stock", "Low Stock", "Out of Stock"];

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const q = query(
          collection(db, "products"),
          orderBy("createdAt", "desc")
        );
        const snapshot = await getDocs(q);
        const items = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Product[];
        setProducts(items);
      } catch (error) {
        console.error("Firestore fetch failed:", error);
      }
    };
    fetchProducts();
  }, []);

  // Sync edit form when opening modal
  useEffect(() => {
    if (editingProduct && showProductModal) {
      const timer = setTimeout(() => {
        setProductForm({
          name: editingProduct.name,
          description: editingProduct.description,
          originalPrice: editingProduct.originalPrice.toString(),
          discountedPrice: editingProduct.discountedPrice.toString(),
          category: editingProduct.category,
          quantity: editingProduct.quantity.toString(),
          status: editingProduct.status,
        });
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [editingProduct, showProductModal]);

  // Handlers
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setProductForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }
    setProductForm((prev) => ({ ...prev, imageFile: file }));
    setImagePreview(URL.createObjectURL(file));
  };

  const handleUploadClick = () => fileInputRef.current?.click();
  const removeImage = () => {
    setImagePreview("");
    setProductForm((prev) => ({ ...prev, imageFile: null }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const calculateDiscount = () => {
    const original = parseFloat(productForm.originalPrice) || 0;
    const discounted = parseFloat(productForm.discountedPrice) || 0;
    if (original > 0 && discounted > 0)
      return Math.round(((original - discounted) / original) * 100);
    return 0;
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowProductModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await deleteDoc(doc(db, "products", id));
      setProducts(products.filter((p) => p.id !== id));
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete product");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const productData = {
        name: productForm.name,
        description: productForm.description,
        originalPrice: Number(productForm.originalPrice),
        discountedPrice: Number(productForm.discountedPrice),
        category: productForm.category,
        quantity: Number(productForm.quantity),
        status: productForm.status,

        createdAt: Timestamp.now(),
      };

      if (editingProduct) {
        await updateDoc(doc(db, "products", editingProduct.id), productData);
        setProducts((prev) =>
          prev.map((p) =>
            p.id === editingProduct.id ? { ...p, ...productData } : p
          )
        );
      } else {
        const docRef = await addDoc(collection(db, "products"), productData);
        setProducts([{ id: docRef.id, ...productData }, ...products]);
      }

      resetForm();
      setShowProductModal(false);
    } catch (error) {
      console.error("Save failed:", error);
      alert("Failed to save product");
    }
  };

  const resetForm = () => {
    setProductForm({
      name: "",
      description: "",
      originalPrice: "",
      discountedPrice: "",
      category: "",
      quantity: "",
      status: "In Stock",
    });

    if (fileInputRef.current) fileInputRef.current.value = "";
    setEditingProduct(null);
  };

  const handleModalClose = () => {
    setShowProductModal(false);
    setTimeout(resetForm, 300);
  };

  const handleAddNewProduct = () => {
    resetForm();
    setShowProductModal(true);
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusColor = (status: Product["status"]) => {
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

  return (
    <ProtectedAdmin>
      <AdminLayout>
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#1b3c35] dark:text-white mb-2">
                Products Management
              </h1>
              <p className="text-gray-500 dark:text-gray-400">
                Manage your store products, inventory, and pricing
              </p>
            </div>
            <button
              onClick={handleAddNewProduct}
              className="bg-gradient-to-r from-[#e39a89] to-[#d87a6a] hover:from-[#d87a6a] hover:to-[#c86a5a] text-white px-4 py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 transition-all duration-200"
            >
              <FiPlus className="w-4 h-4" />
              Add New Product
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-r from-[#e39a89]/20 to-[#d87a6a]/20">
                <FiPackage className="w-6 h-6 text-[#e39a89]" />
              </div>
              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                +12.5%
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Total Products
            </p>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
              {products.length}
            </h3>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-green-50 dark:bg-green-900/20">
                <FiShoppingBag className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                +8.3%
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              In Stock
            </p>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
              {products.filter((p) => p.status === "In Stock").length}
            </h3>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-yellow-50 dark:bg-yellow-900/20">
                <FiPackage className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <span className="text-sm font-medium text-red-600 dark:text-red-400">
                -2.1%
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Low Stock
            </p>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
              {products.filter((p) => p.status === "Low Stock").length}
            </h3>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20">
                <FiDollarSign className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                +15.2%
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Avg. Price
            </p>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
              ₵
              {Math.round(
                products.reduce((sum, p) => sum + p.discountedPrice, 0) /
                  products.length
              )}
            </h3>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1">
              <div className="relative">
                <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search products by name or description..."
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#e39a89]/20 focus:border-[#e39a89] dark:focus:border-[#1b3c35] outline-none transition-all duration-200"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="relative">
              <button
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                className="flex items-center gap-2 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200"
              >
                <FiFilter className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700 dark:text-gray-300">
                  {selectedCategory}
                </span>
                <FiChevronDown className="w-5 h-5 text-gray-400" />
              </button>

              {showCategoryDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowCategoryDropdown(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-20">
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => {
                          setSelectedCategory(category);
                          setShowCategoryDropdown(false);
                        }}
                        className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 first:rounded-t-xl last:rounded-b-xl ${
                          selectedCategory === category
                            ? "text-[#e39a89] dark:text-[#1b3c35] font-medium"
                            : "text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr className="text-left text-sm text-gray-500 dark:text-gray-400">
                  <th className="py-4 pl-6 font-medium">Product</th>
                  <th className="py-4 font-medium">Category</th>
                  <th className="py-4 font-medium">Price</th>
                  <th className="py-4 font-medium">Quantity</th>
                  <th className="py-4 font-medium">Status</th>
                  <th className="py-4 pr-6 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filteredProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors duration-150"
                  >
                    <td className="py-4 pl-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gradient-to-r from-[#e39a89]/20 to-[#d87a6a]/20"></div>
                        <div>
                          <h4 className="font-medium text-gray-800 dark:text-white mb-1">
                            {product.name}
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                            {product.description}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-400 line-through">
                              ₵{product.originalPrice.toFixed(2)}
                            </span>
                            <span className="text-sm font-medium text-[#e39a89]">
                              ₵{product.discountedPrice.toFixed(2)}
                            </span>
                            {product.originalPrice >
                              product.discountedPrice && (
                              <span className="text-xs font-medium text-green-600 bg-green-50 dark:bg-green-900/30 px-1.5 py-0.5 rounded">
                                -
                                {Math.round(
                                  ((product.originalPrice -
                                    product.discountedPrice) /
                                    product.originalPrice) *
                                    100
                                )}
                                %
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                        {product.category}
                      </span>
                    </td>
                    <td className="py-4">
                      <div className="text-sm text-gray-800 dark:text-white">
                        <div className="font-medium">
                          ₵{product.discountedPrice.toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-500 line-through">
                          ₵{product.originalPrice.toFixed(2)}
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="text-sm font-medium text-gray-800 dark:text-white">
                        {product.quantity}
                      </div>
                    </td>
                    <td className="py-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          product.status
                        )}`}
                      >
                        {product.status}
                      </span>
                    </td>
                    <td className="py-4 pr-6">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30 rounded-lg transition-colors duration-200"
                          title="Edit"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 rounded-lg transition-colors duration-200"
                          title="Delete"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-[#e39a89]/10 to-[#d87a6a]/10 flex items-center justify-center">
                <FiPackage className="w-8 h-8 text-[#e39a89]" />
              </div>
              <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
                No products found
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {searchQuery || selectedCategory !== "All"
                  ? "Try adjusting your search or filter"
                  : "Add your first product to get started"}
              </p>
              <button
                onClick={handleAddNewProduct}
                className="bg-gradient-to-r from-[#e39a89] to-[#d87a6a] hover:from-[#d87a6a] hover:to-[#c86a5a] text-white px-6 py-2 rounded-xl font-medium inline-flex items-center gap-2 transition-all duration-200"
              >
                <FiPlus className="w-4 h-4" />
                Add New Product
              </button>
            </div>
          )}

          {/* Footer - Pagination and Stats */}
          {filteredProducts.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Showing{" "}
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {filteredProducts.length}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {products.length}
                  </span>{" "}
                  products
                </div>
                <div className="flex items-center gap-2">
                  <button className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg transition-colors duration-200">
                    Previous
                  </button>
                  <button className="px-3 py-2 text-sm font-medium bg-[#e39a89] text-white rounded-lg hover:bg-[#d87a6a] transition-colors duration-200">
                    1
                  </button>
                  <button className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg transition-colors duration-200">
                    2
                  </button>
                  <button className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg transition-colors duration-200">
                    3
                  </button>
                  <button className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg transition-colors duration-200">
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Product Modal */}
        {showProductModal && (
          <>
            {/* Blur Overlay */}
            <div className="fixed inset-0 z-40 backdrop-blur-sm bg-black/30 dark:bg-black/50 transition-all duration-300" />

            {/* Modal - Centered with flexbox */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden bg-white dark:bg-gray-800 rounded-2xl shadow-2xl">
                {/* Modal Header */}
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-[#e39a89]/5 to-[#d87a6a]/5 dark:from-[#1b3c35]/10 dark:to-[#2a4d45]/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-[#1b3c35] dark:text-white">
                        {editingProduct ? "Edit Product" : "Add New Product"}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {editingProduct
                          ? "Update the product details below"
                          : "Fill in the details below to add a new product to your store"}
                      </p>
                    </div>
                    <button
                      onClick={handleModalClose}
                      className="p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                    >
                      <FiX className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Modal Body - Form */}
                <form onSubmit={handleSubmit}>
                  <div
                    className="px-6 py-6 overflow-y-auto"
                    style={{ maxHeight: "calc(90vh - 140px)" }}
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Left Column */}
                      <div className="space-y-6">
                        {/* Product Name */}
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

                        {/* Description */}
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

                        {/* Category */}
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

                        {/* Image Upload - Changed to file upload */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Product Image
                          </label>

                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageUpload}
                            accept="image/*"
                            className="hidden"
                          />

                          {imagePreview ? (
                            <div className="relative">
                              <div className="w-full h-48 rounded-xl overflow-hidden bg-gradient-to-r from-[#e39a89]/10 to-[#d87a6a]/10">
                                <img
                                  src={imagePreview}
                                  alt="Preview"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="absolute top-2 right-2 flex gap-2">
                                <button
                                  type="button"
                                  onClick={handleUploadClick}
                                  className="p-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg hover:bg-white dark:hover:bg-gray-800 transition-colors duration-200"
                                  title="Change image"
                                >
                                  <FiCamera className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                                </button>
                                <button
                                  type="button"
                                  onClick={removeImage}
                                  className="p-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg hover:bg-white dark:hover:bg-gray-800 transition-colors duration-200"
                                  title="Remove image"
                                >
                                  <FiX className="w-4 h-4 text-red-600" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div
                              onClick={handleUploadClick}
                              className="w-full h-48 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-[#e39a89] dark:hover:border-[#1b3c35] transition-colors duration-200 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <div className="p-4 rounded-full bg-gradient-to-r from-[#e39a89]/10 to-[#d87a6a]/10 mb-3">
                                <FiUpload className="w-8 h-8 text-[#e39a89]" />
                              </div>
                              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Click to upload product image
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                PNG, JPG, GIF up to 5MB
                              </p>
                            </div>
                          )}

                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            Leave empty to use default product image
                          </p>
                        </div>
                      </div>

                      {/* Right Column */}
                      <div className="space-y-6">
                        {/* Pricing */}
                        <div className="space-y-4">
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            <FiDollarSign className="w-4 h-4" />
                            Pricing
                          </h4>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
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
                                  min="0"
                                  step="0.01"
                                  value={productForm.originalPrice}
                                  onChange={handleInputChange}
                                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#e39a89]/20 focus:border-[#e39a89] dark:focus:border-[#1b3c35] outline-none transition-all duration-200"
                                  placeholder="0.00"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
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
                                  min="0"
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
                          {productForm.originalPrice &&
                            productForm.discountedPrice && (
                              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-[#e39a89]/5 to-[#d87a6a]/5 dark:from-[#1b3c35]/10 dark:to-[#2a4d45]/10 rounded-lg">
                                <div className="flex items-center gap-2">
                                  <FiPercent className="w-4 h-4 text-[#e39a89]" />
                                  <span className="text-sm text-gray-600 dark:text-gray-400">
                                    Discount Applied
                                  </span>
                                </div>
                                <span className="text-sm font-medium text-green-600">
                                  {calculateDiscount()}% OFF
                                </span>
                              </div>
                            )}
                        </div>

                        {/* Inventory */}
                        <div className="space-y-4">
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            <MdOutlineInventory className="w-4 h-4" />
                            Inventory
                          </h4>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
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
                              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
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

                        {/* Preview Card */}
                        <div className="bg-gradient-to-r from-[#e39a89]/5 to-[#d87a6a]/5 dark:from-[#1b3c35]/10 dark:to-[#2a4d45]/10 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                            Product Preview
                          </h4>
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-[#e39a89]/20 to-[#d87a6a]/20 flex items-center justify-center overflow-hidden">
                              {imagePreview ? (
                                <img
                                  src={imagePreview}
                                  alt="Preview"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <FiTag className="w-5 h-5 text-[#e39a89]" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-800 dark:text-white truncate">
                                {productForm.name || "Product Name"}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {productForm.description ||
                                  "Product description will appear here"}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                {productForm.originalPrice && (
                                  <span className="text-xs text-gray-400 line-through">
                                    ₵
                                    {parseFloat(
                                      productForm.originalPrice
                                    ).toFixed(2)}
                                  </span>
                                )}
                                {productForm.discountedPrice && (
                                  <span className="text-xs font-medium text-[#e39a89]">
                                    ₵
                                    {parseFloat(
                                      productForm.discountedPrice
                                    ).toFixed(2)}
                                  </span>
                                )}
                                {calculateDiscount() > 0 && (
                                  <span className="text-xs font-medium text-green-600 bg-green-50 dark:bg-green-900/30 px-1.5 py-0.5 rounded">
                                    -{calculateDiscount()}%
                                  </span>
                                )}
                              </div>
                            </div>
                            {productForm.status && (
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
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

                  {/* Modal Footer */}
                  <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
                    <div className="flex flex-col sm:flex-row justify-end gap-3">
                      <button
                        type="button"
                        onClick={handleModalClose}
                        className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2.5 bg-gradient-to-r from-[#e39a89] to-[#d87a6a] hover:from-[#d87a6a] hover:to-[#c86a5a] text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-all duration-200"
                      >
                        {editingProduct ? (
                          <>
                            <FiSave className="w-4 h-4" />
                            Update Product
                          </>
                        ) : (
                          <>
                            <FiPlus className="w-4 h-4" />
                            Add Product
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </>
        )}
      </AdminLayout>
    </ProtectedAdmin>
  );
}
