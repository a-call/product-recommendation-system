"use client";

import { Button, Card } from "@prs/ui";
import { FormEvent, useEffect, useState } from "react";
import { API_URL, adminGet, adminPatch } from "../lib/api";

type Resource = "dashboard" | "users" | "products" | "categories" | "brands" | "orders" | "events" | "recommendations" | "config" | "analytics";

function getToken() {
  return typeof localStorage === "undefined" ? null : localStorage.getItem("prs_admin_token");
}

export function AdminClient({ resource }: { resource: Resource }) {
  const [token, setToken] = useState<string | null>(null);
  const [data, setData] = useState<unknown>(null);
  const [configText, setConfigText] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const current = getToken();
    setToken(current);
    if (!current) {
      return;
    }
    load(current).catch((caught) => setError(caught instanceof Error ? caught.message : "Failed to load"));
  }, [resource]);

  async function load(currentToken = token) {
    if (!currentToken) {
      return;
    }
    const endpoint = endpointFor(resource);
    const next = await adminGet<unknown>(endpoint, currentToken);
    setData(next);
    setConfigText(resource === "config" ? JSON.stringify((next as { value?: unknown })?.value ?? {}, null, 2) : "");
  }

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: form.get("email"), password: form.get("password") })
    });
    const payload = await response.json();
    if (payload.status === "error") {
      setError(payload.error.message);
      return;
    }
    localStorage.setItem("prs_admin_token", payload.data.accessToken);
    setToken(payload.data.accessToken);
    await load(payload.data.accessToken);
  }

  async function saveConfig() {
    if (!token) {
      return;
    }
    const parsed = JSON.parse(configText) as Record<string, unknown>;
    setData(await adminPatch("/admin/recommendation-config", { value: parsed }, token));
  }

  if (!token) {
    return (
      <Card className="max-w-md p-6">
        <h1 className="text-2xl font-semibold">Admin Login</h1>
        <form onSubmit={login} className="mt-6 space-y-4">
          <input name="email" defaultValue="admin@example.com" className="h-11 w-full rounded-md border border-zinc-200 px-3" />
          <input name="password" type="password" defaultValue="Admin123456!" className="h-11 w-full rounded-md border border-zinc-200 px-3" />
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <Button className="w-full">Login</Button>
        </form>
      </Card>
    );
  }

  if (resource === "dashboard") {
    const dashboard = data as { metrics?: Record<string, number>; trends?: Record<string, Array<{ date: string; count: number }>> } | null;
    return (
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          {Object.entries(dashboard?.metrics ?? {}).map(([key, value]) => (
            <Card key={key} className="p-4">
              <p className="text-sm text-zinc-500">{key}</p>
              <p className="mt-2 text-2xl font-semibold">{typeof value === "number" && key.includes("Ctr") ? `${(value * 100).toFixed(2)}%` : value}</p>
            </Card>
          ))}
        </div>
        <pre className="mt-6 overflow-auto rounded-lg bg-zinc-950 p-4 text-xs text-zinc-50">{JSON.stringify(dashboard?.trends, null, 2)}</pre>
      </div>
    );
  }

  if (resource === "config") {
    return (
      <div>
        <h1 className="text-2xl font-semibold">Recommendation Config</h1>
        <textarea value={configText} onChange={(event) => setConfigText(event.target.value)} className="mt-6 h-[520px] w-full rounded-lg border border-zinc-200 p-4 font-mono text-sm" />
        <Button className="mt-4" onClick={saveConfig}>Save config</Button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold">{titleFor(resource)}</h1>
      <pre className="mt-6 overflow-auto rounded-lg bg-zinc-950 p-4 text-xs text-zinc-50">{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}

function endpointFor(resource: Resource) {
  const map: Record<Resource, string> = {
    dashboard: "/admin/dashboard",
    users: "/admin/users",
    products: "/admin/products",
    categories: "/admin/categories",
    brands: "/admin/brands",
    orders: "/admin/orders",
    events: "/admin/events",
    recommendations: "/admin/recommendation-analytics",
    config: "/admin/recommendation-config",
    analytics: "/admin/recommendation-analytics"
  };
  return map[resource];
}

function titleFor(resource: Resource) {
  return resource.replaceAll("-", " ").replace(/^\w/, (char) => char.toUpperCase());
}
