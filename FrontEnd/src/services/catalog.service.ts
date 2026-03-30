import api from "@/utils/axios";
import type { CatalogPaginatedResponse, CatalogProduct } from "@/types/catalog";
import type { CatalogCategory } from "@/types/catalog";

export type FetchCatalogProductsResult = {
  count: number;
  next: string | null;
  previous: string | null;
  results: CatalogProduct[];
};

/**
 * GET /catalog/products/ — phân trang, category, dress_style, giá, màu/size (ProductVariant).
 */
export async function fetchCatalogProducts(options: {
  page?: number;
  pageSize?: number;
  categorySlug?: string | null;
  dressStyleSlug?: string | null;
  minPrice?: number;
  maxPrice?: number;
  color?: string | null;
  size?: string | null;
  ordering?: string | null;
}): Promise<FetchCatalogProductsResult> {
  const page = options.page ?? 1;
  const pageSize = options.pageSize ?? 24;

  const params: Record<string, string | number> = {
    page,
    page_size: pageSize,
  };

  if (options.categorySlug) {
    params.category = options.categorySlug;
  }

  if (options.dressStyleSlug) {
    params.dress_style = options.dressStyleSlug;
  }

  if (options.minPrice !== undefined) {
    params.min_price = options.minPrice;
  }
  if (options.maxPrice !== undefined) {
    params.max_price = options.maxPrice;
  }

  if (options.color) {
    params.color = options.color;
  }
  if (options.size) {
    params.size = options.size;
  }

  if (options.ordering) {
    params.ordering = options.ordering;
  }

  const { data } = await api.get<CatalogPaginatedResponse>("catalog/products/", {
    params,
  });

  return {
    count: data.count,
    next: data.next,
    previous: data.previous,
    results: data.results,
  };
}

/**
 * GET /catalog/dress-styles/ — danh sách Category dùng để lọc "Dress Style".
 */
export async function fetchDressStyles(): Promise<CatalogCategory[]> {
  const { data } = await api.get<CatalogCategory[]>("catalog/dress-styles/");
  return data;
}
