import { normalizeScores, timeDecay } from "./decay.js";
import type {
  BehaviorEvent,
  RecommendationConfig,
  UserPreferenceProfile
} from "./types.js";

function addScore(scores: Record<string, number>, key: string | null | undefined, amount: number) {
  if (!key) {
    return;
  }
  scores[key] = (scores[key] ?? 0) + amount;
}

export class UserProfileBuilder {
  constructor(private readonly config: RecommendationConfig) {}

  build(events: BehaviorEvent[], now = new Date()): UserPreferenceProfile {
    const categories: Record<string, number> = {};
    const brands: Record<string, number> = {};
    const tags: Record<string, number> = {};
    const prices: Array<{ price: number; weight: number }> = [];
    const interactedProductIds = new Set<string>();
    const recentProductIds: string[] = [];

    const orderedEvents = [...events].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    for (const event of orderedEvents) {
      const baseWeight = this.config.behaviorWeights[event.eventType] ?? 0;
      if (baseWeight <= 0) {
        continue;
      }
      const weighted = baseWeight * timeDecay(event.createdAt, now, this.config.decay.halfLifeDays);

      addScore(categories, event.categorySlug ?? event.categoryId, weighted);
      addScore(brands, event.brandSlug ?? event.brandId, weighted);
      for (const tag of event.tags ?? []) {
        addScore(tags, tag, weighted);
      }
      if (typeof event.price === "number" && Number.isFinite(event.price)) {
        prices.push({ price: event.price, weight: weighted });
      }
      if (event.productId) {
        interactedProductIds.add(event.productId);
        if (!recentProductIds.includes(event.productId)) {
          recentProductIds.push(event.productId);
        }
      }
    }

    const weightTotal = prices.reduce((sum, item) => sum + item.weight, 0);
    const weightedAverage =
      weightTotal > 0
        ? prices.reduce((sum, item) => sum + item.price * item.weight, 0) / weightTotal
        : null;
    const priceRange =
      weightedAverage === null
        ? null
        : {
            min: Math.max(0, weightedAverage * 0.65),
            max: weightedAverage * 1.45,
            average: weightedAverage
          };

    return {
      categories: normalizeScores(categories),
      brands: normalizeScores(brands),
      tags: normalizeScores(tags),
      priceRange,
      interactedProductIds,
      recentProductIds: recentProductIds.slice(0, 12)
    };
  }
}
