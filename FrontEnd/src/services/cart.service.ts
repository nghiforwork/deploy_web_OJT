import api from "@/utils/axios";
import { getAuthSession } from "@/services/authService";

export type CartItemDto = {
  id: number;
  product_id: number;
  product_variant_id: number | null;
  variant_color: string | null;
  variant_size: string | null;
  product_name: string;
  product_slug: string;
  product_image_url: string | null;
  unit_price: string;
  quantity: number;
  line_total: string;
};

export type CartDto = {
  id: number;
  user: number;
  subtotal_amount: string;
  discount_amount: string;
  shipping_amount: string;
  total_amount: string;
  updated_at: string;
  items: CartItemDto[];
};

/** Chỉ gắn header khi có token — tránh `Bearer ` rỗng khiến interceptor axios không ghi đè được. */
function buildAuthHeaders(): Record<string, string> | undefined {
  const token = getAuthSession()?.access?.trim();
  if (!token) return undefined;
  return { Authorization: `Bearer ${token}` };
}

export async function fetchMyCart(): Promise<CartDto> {
  const auth = buildAuthHeaders();
  const { data } = await api.get<CartDto>("cart/me/", {
    ...(auth ? { headers: auth } : {}),
    params: { _t: Date.now() },
  });
  return data;
}

export async function addCartItem(
  productId: number,
  quantity: number,
  productVariantId?: number | null,
): Promise<CartDto> {
  const body: Record<string, number> = { product_id: productId, quantity };
  const vid = productVariantId == null ? NaN : Math.floor(Number(productVariantId));
  if (Number.isFinite(vid) && vid > 0) {
    body.product_variant_id = vid;
  }
  const auth = buildAuthHeaders();
  const { data } = await api.post<CartDto>("cart/items/", body, {
    ...(auth ? { headers: auth } : {}),
  });
  return data;
}

export async function updateCartItem(itemId: number, quantity: number): Promise<CartDto> {
  const auth = buildAuthHeaders();
  const { data } = await api.patch<CartDto>(
    `cart/items/${itemId}/`,
    { quantity },
    { ...(auth ? { headers: auth } : {}) },
  );
  return data;
}

export async function deleteCartItem(itemId: number): Promise<CartDto> {
  const auth = buildAuthHeaders();
  const { data } = await api.delete<CartDto>(`cart/items/${itemId}/`, {
    ...(auth ? { headers: auth } : {}),
  });
  return data;
}
