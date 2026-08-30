import { timeDecay } from "../decay.js";
import type { ProductCandidate } from "../types.js";
import type { Scorer, ScorerContext } from "./scorer.js";

export class FreshnessScorer implements Scorer {
  readonly key = "freshness" as const;

  score(product: ProductCandidate, context: ScorerContext): number {
    return timeDecay(product.createdAt, context.now, 45);
  }
}
