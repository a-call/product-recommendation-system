import type { ProductCandidate, UserPreferenceProfile } from "../types.js";

export type ScorerContext = {
  now: Date;
  profile: UserPreferenceProfile;
  similarTo?: ProductCandidate;
};

export interface Scorer {
  readonly key:
    | "category"
    | "brand"
    | "tags"
    | "price"
    | "popularity"
    | "freshness"
    | "collaborative"
    | "exposurePenalty";
  score(product: ProductCandidate, context: ScorerContext): number;
}
