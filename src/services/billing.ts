import api from "./api";

export type CheckoutSessionResponse = {
  session_id: string;
  checkout_url: string;
  customer_id?: string;
  payment_status?: string | null;
  mode?: string;
};

export type CheckoutSessionPayload = {
  plan_slug?: string;
  success_url?: string;
  cancel_url?: string;
  coupon?: string;
  promotion_code?: string;
};

export const startCheckoutSession = async (
  payload: CheckoutSessionPayload = {},
) => {
  const response = await api.post<CheckoutSessionResponse>(
    "/api/billing/checkout/",
    payload,
  );
  return response.data;
};

export const fetchBillingPlans = async () => {
  const response = await api.get("/api/billing/plans/");
  return response.data;
};
