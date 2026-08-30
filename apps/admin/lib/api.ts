export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export async function adminGet<T>(path: string, token: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store"
  });
  const payload = await response.json();
  if (payload.status === "error") {
    throw new Error(payload.error.message);
  }
  return payload.data as T;
}

export async function adminPatch<T>(path: string, body: unknown, token: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body)
  });
  const payload = await response.json();
  if (payload.status === "error") {
    throw new Error(payload.error.message);
  }
  return payload.data as T;
}
