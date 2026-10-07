export interface CreateOrderData {
  game_package_id: string;
  game_topup_type_id: string;
  detail?: string;
  note?: string;
  topup_data?: Record<string, string>;
  supplier_id: string;
}

export interface CreateOrderResponse {
  id: string;
  order_no: string;
  status: string;
  game_name: string;
  package_name: string;
  amount: number;
  customer_credit_before: number;
  customer_credit_after: number;
  created_at: string;
}

export async function createOrder(data: CreateOrderData): Promise<CreateOrderResponse> {
  const res = await fetch("/api/user/order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Failed to create order: ${res.status}`);
  }
  return res.json();
}
