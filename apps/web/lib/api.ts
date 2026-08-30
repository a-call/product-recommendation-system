import type { ApiResponse, ProductSummary, RecommendationResultDto } from "@prs/shared";

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export async function apiGet<T>(path: string, token?: string | null): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    cache: "no-store"
  });
  const payload = (await response.json()) as ApiResponse<T>;
  if (payload.status === "error") {
    throw new Error(payload.error.message);
  }
  return payload.data;
}

export async function apiPost<T>(
  path: string,
  body: unknown,
  token?: string | null,
  method = "POST",
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(body)
  });
  const payload = (await response.json()) as ApiResponse<T>;
  if (payload.status === "error") {
    throw new Error(payload.error.message);
  }
  return payload.data;
}

export type ProductListResponse = {
  items: ProductSummary[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
};

export type RecommendationResponse = RecommendationResultDto[];
