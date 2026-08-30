import type { ProductCandidate, RankedRecommendation, UserPreferenceProfile } from "./types.js";

export function explainRecommendation(
  product: ProductCandidate,
  ranked: Omit<RankedRecommendation, "explanation">,
  profile: UserPreferenceProfile,
): string {
  if (ranked.strategy === "popular") {
    return "热门商品";
  }
  if (ranked.strategy === "similar") {
    return "与你正在查看的商品相似";
  }
  const categoryKey = product.categorySlug ?? product.categoryId;
  if ((profile.categories[categoryKey] ?? 0) > 0.4) {
    return "因为你最近对这个分类感兴趣";
  }
  const bestTag = product.tags.find((tag) => (profile.tags[tag] ?? 0) > 0.4);
  if (bestTag) {
    return `因为你喜欢 ${bestTag} 相关商品`;
  }
  return "根据你的近期行为和热门趋势推荐";
}
