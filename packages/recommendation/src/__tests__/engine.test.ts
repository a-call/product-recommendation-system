import { describe, expect, it } from "vitest";
import { RecommendationEngine } from "../engine.js";
import type { BehaviorEvent, ProductCandidate, RecommendationImpressionSignal } from "../types.js";

const now = new Date("2026-08-30T00:00:00Z");

function product(overrides: Partial<ProductCandidate>): ProductCandidate {
  return {
    id: overrides.id ?? crypto.randomUUID(),
    name: overrides.name ?? "Product",
    categoryId: overrides.categoryId ?? "keyboard",
    categorySlug: overrides.categorySlug ?? overrides.categoryId ?? "keyboard",
    brandId: overrides.brandId ?? "logitech",
    brandSlug: overrides.brandSlug ?? overrides.brandId ?? "logitech",
    tags: overrides.tags ?? ["wireless"],
    price: overrides.price ?? 100,
    popularity: overrides.popularity ?? 10,
    createdAt: overrides.createdAt ?? now,
  };
}

const candidates = [
  product({ id: "keyboard-1", categoryId: "keyboard", tags: ["mechanical", "wireless"], price: 120, popularity: 20 }),
  product({ id: "keyboard-2", categoryId: "keyboard", tags: ["mechanical"], price: 160, popularity: 12 }),
  product({ id: "phone-1", categoryId: "phone", brandId: "apple", tags: ["premium"], price: 850, popularity: 40 }),
  product({ id: "audio-1", categoryId: "audio", brandId: "sony", tags: ["wireless"], price: 240, popularity: 24 })
];

function event(overrides: Partial<BehaviorEvent>): BehaviorEvent {
  return {
    eventType: overrides.eventType ?? "PRODUCT_VIEW",
    productId: overrides.productId ?? "keyboard-1",
    categoryId: overrides.categoryId ?? "keyboard",
    categorySlug: overrides.categorySlug ?? overrides.categoryId ?? "keyboard",
    brandId: overrides.brandId ?? "logitech",
    brandSlug: overrides.brandSlug ?? overrides.brandId ?? "logitech",
    tags: overrides.tags ?? ["mechanical", "wireless"],
    price: overrides.price ?? 120,
    createdAt: overrides.createdAt ?? now
  };
}

