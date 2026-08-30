import type { ProductCandidate } from "../types.js";
import type { Scorer, ScorerContext } from "./scorer.js";

export class PriceScorer implements Scorer {
  readonly key = "price" as const;

  score(product: ProductCandidate, context: ScorerContext): number {
    const range = context.similarTo
      ? { min: context.similarTo.price * 0.7, max: context.similarTo.price * 1.3 }
      : context.profile.priceRange;
    if (!range) {
      return 0.5;
    }
    if (product.price >= range.min && product.price <= range.max) {
      return 1;
    }
    const distance = product.price < range.min ? range.min - product.price : product.price - range.max;
    const width = Math.max(range.max - range.min, 1);
    return Math.max(0, 1 - distance / width);
  }
}
