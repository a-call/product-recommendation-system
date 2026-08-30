"use client";

import type { ProductSummary } from "@prs/shared";
import { Button, Card } from "@prs/ui";
import Link from "next/link";
import { useEffect, useState } from "react";
import { apiGet, apiPost } from "../lib/api";
import { clearToken, getToken, trackEvent } from "../lib/tracking";
import { ProductCard } from "./ProductCard";

type CartDto = { items: Array<{ id: string; quantity: number; product: ProductSummary }>; total: number };
type HistoryDto = Array<{ eventId: string; eventType: string; createdAt: string; product: ProductSummary }>;
type UserDto = { id: string; email: string; name?: string; role: string };

export function AccountPage({ kind }: { kind: "favorites" | "cart" | "profile" | "history" }) {
  const [token, setLocalToken] = useState<string | null>(null);
  const [data, setData] = useState<unknown>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const current = getToken();
    setLocalToken(current);
    if (!current) {
      return;
    }
    const path =
      kind === "favorites"
        ? "/me/favorites"
        : kind === "cart"
          ? "/me/cart"
          : kind === "history"
            ? "/me/history"
            : "/auth/me";
    apiGet<unknown>(path, current).then(setData).catch((caught) => {
      setError(caught instanceof Error ? caught.message : "Failed to load");
    });
  }, [kind]);

  if (!token) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-10">
        <Card className="p-6">
          <h1 className="text-2xl font-semibold">Login required</h1>
          <p className="mt-2 text-zinc-600">Login to view {kind} and merge your anonymous browsing history.</p>
          <div className="mt-5 flex gap-3">
            <Link href="/login" className="rounded-md bg-zinc-950 px-4 py-2 text-sm font-medium text-white">Login</Link>
            <Link href="/register" className="rounded-md border border-zinc-200 px-4 py-2 text-sm font-medium">Register</Link>
          </div>
        </Card>
      </section>
    );
  }

  if (error) {
    return <div className="mx-auto max-w-7xl px-4 py-10 text-red-600">{error}</div>;
  }

  if (kind === "favorites") {
    const products = (data ?? []) as ProductSummary[];
    return (
      <section className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="mb-5 text-2xl font-semibold">Favorites</h1>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      </section>
    );
  }

  if (kind === "cart") {
    const cart = data as CartDto | null;
    async function checkout() {
      await apiPost("/me/checkout", {}, token);
      await trackEvent({ type: "PURCHASE", page: "cart" });
      location.reload();
    }
    return (
      <section className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-5 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Cart</h1>
          <Button onClick={checkout} disabled={!cart?.items.length}>Checkout</Button>
        </div>
        <div className="space-y-3">
          {cart?.items.map((item) => (
            <Card key={item.id} className="flex items-center gap-4 p-3">
              <img src={item.product.coverImage} alt="" className="h-20 w-24 rounded-md object-cover" />
              <div className="flex-1">
                <h2 className="font-medium">{item.product.name}</h2>
                <p className="text-sm text-zinc-500">Qty {item.quantity}</p>
              </div>
              <span className="font-semibold">${(item.product.price * item.quantity).toFixed(2)}</span>
            </Card>
          ))}
        </div>
        <p className="mt-4 text-right text-lg font-semibold">Total ${cart?.total.toFixed(2) ?? "0.00"}</p>
      </section>
    );
  }

  if (kind === "history") {
    const rows = (data ?? []) as HistoryDto;
    return (
      <section className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="mb-5 text-2xl font-semibold">Browsing History</h1>
        <div className="space-y-3">
          {rows.map((row) => (
            <Card key={row.eventId} className="flex items-center gap-4 p-3">
              <img src={row.product.coverImage} alt="" className="h-20 w-24 rounded-md object-cover" />
              <div>
                <h2 className="font-medium">{row.product.name}</h2>
                <p className="text-sm text-zinc-500">{row.eventType} / {new Date(row.createdAt).toLocaleString()}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>
    );
  }

  const user = data as UserDto | null;
  return (
    <section className="mx-auto max-w-3xl px-4 py-10">
      <Card className="p-6">
        <h1 className="text-2xl font-semibold">Profile</h1>
        <dl className="mt-5 grid gap-3 text-sm">
          <div><dt className="text-zinc-500">Email</dt><dd className="font-medium">{user?.email}</dd></div>
          <div><dt className="text-zinc-500">Role</dt><dd className="font-medium">{user?.role}</dd></div>
        </dl>
        <Button className="mt-6" variant="secondary" onClick={() => { clearToken(); location.href = "/"; }}>Logout</Button>
      </Card>
    </section>
  );
}
