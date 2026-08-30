import type { ProductCandidate } from "../types.js";
import type { Scorer, ScorerContext } from "./scorer.js";

export class PopularityScorer implements Scorer {
  readonly key = "popularity" as const;

  constructor(private readonly maxPopularity: number) {}

  score(product: ProductCandidate, _context: ScorerContext): number {
    if (this.maxPopularity <= 0) {
      return 0;
    }
    return Math.min(1, product.popularity / this.maxPopularity);
  }
}
