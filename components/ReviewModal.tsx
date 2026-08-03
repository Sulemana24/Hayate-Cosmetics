"use client";
import { useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
  getDoc,
  runTransaction,
  increment,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { FiStar, FiX } from "react-icons/fi";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
  orderId: string;
  onReviewSubmitted?: () => void;
}

export default function ReviewModal({
  isOpen,
  onClose,
  productId,
  productName,
  orderId,
  onReviewSubmitted,
}: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const auth = getAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!auth.currentUser) {
      setError("Please sign in to leave a review");
      return;
    }

    if (rating === 0) {
      setError("Please select a rating");
      return;
    }

    if (!comment.trim()) {
      setError("Please write a review comment");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const user = auth.currentUser;
      const userEmail = user.email || "";
      const userName =
        user.displayName || user.email?.split("@")[0] || "Anonymous";

      // Create review data
      const reviewData = {
        productId: productId,
        orderId: orderId,
        userId: user.uid,
        userEmail: userEmail,
        userName: userName,
        rating: rating,
        title: title.trim() || `${rating} Star Review`,
        comment: comment.trim(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        helpful: 0,
        verifiedPurchase: true,
      };

      console.log("Submitting review:", reviewData);

      // STEP 1: Add the review
      const reviewsRef = collection(db, "reviews");
      const docRef = await addDoc(reviewsRef, reviewData);
      console.log("✅ Review added with ID:", docRef.id);

      // STEP 2: Try to update product rating (with error handling)
      try {
        const productRef = doc(db, "products", productId);
        const productSnap = await getDoc(productRef);

        if (productSnap.exists()) {
          const productData = productSnap.data();
          const currentReviews = productData.reviewCount || 0;
          const currentRating = productData.rating || 0;

          const newTotalRating = currentRating * currentReviews + rating;
          const newReviewCount = currentReviews + 1;
          const newAverageRating = newTotalRating / newReviewCount;

          await updateDoc(productRef, {
            rating: newAverageRating,
            reviewCount: newReviewCount,
            updatedAt: serverTimestamp(),
          });
          console.log("✅ Product updated with new rating");
        } else {
          console.warn("⚠️ Product not found, skipping rating update");
        }
      } catch (productError: any) {
        // If product update fails, log it but don't fail the review
        console.warn(
          "⚠️ Could not update product rating:",
          productError.message,
        );
        // Don't throw - the review was already added successfully
      }

      setSuccess(true);
      setRating(0);
      setTitle("");
      setComment("");

      setTimeout(() => {
        onClose();
        if (onReviewSubmitted) onReviewSubmitted();
      }, 1500);
    } catch (err: any) {
      console.error("❌ Error submitting review:", err);

      if (err.code === "permission-denied") {
        setError(
          "Unable to submit review. Please make sure you're logged in and have purchased this product.",
        );
      } else if (err.code === "not-found") {
        setError("Product not found. Please refresh and try again.");
      } else {
        setError(
          `Failed to submit review: ${err.message || "Please try again."}`,
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Star rating component
  const renderStars = () => {
    const stars = [];
    const currentRating = hoveredRating || rating;

    for (let i = 1; i <= 5; i++) {
      stars.push(
        <button
          key={i}
          type="button"
          onClick={() => setRating(i)}
          onMouseEnter={() => setHoveredRating(i)}
          onMouseLeave={() => setHoveredRating(0)}
          className="focus:outline-none transition-transform hover:scale-110"
          aria-label={`Rate ${i} stars`}
        >
          <FiStar
            className={`w-8 h-8 ${
              i <= currentRating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300 dark:text-gray-600"
            } transition-colors`}
          />
        </button>,
      );
    }
    return stars;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Write a Review
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <FiX className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                <FiStar className="w-8 h-8 text-green-600 dark:text-green-400 fill-green-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Review Submitted!
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Thank you for your feedback on {productName}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                Your review helps other customers make better decisions.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Product name */}
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Reviewing
                </p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {productName}
                </p>
              </div>

              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Rating *
                </label>
                <div className="flex gap-2">{renderStars()}</div>
                {rating > 0 && (
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    {rating === 1 && "Poor - Needs improvement"}
                    {rating === 2 && "Fair - Below average"}
                    {rating === 3 && "Good - Satisfied"}
                    {rating === 4 && "Very Good - Highly satisfied"}
                    {rating === 5 && "Excellent - Outstanding!"}
                  </p>
                )}
              </div>

              {/* Review Title */}
              <div>
                <label
                  htmlFor="review-title"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Review Title{" "}
                  <span className="text-gray-400 text-xs">(Optional)</span>
                </label>
                <input
                  id="review-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Summarize your experience"
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#d87a6a] focus:border-transparent text-gray-900 dark:text-white"
                  maxLength={100}
                />
              </div>

              {/* Review Comment */}
              <div>
                <label
                  htmlFor="review-comment"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Review *
                </label>
                <textarea
                  id="review-comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your experience with this product..."
                  rows={4}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#d87a6a] focus:border-transparent text-gray-900 dark:text-white resize-none"
                  maxLength={1000}
                  required
                />
                <div className="mt-1 flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>Minimum 10 characters</span>
                  <span>{comment.length}/1000</span>
                </div>
              </div>

              {/* Error message */}
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm flex items-start gap-2">
                  <span className="mt-0.5">⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || rating === 0 || !comment.trim()}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#d87a6a] to-[#c76a5a] text-white rounded-lg hover:opacity-90 transition-opacity font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    "Submit Review"
                  )}
                </button>
              </div>

              {/* Note about reviews */}
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                By submitting a review, you agree to our terms and conditions.
                Your review will be visible to other customers.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
