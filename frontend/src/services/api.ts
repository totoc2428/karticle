const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

export interface ArticleContext {
  publisherId: string;
  articleId: string;
  articleUrl: string;
  articleHash: string;
  amountCents: number;
  currency: string;
  returnUrl?: string;
}

export interface StartPaymentSessionRequest extends ArticleContext {}

export interface StartPaymentSessionResponse {
  paymentId: string;
  checkoutUrl: string;
  spaUrl?: string | null;
  status: "pending" | "paid";
}

export interface CompletePaymentSessionRequest {
  paymentId: string;
  providerEventId: string;
  signature?: string | null;
}

export interface CompletePaymentSessionResponse {
  processed: boolean;
  paymentId: string;
  status: "pending" | "paid" | "failed";
  unlockCookieName?: string | null;
  unlockExpiresAt?: string | null;
  unlockToken?: string | null;
}

export interface VerifyUnlockRequest {
  articleHash: string;
  articleId: string;
  unlockCookieValue?: string | null;
}

export interface VerifyUnlockResponse {
  isUnlocked: boolean;
  cookieName: string;
  expiresAt?: string | null;
}

async function requestJson<T>(url: string, init: RequestInit): Promise<T> {
  const response = await fetch(url, init);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`${init.method ?? "GET"} ${url} failed (${response.status}): ${errorText}`);
  }

  return (await response.json()) as T;
}

export async function startPaymentSession(
  payload: StartPaymentSessionRequest,
): Promise<StartPaymentSessionResponse> {
  return requestJson<StartPaymentSessionResponse>(`${API_BASE_URL}/v1/payments/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function completePaymentSession(
  payload: CompletePaymentSessionRequest,
): Promise<CompletePaymentSessionResponse> {
  return requestJson<CompletePaymentSessionResponse>(`${API_BASE_URL}/v1/payments/complete`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function verifyUnlock(
  payload: VerifyUnlockRequest,
): Promise<VerifyUnlockResponse> {
  return requestJson<VerifyUnlockResponse>(`${API_BASE_URL}/v1/unlocks/verify`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function createPaymentIntent(
  payload: StartPaymentSessionRequest,
): Promise<StartPaymentSessionResponse> {
  return startPaymentSession(payload);
}
