import type { ProductCandidate } from "../types.js";
import type { Scorer, ScorerContext } from "./scorer.js";

export class CategoryScorer implements Scorer {
  readonly key = "category" as const;

  score(product: ProductCandidate, context: ScorerContext): number {
    if (context.similarTo) {
      return product.categoryId === context.similarTo.categoryId ? 1 : 0;
    }
    return context.profile.categories[product.categorySlug ?? product.categoryId] ?? 0;
  }
}
