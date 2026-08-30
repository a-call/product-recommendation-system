import type { ProductCandidate } from "../types.js";
import type { Scorer, ScorerContext } from "./scorer.js";

export class CollaborativeScorer implements Scorer {
  readonly key = "collaborative" as const;

  score(_product: ProductCandidate, _context: ScorerContext): number {
    return 0;
  }
}
