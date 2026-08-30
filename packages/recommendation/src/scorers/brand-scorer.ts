import type { ProductCandidate } from "../types.js";
import type { Scorer, ScorerContext } from "./scorer.js";

export class BrandScorer implements Scorer {
  readonly key = "brand" as const;

  score(product: ProductCandidate, context: ScorerContext): number {
    if (context.similarTo) {
      return product.brandId === context.similarTo.brandId ? 1 : 0;
    }
    return context.profile.brands[product.brandSlug ?? product.brandId] ?? 0;
  }
}
