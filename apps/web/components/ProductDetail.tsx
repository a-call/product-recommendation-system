"use client";

import { Button } from "@prs/ui";
import type { ProductSummary } from "@prs/shared";
import { useEffect, useState } from "react";
import { apiGet, apiPost } from "../lib/api";
import { getToken, trackEvent } from "../lib/tracking";
import { RecommendationSection } from "./RecommendationSection";

type ProductDetailDto = ProductSummary & {
  description: string;
  images: string[];
  attributes: Record<string, unknown>;
  stock: number;
};

export function ProductDetail({ slug }: { slug: string }) {
  const [product, setProduct] = useState<ProductDetailDto | null>(null);

  useEffect(() => {
    apiGet<ProductDetailDto>(`/products/${slug}`).then((data) => {
      setProduct(data);
      void trackEvent({
        type: "PRODUCT_VIEW",
        productId: data.id,
        categoryId: data.category.id,
        page: "product-detail",
        metadata: { duration: 0, source: "detail" }
      });
    });
  }, [slug]);

  if (!product) {
    return <div className="mx-auto max-w-7xl px-4 py-10 text-zinc-500">Loading product...</div>;
  }

  async function addToCart() {
    if (!product) {
      return;
    }
    await apiPost(`/me/cart/${product.id}`, { quantity: 1 }, getToken());
    await trackEvent({ type: "ADD_TO_CART", productId: product.id, page: "product-detail" });
  }

  async function favorite() {
    if (!product) {
      return;
    }
    await apiPost(`/me/favorites/${product.id}`, {}, getToken());
    await trackEvent({ type: "FAVORITE", productId: product.id, page: "product-detail" });
  }

  return (
    <>
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-2">
        <div className="space-y-3">
          <img
            src={product.coverImage}
            alt={product.name}
            className="aspect-[4/3] w-full rounded-lg object-cover"
          />
          <div className="grid grid-cols-2 gap-3">
            {product.images.slice(0, 2).map((image) => (
              <img key={image} src={image} alt="" className="aspect-[4/3] rounded-md object-cover" />
            ))}
          </div>
        </div>
        <div className="space-y-5">
          <div>
            <p className="text-sm text-zinc-500">{product.brand.name} / {product.category.name}</p>
            <h1 className="mt-2 text-3xl font-semibold">{product.name}</h1>
            <p className="mt-3 text-zinc-600">{product.description}</p>
          </div>
          <div className="text-3xl font-semibold">${product.price.toFixed(2)}</div>
          <div className="flex gap-3">
            <Button onClick={addToCart}>Add to cart</Button>
            <Button variant="secondary" onClick={favorite}>Favorite</Button>
          </div>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg border border-zinc-200 bg-white p-3">
              <dt className="text-zinc-500">Stock</dt>
              <dd className="font-medium">{product.stock}</dd>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-white p-3">
              <dt className="text-zinc-500">Tags</dt>
              <dd className="font-medium">{product.tags.join(", ")}</dd>
            </div>
          </dl>
        </div>
      </section>
      <RecommendationSection title="相似商品" strategy="similar" productId={product.id} />
    </>
  );
}
