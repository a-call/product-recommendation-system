import type { ProductCandidate } from "../types.js";
import type { Scorer, ScorerContext } from "./scorer.js";

export class TagScorer implements Scorer {
  readonly key = "tags" as const;

  score(product: ProductCandidate, context: ScorerContext): number {
    if (product.tags.length === 0) {
      return 0;
    }
    if (context.similarTo) {
      const overlap = product.tags.filter((tag) => context.similarTo?.tags.includes(tag)).length;
      return overlap / Math.max(product.tags.length, context.similarTo.tags.length, 1);
    }
    const sum = product.tags.reduce((total, tag) => total + (context.profile.tags[tag] ?? 0), 0);
    return sum / product.tags.length;
  }
}
