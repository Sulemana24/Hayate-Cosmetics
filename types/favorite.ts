export interface Favorite {
  id: string;
  userId: string;
  productId: string;
  name: string;
  imageUrl: string;
  price: number;
  category: string;
  addedAt?: Date;
}
