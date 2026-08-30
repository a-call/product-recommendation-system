export const API_SUCCESS = "success" as const;
export const API_ERROR = "error" as const;

export type ApiSuccess<T> = {
  status: typeof API_SUCCESS;
  data: T;
  meta?: Record<string, unknown>;
};

export type ApiError = {
  status: typeof API_ERROR;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type Paginated<T> = {
  items: T[];
  pagination: PaginationMeta;
};

export const userEventTypes = [
  "PRODUCT_IMPRESSION",
  "PRODUCT_VIEW",
  "PRODUCT_CLICK",
  "SEARCH",
  "FAVORITE",
  "UNFAVORITE",
  "ADD_TO_CART",
  "REMOVE_FROM_CART",
  "PURCHASE",
  "CATEGORY_VIEW",
  "RECOMMENDATION_IMPRESSION",
  "RECOMMENDATION_CLICK"
] as const;

export type UserEventType = (typeof userEventTypes)[number];

export const recommendationStrategies = [
  "home",
  "for-you",
  "similar",
  "popular",
  "recent-related"
] as const;

export type RecommendationStrategy = (typeof recommendationStrategies)[number];

export type TrackEventInput = {
  type: UserEventType;
  productId?: string;
  categoryId?: string;
  recommendationId?: string;
  page?: string;
  source?: string;
  metadata?: Record<string, unknown>;
};

export type ProductSummary = {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  price: number;
  originalPrice?: number | null;
  currency: string;
  coverImage: string;
  category: { id: string; name: string; slug: string };
  brand: { id: string; name: string; slug: string };
  tags: string[];
};

export type RecommendationReason = Record<string, number>;

export type RecommendationResultDto = {
  recommendationId?: string;
  product: ProductSummary;
  score: number;
  reason: RecommendationReason;
  strategy: RecommendationStrategy;
  explanation: string;
};
