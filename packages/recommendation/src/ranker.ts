import type { RecommendationStrategy } from "@prs/shared";
import { CollaborativeScorer } from "./scorers/collaborative-scorer.js";
import { CategoryScorer } from "./scorers/category-scorer.js";
import { BrandScorer } from "./scorers/brand-scorer.js";
import { TagScorer } from "./scorers/tag-scorer.js";
import { PriceScorer } from "./scorers/price-scorer.js";
import { PopularityScorer } from "./scorers/popularity-scorer.js";
import { FreshnessScorer } from "./scorers/freshness-scorer.js";
import { ExposurePenaltyScorer } from "./scorers/exposure-penalty-scorer.js";
import type { Scorer } from "./scorers/scorer.js";
import { explainRecommendation } from "./explanation.js";
import type {
  ProductCandidate,
  RankedRecommendation,
  RecommendationConfig,
  RecommendationImpressionSignal,
  ScoreBreakdown,
  UserPreferenceProfile
} from "./types.js";

export class RecommendationRanker {
  private readonly scorers: Scorer[];

  constructor(
    private readonly config: RecommendationConfig,
    impressions: RecommendationImpressionSignal[] = [],
    maxPopularity = 1,
  ) {
    this.scorers = [
      new CategoryScorer(),
      new BrandScorer(),
      new TagScorer(),
      new PriceScorer(),
      new PopularityScorer(maxPopularity),
      new FreshnessScorer(),
      new CollaborativeScorer(),
      new ExposurePenaltyScorer(impressions, config)
    ];
  }

  rank(params: {
    candidates: ProductCandidate[];
    profile: UserPreferenceProfile;
    strategy: RecommendationStrategy;
    limit: number;
    now: Date;
    excludeProductIds?: string[];
    similarTo?: ProductCandidate;
  }): RankedRecommendation[] {
    const excluded = new Set(params.excludeProductIds ?? []);
    if (params.similarTo) {
      excluded.add(params.similarTo.id);
    }

    const seen = new Set<string>();
    const ranked = params.candidates
      .filter((product) => {
        if (seen.has(product.id) || excluded.has(product.id)) {
          return false;
        }
        seen.add(product.id);
        return true;
      })
      .map((product) => this.scoreProduct(product, params))
      .sort((a, b) => b.score - a.score || b.product.popularity - a.product.popularity);

    return ranked.slice(0, params.limit);
  }

  private scoreProduct(
    product: ProductCandidate,
    params: {
      profile: UserPreferenceProfile;
      strategy: RecommendationStrategy;
      now: Date;
      similarTo?: ProductCandidate;
    },
  ): RankedRecommendation {
    const raw = Object.fromEntries(
      this.scorers.map((scorer) => [
        scorer.key,
        scorer.score(product, {
          now: params.now,
          profile: params.profile,
          ...(params.similarTo ? { similarTo: params.similarTo } : {})
        })
      ]),
    ) as ScoreBreakdown;

    const weighted =
      raw.category * this.config.scoreWeights.category +
      raw.brand * this.config.scoreWeights.brand +
      raw.tags * this.config.scoreWeights.tags +
      raw.price * this.config.scoreWeights.price +
      raw.popularity * this.config.scoreWeights.popularity +
      raw.freshness * this.config.scoreWeights.freshness +
      raw.collaborative * this.config.scoreWeights.collaborative -
      raw.exposurePenalty;

    const result = {
      product,
      score: Number(Math.max(0, weighted * 10).toFixed(4)),
      reason: {
        category: Number((raw.category * this.config.scoreWeights.category * 10).toFixed(4)),
        brand: Number((raw.brand * this.config.scoreWeights.brand * 10).toFixed(4)),
        tags: Number((raw.tags * this.config.scoreWeights.tags * 10).toFixed(4)),
        price: Number((raw.price * this.config.scoreWeights.price * 10).toFixed(4)),
        popularity: Number((raw.popularity * this.config.scoreWeights.popularity * 10).toFixed(4)),
        freshness: Number((raw.freshness * this.config.scoreWeights.freshness * 10).toFixed(4)),
        collaborative: Number(
          (raw.collaborative * this.config.scoreWeights.collaborative * 10).toFixed(4),
        ),
        exposurePenalty: Number((raw.exposurePenalty * 10).toFixed(4))
      },
      strategy: params.strategy
    };

    return {
      ...result,
      explanation: explainRecommendation(product, result, params.profile)
    };
  }
}
