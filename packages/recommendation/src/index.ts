export { RecommendationEngine } from "./engine.js";
export { RecommendationRanker } from "./ranker.js";
export { UserProfileBuilder } from "./profile-builder.js";
export { defaultRecommendationConfig, mergeRecommendationConfig } from "./config.js";
export type {
  BehaviorEvent,
  ProductCandidate,
  RankedRecommendation,
  RecommendationConfig,
  RecommendationImpressionSignal,
  ScoreBreakdown,
  UserPreferenceProfile,
  RecommendInput
} from "./types.js";
