import { AxiosError } from "axios";
import type { CatalogPaginatedResponse, CatalogProduct } from "@/types/catalog";
import type { CatalogCategory } from "@/types/catalog";
import { CATALOG_PRICE_SLIDER_MAX } from "@/constants/catalogPriceRange";
import api from "@/utils/axios";

export type FetchCatalogProductsResult = {
  count: number;
  next: string | null;
  previous: string | null;
  results: CatalogProduct[];
};

const CATALOG_PRODUCTS = "catalog/products/";
const CATALOG_DRESS_STYLES = "catalog/dress-styles/";

async function fetchCatalogProductById(id: number): Promise<CatalogProduct> {
  const { data } = await api.get<CatalogProduct>(`${CATALOG_PRODUCTS}${id}/`, {
    params: { _t: Date.now() },
  });
  return data;
}

/**
 * Luôn GET `/catalog/products/{id}/` theo id số — dùng khi add-to-cart để chắc payload có đủ `variants[].id`,
 * không phụ thuộc bản ghép từ list khi URL là slug (404 rồi fallback list).
 */
export async function fetchCatalogProductDetailByNumericId(productId: number): Promise<CatalogProduct> {
  if (!Number.isFinite(productId) || productId <= 0) {
    throw new Error("Invalid product id");
  }
  const { data } = await api.get<CatalogProduct>(`${CATALOG_PRODUCTS}${productId}/`, {
    params: { _t: Date.now() },
  });
  return await ensureProductVariantsLoaded(data);
}

/**
 * Chỉ gọi GET /catalog/products/{id}/ khi payload hiện tại **không có** `variants`.
 * Trước đây luôn refetch rồi `catch { return product }` — nếu refetch lỗi (sai port, 401, mạng)
 * lại trả về bản list/slug thiếu variant → UI vẫn chọn màu/size nhưng `resolveVariantId` thất bại
 * và POST cart không có `product_variant_id`.
 */
function variantsHaveStableIds(variants: CatalogProduct["variants"]): boolean {
  if (!variants?.length) return false;
  return variants.every((v) => {
    const id = (v as { id?: unknown }).id;
    const n = typeof id === "number" ? id : Number.parseInt(String(id), 10);
    return Number.isFinite(n) && n > 0;
  });
}

async function ensureProductVariantsLoaded(product: CatalogProduct): Promise<CatalogProduct> {
  if (product.id == null) {
    return product;
  }
  if (variantsHaveStableIds(product.variants)) {
    return product;
  }
  return await fetchCatalogProductById(product.id);
}

function normalizeProductListResponse(
  data: CatalogPaginatedResponse | CatalogProduct[],
): FetchCatalogProductsResult {
  if (Array.isArray(data)) {
    return {
      count: data.length,
      next: null,
      previous: null,
      results: data,
    };
  }

  return {
    count: data.count,
    next: data.next,
    previous: data.previous,
    results: data.results,
  };
}

function buildSlugCandidates(raw: string): string[] {
  const decoded = decodeURIComponent(raw);
  const normalized = decoded
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-");

  return Array.from(new Set([raw, decoded, normalized])).filter(Boolean);
}

function normalizeSlug(raw: string | null | undefined): string {
  return (raw ?? "")
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-");
}

/**
 * GET /catalog/products/ — phân trang, category, dress_style, giá, màu/size (ProductVariant).
 */
export async function fetchCatalogProducts(options: {
  page?: number;
  pageSize?: number;
  categorySlug?: string | null;
  dressStyleSlug?: string | null;
  onSale?: boolean;
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
  if (options.onSale) {
    params.on_sale = 1;
  }

  if (options.minPrice !== undefined && options.minPrice > 0) {
    params.min_price = options.minPrice;
  }
  if (
    options.maxPrice !== undefined &&
    options.maxPrice > 0 &&
    options.maxPrice < CATALOG_PRICE_SLIDER_MAX
  ) {
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

  const { data } = await api.get<CatalogPaginatedResponse | CatalogProduct[]>(CATALOG_PRODUCTS, {
    params,
  });

  return normalizeProductListResponse(data);
}

/**
 * GET /catalog/dress-styles/ — danh sách Category dùng cho "Dress Style".
 */
export async function fetchDressStyles(): Promise<CatalogCategory[]> {
  const { data } = await api.get<CatalogCategory[] | { results: CatalogCategory[] }>(CATALOG_DRESS_STYLES);

  if (Array.isArray(data)) {
    return data;
  }

  return data.results;
}

/**
 * GET /catalog/products/{id}/ — chi tiết sản phẩm; fallback theo slug nếu 404.
 */
export async function fetchCatalogProductDetail(productId: string | number): Promise<CatalogProduct> {
  const productKey = String(productId);
  const detailUrl = `${CATALOG_PRODUCTS}${productKey}/`;

  try {
    const { data } = await api.get<CatalogProduct>(detailUrl, { params: { _t: Date.now() } });
    return await ensureProductVariantsLoaded(data);
  } catch (error) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.status !== 404) {
      throw error;
    }

    const slugCandidates = buildSlugCandidates(productKey);
    for (const slugCandidate of slugCandidates) {
      const { data: listData } = await api.get<CatalogPaginatedResponse | CatalogProduct[]>(CATALOG_PRODUCTS, {
        params: {
          slug: slugCandidate,
          page_size: 1,
          _t: Date.now(),
        },
      });

      const normalized = normalizeProductListResponse(listData);
      const targetSlug = normalizeSlug(slugCandidate);
      const matched = normalized.results.find(
        (item) => normalizeSlug(item.slug) === targetSlug,
      );
      if (matched) {
        return await ensureProductVariantsLoaded(matched);
      }
    }

    const { data: broadListData } = await api.get<CatalogPaginatedResponse | CatalogProduct[]>(CATALOG_PRODUCTS, {
      params: {
        page_size: 100,
        _t: Date.now(),
      },
    });
    const broadNormalized = normalizeProductListResponse(broadListData);
    const requestedSlug = normalizeSlug(productKey);
    const broadMatched = broadNormalized.results.find(
      (item) => normalizeSlug(item.slug) === requestedSlug,
    );
    if (broadMatched) {
      return await ensureProductVariantsLoaded(broadMatched);
    }

    throw error;
  }
}
