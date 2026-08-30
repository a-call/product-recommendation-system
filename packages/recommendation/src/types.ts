import type { RecommendationStrategy, UserEventType } from "@prs/shared";

export type ProductCandidate = {
  id: string;
  name: string;
  categoryId: string;
  categorySlug?: string;
  brandId: string;
  brandSlug?: string;
  tags: string[];
  price: number;
  createdAt: Date;
  popularity: number;
};

export type BehaviorEvent = {
  eventType: UserEventType;
  productId?: string | null;
  categoryId?: string | null;
  categorySlug?: string | null;
  brandId?: string | null;
  brandSlug?: string | null;
  tags?: string[];
  price?: number | null;
  metadata?: Record<string, unknown>;
  createdAt: Date;
};

export type RecommendationImpressionSignal = {
  productId: string;
  strategy?: string;
  createdAt: Date;
};

export type ScoreWeights = {
  category: number;
  brand: number;
  tags: number;
  price: number;
  popularity: number;
  freshness: number;
  collaborative: number;
};

export type BehaviorWeights = Partial<Record<UserEventType, number>>;

export type RecommendationConfig = {
  behaviorWeights: BehaviorWeights;
  scoreWeights: ScoreWeights;
  decay: {
    halfLifeDays: number;
  };
  repeatExposurePenalty: {
    windowDays: number;
    penaltyPerImpression: number;
    maxPenalty: number;
  };
};

export type UserPreferenceProfile = {
  categories: Record<string, number>;
  brands: Record<string, number>;
  tags: Record<string, number>;
  priceRange: {
    min: number;
    max: number;
    average: number;
  } | null;
  interactedProductIds: Set<string>;
  recentProductIds: string[];
};

export type ScoreBreakdown = {
  category: number;
  brand: number;
  tags: number;
  price: number;
  popularity: number;
  freshness: number;
  collaborative: number;
  exposurePenalty: number;
};

export type RankedRecommendation = {
  product: ProductCandidate;
  score: number;
  reason: ScoreBreakdown;
  strategy: RecommendationStrategy;
  explanation: string;
};

export type RecommendInput = {
  candidates: ProductCandidate[];
  events: BehaviorEvent[];
  impressions?: RecommendationImpressionSignal[];
  strategy: RecommendationStrategy;
  limit?: number;
  excludeProductIds?: string[];
  now?: Date;
  similarTo?: ProductCandidate;
};
