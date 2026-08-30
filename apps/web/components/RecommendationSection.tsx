"use client";

import type { RecommendationStrategy } from "@prs/shared";
import { useEffect, useState } from "react";
import { apiGet, type RecommendationResponse } from "../lib/api";
import { getSessionId, getToken, getVisitorId } from "../lib/tracking";
import { ProductCard } from "./ProductCard";

export function RecommendationSection({
  title,
  strategy,
  productId,
  limit = 8
}: {
  title: string;
  strategy: RecommendationStrategy;
  productId?: string;
  limit?: number;
}) {
  const [items, setItems] = useState<RecommendationResponse>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "empty" | "error">("loading");

  useEffect(() => {
    const path =
      strategy === "similar"
        ? `/recommendations/similar/${productId}?limit=${limit}&visitorId=${getVisitorId()}&sessionId=${getSessionId()}`
        : `/recommendations/${strategy}?limit=${limit}&visitorId=${getVisitorId()}&sessionId=${getSessionId()}`;
    apiGet<RecommendationResponse>(path, getToken())
      .then((data) => {
        setItems(data);
        setStatus(data.length ? "ready" : "empty");
      })
      .catch(() => setStatus("error"));
  }, [limit, productId, strategy]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-4 flex items-end justify-between">
        <h2 className="text-xl font-semibold">{title}</h2>
        <span className="text-sm text-zinc-500">{strategy}</span>
      </div>
      {status === "loading" ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-72 animate-pulse rounded-lg bg-zinc-200" />
          ))}
        </div>
      ) : null}
      {status === "error" ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Recommendations are temporarily unavailable.
        </div>
      ) : null}
      {status === "empty" ? (
        <div className="rounded-lg border border-zinc-200 bg-white p-4 text-sm text-zinc-500">
          No recommendations yet.
        </div>
      ) : null}
      {status === "ready" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, index) => (
            <div key={item.recommendationId ?? item.product.id}>
              <ProductCard
                product={item.product}
                strategy={item.strategy}
                position={index + 1}
                {...(item.recommendationId ? { recommendationId: item.recommendationId } : {})}
              />
              <p className="mt-2 text-xs text-zinc-500">{item.explanation}</p>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
