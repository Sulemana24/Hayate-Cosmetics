import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  limit,
  Timestamp,
} from "firebase/firestore";

export interface Review {
  id: string;
  productId: string;
  orderId: string;
  userId: string;
  userEmail: string;
  userName: string;
  rating: number;
  title: string;
  comment: string;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
  helpful: number;
  verifiedPurchase: boolean;
}

export function useProductReviews(productId: string, limitCount: number = 10) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  useEffect(() => {
    if (!productId) {
      setLoading(false);
      return;
    }

    const fetchReviews = async () => {
      try {
        setLoading(true);
        setError(null);

        const reviewsRef = collection(db, "reviews");
        const q = query(
          reviewsRef,
          where("productId", "==", productId),
          orderBy("createdAt", "desc"),
          limit(limitCount),
        );

        const snapshot = await getDocs(q);
        const reviewsList = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          } as Review;
        });

        setReviews(reviewsList);
        setTotalReviews(reviewsList.length);

        // Calculate average rating
        if (reviewsList.length > 0) {
          const sum = reviewsList.reduce(
            (acc, review) => acc + review.rating,
            0,
          );
          setAverageRating(sum / reviewsList.length);
        } else {
          setAverageRating(0);
        }
      } catch (err) {
        setError("Failed to load reviews");
        setReviews([]);
        setAverageRating(0);
        setTotalReviews(0);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [productId, limitCount]);

  return { reviews, loading, error, averageRating, totalReviews };
}
