export interface Product {
  id: number;
  name: string;
  image: string;
  rating: number;
  price: number;
  originalPrice?: number;
  discountLabel?: string;
}