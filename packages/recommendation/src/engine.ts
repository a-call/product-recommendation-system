import type { RecommendationStrategy } from "@prs/shared";
import { mergeRecommendationConfig } from "./config.js";
import { RecommendationRanker } from "./ranker.js";
import { UserProfileBuilder } from "./profile-builder.js";
import type {
  ProductCandidate,
  RankedRecommendation,
  RecommendationConfig,
  RecommendInput
} from "./types.js";

function emptyProfile() {
  return {
    categories: {},
    brands: {},
    tags: {},
    priceRange: null,
    interactedProductIds: new Set<string>(),
    recentProductIds: []
  };
}

export class RecommendationEngine {
  private readonly config: RecommendationConfig;

  constructor(config?: Partial<RecommendationConfig> | null) {
    this.config = mergeRecommendationConfig(config);
  }

  recommend(input: RecommendInput): RankedRecommendation[] {
    const now = input.now ?? new Date();
    const limit = input.limit ?? 12;
    const maxPopularity = Math.max(1, ...input.candidates.map((item) => item.popularity));
    const profile = new UserProfileBuilder(this.config).build(input.events, now);
    const ranker = new RecommendationRanker(this.config, input.impressions, maxPopularity);

    if (input.strategy === "similar") {
      return ranker.rank({
        candidates: input.candidates,
        profile,
        strategy: "similar",
        limit,
        now,
        ...(input.excludeProductIds ? { excludeProductIds: input.excludeProductIds } : {}),
        ...(input.similarTo ? { similarTo: input.similarTo } : {})
      });
    }

    if (input.strategy === "popular" || input.events.length === 0) {
      return this.rankPopular(input.candidates, input.strategy, limit, input.excludeProductIds, now, ranker);
    }

    if (input.strategy === "recent-related") {
      const recentSet = new Set(profile.recentProductIds.slice(0, 4));
      const recentProducts = input.candidates.filter((candidate) => recentSet.has(candidate.id));
      const anchor = recentProducts[0];
      return ranker.rank({
        candidates: input.candidates,
        profile,
        strategy: "recent-related",
        limit,
        now,
        excludeProductIds: [...(input.excludeProductIds ?? []), ...recentSet],
        ...(anchor ? { similarTo: anchor } : {})
      });
    }

    return ranker.rank({
      candidates: input.candidates,
      profile,
      strategy: input.strategy,
      limit,
      now,
      ...(input.excludeProductIds ? { excludeProductIds: input.excludeProductIds } : {})
    });
  }

  buildProfile(input: Pick<RecommendInput, "events" | "now">) {
    return new UserProfileBuilder(this.config).build(input.events, input.now ?? new Date());
  }

  private rankPopular(
    candidates: ProductCandidate[],
    strategy: RecommendationStrategy,
    limit: number,
    excludeProductIds: string[] | undefined,
    now: Date,
    ranker: RecommendationRanker,
  ): RankedRecommendation[] {
    return ranker.rank({
      candidates,
      profile: emptyProfile(),
      strategy,
      limit,
      now,
      ...(excludeProductIds ? { excludeProductIds } : {})
    });
  }
}
