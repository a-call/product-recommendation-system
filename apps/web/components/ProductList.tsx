"use client";

import type { ProductSummary } from "@prs/shared";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { apiGet, type ProductListResponse } from "../lib/api";
import { ProductCard } from "./ProductCard";

export function ProductList({ initialQuery = "" }: { initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery);
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiGet<ProductListResponse>(`/products?limit=24&q=${encodeURIComponent(query)}`)
      .then((data) => setProducts(data.items))
      .finally(() => setLoading(false));
  }, [query]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-semibold">Products</h1>
        <label className="flex h-11 w-full items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 md:w-96">
          <Search className="h-4 w-4 text-zinc-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="w-full bg-transparent text-sm outline-none"
            placeholder="Search products"
          />
        </label>
      </div>
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="h-80 animate-pulse rounded-lg bg-zinc-200" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
