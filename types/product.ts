import { Timestamp } from "firebase/firestore";

export interface Product {
  id: string;
  name: string;
  description: string;
  originalPrice: number;
  discountedPrice: number;
  category: string;
  quantity: number;
  status: "In Stock" | "Low Stock" | "Out of Stock";
  imageUrl?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ProductCardProps {
  product: Product;
  onAddToCart?: () => void;
  onAddToFavorites?: () => void;
  showActions?: boolean;
}
