import api from "@/utils/axios";
import { getAuthSession } from "@/services/authService";

export type PaymentMethod = "card" | "cod" | "bank_transfer";

export type OrderItemDto = {
  id: number;
  product_id: number;
  product_variant_id: number | null;
  variant_color: string;
  variant_size: string;
  product_name: string;
  unit_price: string;
  quantity: number;
  line_total: string;
};

export type OrderListItemDto = {
  id: number;
  order_number: number;
  status: string;
  payment_method: PaymentMethod | string;
  total_amount: string;
  created_at: string;
  items_count: number;
};

export type OrderDetailDto = {
  id: number;
  order_number: number;
  status: string;
  payment_method: PaymentMethod | string;
  shipping_full_name: string;
  shipping_phone: string;
  shipping_address_line1: string;
  shipping_city: string;
  shipping_postal_code: string;
  subtotal_amount: string;
  discount_amount: string;
  shipping_amount: string;
  total_amount: string;
  created_at: string;
  items: OrderItemDto[];
};

export type CheckoutPayload = {
  payment_method: PaymentMethod;
  shipping_full_name: string;
  shipping_phone: string;
  shipping_address_line1: string;
  shipping_city: string;
  shipping_postal_code?: string;
};

function buildAuthHeaders() {
  const session = getAuthSession();
  return {
    Authorization: `Bearer ${session?.access ?? ""}`,
  };
}

export async function fetchMyOrders(): Promise<OrderListItemDto[]> {
  const { data } = await api.get<OrderListItemDto[]>("orders/", {
    headers: buildAuthHeaders(),
  });
  return data;
}

export async function fetchOrderDetail(orderId: number): Promise<OrderDetailDto> {
  const { data } = await api.get<OrderDetailDto>(`orders/${orderId}/`, {
    headers: buildAuthHeaders(),
  });
  return data;
}

export async function checkoutFromCart(payload: CheckoutPayload): Promise<OrderDetailDto> {
  const { data } = await api.post<OrderDetailDto>("orders/checkout/", payload, {
    headers: buildAuthHeaders(),
  });
  return data;
}

export type CancelOrderReason =
  | "changed_mind"
  | "wrong_items"
  | "found_better_price"
  | "delivery_too_slow"
  | "other";

export async function cancelOrder(orderId: number, payload: { reason: CancelOrderReason; note?: string }): Promise<void> {
  await api.post(`orders/${orderId}/cancel/`, payload, {
    headers: buildAuthHeaders(),
  });
}
