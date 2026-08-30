import type { RecommendationConfig } from "./types.js";

export const defaultRecommendationConfig: RecommendationConfig = {
  behaviorWeights: {
    PRODUCT_IMPRESSION: 0.1,
    PRODUCT_VIEW: 1,
    PRODUCT_CLICK: 2,
    SEARCH: 2,
    FAVORITE: 5,
    ADD_TO_CART: 7,
    PURCHASE: 10,
    CATEGORY_VIEW: 1.5,
    RECOMMENDATION_CLICK: 2.5
  },
  scoreWeights: {
    category: 0.3,
    brand: 0.15,
    tags: 0.2,
    price: 0.1,
    popularity: 0.15,
    freshness: 0.1,
    collaborative: 0
  },
  decay: {
    halfLifeDays: 30
  },
  repeatExposurePenalty: {
    windowDays: 7,
    penaltyPerImpression: 0.12,
    maxPenalty: 0.6
  }
};

export function mergeRecommendationConfig(
  partial?: Partial<RecommendationConfig> | null,
): RecommendationConfig {
  if (!partial) {
    return defaultRecommendationConfig;
  }
  return {
    behaviorWeights: {
      ...defaultRecommendationConfig.behaviorWeights,
      ...partial.behaviorWeights
    },
    scoreWeights: {
      ...defaultRecommendationConfig.scoreWeights,
      ...partial.scoreWeights
    },
    decay: {
      ...defaultRecommendationConfig.decay,
      ...partial.decay
    },
    repeatExposurePenalty: {
      ...defaultRecommendationConfig.repeatExposurePenalty,
      ...partial.repeatExposurePenalty
    }
  };
}
