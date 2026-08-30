"use client";

import type { ProductSummary, RecommendationStrategy } from "@prs/shared";
import { Badge, Button, Card } from "@prs/ui";
import { Heart, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { apiPost } from "../lib/api";
import { getToken, trackEvent } from "../lib/tracking";

export function ProductCard({
  product,
  recommendationId,
  strategy,
  position
}: {
  product: ProductSummary;
  recommendationId?: string;
  strategy?: RecommendationStrategy;
  position?: number;
}) {
  async function trackClick() {
    await trackEvent({
      type: recommendationId ? "RECOMMENDATION_CLICK" : "PRODUCT_CLICK",
      productId: product.id,
      page: "product-card",
      ...(recommendationId ? { recommendationId } : {}),
      metadata: {
        ...(strategy ? { strategy } : {}),
        ...(position ? { position } : {})
      }
    });
  }

  async function favorite() {
    await apiPost(`/me/favorites/${product.id}`, {}, getToken());
    await trackEvent({ type: "FAVORITE", productId: product.id, page: "product-card" });
  }

  async function addToCart() {
    await apiPost(`/me/cart/${product.id}`, { quantity: 1 }, getToken());
    await trackEvent({ type: "ADD_TO_CART", productId: product.id, page: "product-card" });
  }

  return (
    <Card className="overflow-hidden">
      <Link href={`/products/${product.slug}`} onClick={trackClick} className="block">
        <div className="aspect-[4/3] overflow-hidden bg-zinc-100">
          <img
            src={product.coverImage}
            alt={product.name}
            className="h-full w-full object-cover transition duration-300 hover:scale-105"
          />
        </div>
      </Link>
      <div className="space-y-3 p-4">
        <div className="flex items-center justify-between gap-2">
          <Badge>{product.category.name}</Badge>
          <span className="text-xs text-zinc-500">{product.brand.name}</span>
        </div>
        <Link href={`/products/${product.slug}`} onClick={trackClick}>
          <h3 className="line-clamp-2 min-h-11 text-sm font-semibold text-zinc-950">
            {product.name}
          </h3>
        </Link>
        <p className="line-clamp-2 min-h-10 text-sm text-zinc-600">{product.shortDescription}</p>
        <div className="flex items-center justify-between">
          <div>
            <span className="font-semibold">${product.price.toFixed(2)}</span>
            {product.originalPrice ? (
              <span className="ml-2 text-xs text-zinc-400 line-through">
                ${product.originalPrice.toFixed(2)}
              </span>
            ) : null}
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" className="h-9 w-9 px-0" onClick={favorite} aria-label="Favorite">
              <Heart className="h-4 w-4" />
            </Button>
            <Button className="h-9 w-9 px-0" onClick={addToCart} aria-label="Add to cart">
              <ShoppingCart className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
