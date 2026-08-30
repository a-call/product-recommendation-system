import type {
  ProductCandidate,
  RecommendationConfig,
  RecommendationImpressionSignal
} from "../types.js";
import type { Scorer, ScorerContext } from "./scorer.js";

export class ExposurePenaltyScorer implements Scorer {
  readonly key = "exposurePenalty" as const;

  constructor(
    private readonly impressions: RecommendationImpressionSignal[],
    private readonly config: RecommendationConfig,
  ) {}

  score(product: ProductCandidate, context: ScorerContext): number {
    const windowMs = this.config.repeatExposurePenalty.windowDays * 86_400_000;
    const count = this.impressions.filter(
      (impression) =>
        impression.productId === product.id &&
        context.now.getTime() - impression.createdAt.getTime() <= windowMs,
    ).length;
    return Math.min(
      this.config.repeatExposurePenalty.maxPenalty,
      count * this.config.repeatExposurePenalty.penaltyPerImpression,
    );
  }
}
