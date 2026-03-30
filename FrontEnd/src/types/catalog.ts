/**
 * Kiểu dữ liệu khớp với Django REST (catalog ProductSerializer / CategorySerializer).
 * Dùng thống nhất cho API và component hiển thị danh sách (ProductCard).
 */
export interface CatalogCategory {
  id: number;
  parent: number | null;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface CatalogProductVariant {
  id: number;
  color: string;
  size: string;
  stock: number;
  sku?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CatalogProduct {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  image_url: string | null;
  /** DRF Decimal thường serialize thành string trong JSON */
  price: string | number;
  original_price?: string | number | null;
  discount_label?: string | null;
  rating: string | number;
  stock?: number;
  created_at?: string;
  updated_at?: string;
  categories?: CatalogCategory[];
  variants?: CatalogProductVariant[];
  primary_category?: CatalogCategory | null;
}

export interface CatalogPaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: CatalogProduct[];
}
