import { Review } from "@/hooks/useProductReviews";
import { FiStar, FiCheck, FiUser } from "react-icons/fi";
import { Timestamp } from "firebase/firestore"; // Add this import

interface ReviewCardProps {
  review: Review;
}

export default function ReviewCard({ review }: ReviewCardProps) {
  const formatDate = (
    timestamp: Timestamp | Date | null | undefined,
  ): string => {
    if (!timestamp) return "Recently";

    try {
      let date: Date;
      if (timestamp instanceof Timestamp) {
        date = timestamp.toDate();
      } else if (timestamp instanceof Date) {
        date = timestamp;
      } else {
        return "Recently";
      }

      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Recently";
    }
  };

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-0">
      {/* Review Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#e39a89] to-[#d87a6a] flex items-center justify-center text-white font-semibold">
            {review.userName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900 dark:text-white">
                {review.userName}
              </span>
              {review.verifiedPurchase && (
                <span className="inline-flex items-center gap-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full">
                  <FiCheck className="w-3 h-3" />
                  Verified Purchase
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <FiStar
                    key={i}
                    className={`w-4 h-4 ${
                      i < review.rating
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-300 dark:text-gray-600"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {formatDate(review.createdAt)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Review Content */}
      <div className="ml-13">
        {review.title && (
          <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
            {review.title}
          </h4>
        )}
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          {review.comment}
        </p>

        {/* Helpful count */}
        {review.helpful > 0 && (
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            {review.helpful} people found this helpful
          </div>
        )}
      </div>
    </div>
  );
}
