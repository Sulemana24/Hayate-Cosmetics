import { Timestamp } from "firebase/firestore";

export interface Product {
  id: string;
  name: string;
  description: string;
  originalPrice: number;
  discountedPrice: number;
  category: string;
  categorySlug: "skincare" | "fragrance" | "makeup";
  quantity: number;
  status: "In Stock" | "Low Stock" | "Out of Stock";
  imageUrl?: string;
  createdAt?: Timestamp | Date;
  updatedAt?: Timestamp | Date;
}

export interface ProductCardProps {
  product: Product;
  onAddToCart?: () => void;
  onAddToFavorites?: () => void;
  showActions?: boolean;
}