describe("RecommendationEngine", () => {
  it("raises products from categories the user likes", () => {
    const engine = new RecommendationEngine();
    const results = engine.recommend({
      candidates,
      events: [event({ eventType: "PRODUCT_VIEW", categoryId: "keyboard" })],
      strategy: "for-you",
      now
    });

    expect(results[0]?.product.categoryId).toBe("keyboard");
  });

  it("weights favorites higher than views", () => {
    const engine = new RecommendationEngine();
    const results = engine.recommend({
      candidates,
      events: [
        event({ eventType: "PRODUCT_VIEW", categoryId: "phone", brandId: "apple", tags: ["premium"], price: 850 }),
        event({ eventType: "FAVORITE", categoryId: "keyboard", tags: ["mechanical"], price: 140 })
      ],
      strategy: "for-you",
      now
    });

    expect(results[0]?.product.categoryId).toBe("keyboard");
  });

  it("makes purchase behavior the strongest signal", () => {
    const engine = new RecommendationEngine();
    const profile = engine.buildProfile({
      events: [
        event({ eventType: "FAVORITE", categoryId: "phone", tags: ["premium"], price: 850 }),
        event({ eventType: "PURCHASE", categoryId: "audio", brandId: "sony", tags: ["wireless"], price: 240 })
      ],
      now
    });

    expect(profile.categories.audio).toBeGreaterThan(profile.categories.phone ?? 0);
  });

  it("decays older behavior", () => {
    const engine = new RecommendationEngine();
    const profile = engine.buildProfile({
      events: [
        event({ eventType: "PURCHASE", categoryId: "phone", price: 850, createdAt: new Date("2026-04-01T00:00:00Z") }),
        event({ eventType: "PRODUCT_VIEW", categoryId: "keyboard", price: 120, createdAt: now })
      ],
      now
    });

    expect(profile.categories.keyboard).toBeGreaterThan(profile.categories.phone ?? 0);
  });

  it("penalizes products already exposed many times", () => {
    const impressions: RecommendationImpressionSignal[] = Array.from({ length: 8 }, () => ({
      productId: "keyboard-1",
      strategy: "for-you",
      createdAt: now
    }));
    const engine = new RecommendationEngine();
    const results = engine.recommend({
      candidates,
      impressions,
      events: [event({ eventType: "PURCHASE", categoryId: "keyboard", tags: ["mechanical"] })],
      strategy: "for-you",
      now
    });

    expect(results[0]?.product.id).not.toBe("keyboard-1");
  });

  it("falls back to popular products without behavior", () => {
    const engine = new RecommendationEngine();
    const results = engine.recommend({ candidates, events: [], strategy: "for-you", now });

    expect(results[0]?.product.id).toBe("phone-1");
  });

  it("does not return current product for similar recommendations", () => {
    const engine = new RecommendationEngine();
    const results = engine.recommend({
      candidates,
      events: [event({})],
      strategy: "similar",
      similarTo: candidates[0]!,
      now
    });

    expect(results.map((item) => item.product.id)).not.toContain("keyboard-1");
  });

  it("does not return duplicate products", () => {
    const engine = new RecommendationEngine();
    const results = engine.recommend({
      candidates: [candidates[0]!, candidates[0]!, candidates[1]!],
      events: [event({})],
      strategy: "for-you",
      now
    });

    expect(new Set(results.map((item) => item.product.id)).size).toBe(results.length);
  });

  it("uses brand and tag contributions in the reason breakdown", () => {
    const engine = new RecommendationEngine();
    const results = engine.recommend({
      candidates,
      events: [
        event({
          eventType: "PURCHASE",
          categoryId: "audio",
          brandId: "sony",
          tags: ["wireless"],
          price: 240
        })
      ],
      strategy: "for-you",
      now
    });

    const audio = results.find((item) => item.product.id === "audio-1");
    expect(audio?.reason.brand).toBeGreaterThan(0);
    expect(audio?.reason.tags).toBeGreaterThan(0);
  });

  it("scores products in the preferred price range higher", () => {
    const engine = new RecommendationEngine();
    const results = engine.recommend({
      candidates,
      events: [event({ eventType: "PURCHASE", categoryId: "keyboard", price: 120 })],
      strategy: "for-you",
      now
    });
    const keyboard = results.find((item) => item.product.id === "keyboard-1");
    const phone = results.find((item) => item.product.id === "phone-1");

    expect(keyboard?.reason.price).toBeGreaterThan(phone?.reason.price ?? 0);
  });

  it("gives newer products a freshness contribution", () => {
    const fresh = product({ id: "fresh", createdAt: now, popularity: 1 });
    const old = product({ id: "old", createdAt: new Date("2025-01-01T00:00:00Z"), popularity: 1 });
    const engine = new RecommendationEngine();
    const results = engine.recommend({
      candidates: [old, fresh],
      events: [],
      strategy: "popular",
      now
    });
    const freshResult = results.find((item) => item.product.id === "fresh");
    const oldResult = results.find((item) => item.product.id === "old");

    expect(freshResult?.reason.freshness).toBeGreaterThan(oldResult?.reason.freshness ?? 0);
  });

  it("keeps collaborative scorer as a zero-weight placeholder", () => {
    const engine = new RecommendationEngine();
    const result = engine.recommend({
      candidates,
      events: [event({ eventType: "PURCHASE" })],
      strategy: "for-you",
      now
    })[0];

    expect(result?.reason.collaborative).toBe(0);
  });

  it("supports home and recent-related strategy branches", () => {
    const engine = new RecommendationEngine();
    const home = engine.recommend({
      candidates,
      events: [event({ eventType: "PRODUCT_VIEW", productId: "keyboard-1", categoryId: "keyboard" })],
      strategy: "home",
      now
    });
    const recentRelated = engine.recommend({
      candidates,
      events: [event({ eventType: "PRODUCT_VIEW", productId: "keyboard-1", categoryId: "keyboard" })],
      strategy: "recent-related",
      now
    });

    expect(home.length).toBeGreaterThan(0);
    expect(recentRelated.map((item) => item.product.id)).not.toContain("keyboard-1");
  });

  it("caps exposure penalty and ignores expired impressions", () => {
    const engine = new RecommendationEngine();
    const results = engine.recommend({
      candidates,
      events: [event({ eventType: "PURCHASE", categoryId: "keyboard", tags: ["mechanical"] })],
      impressions: [
        ...Array.from({ length: 20 }, () => ({ productId: "keyboard-1", createdAt: now })),
        { productId: "keyboard-2", createdAt: new Date("2026-01-01T00:00:00Z") }
      ],
      strategy: "for-you",
      now
    });
    const heavilyExposed = results.find((item) => item.product.id === "keyboard-1");
    const expiredExposure = results.find((item) => item.product.id === "keyboard-2");

    expect(heavilyExposed?.reason.exposurePenalty).toBe(6);
    expect(expiredExposure?.reason.exposurePenalty).toBe(0);
  });
});
