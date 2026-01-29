export interface ProductCardData {
  id: string;
  title: string;
  subtitle?: string;
  productUrl?: string;
  imageUrl?: string;
  price?: string;
  oldPrice?: string;
  promoBadge?: "none" | "sale" | "new" | "bestseller" | "bestprice" | "hotdrop";
  isLoading: boolean;
}
