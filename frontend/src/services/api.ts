const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

export interface CreatePaymentIntentRequest {
  publisherId: string;
  articleId: string;
  amountCents: number;
  currency: string;
  returnUrl?: string;
}

export interface CreatePaymentIntentResponse {
  paymentId: string;
  checkoutUrl: string;
  status: "pending" | "paid";
}

export async function createPaymentIntent(
  payload: CreatePaymentIntentRequest,
): Promise<CreatePaymentIntentResponse> {
  const response = await fetch(`${API_BASE_URL}/v1/payments/create-intent`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Payment intent failed (${response.status}): ${errorText}`);
  }

  return (await response.json()) as CreatePaymentIntentResponse;
}
