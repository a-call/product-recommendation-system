# Recommendation System

## Behavior Collection

The frontend calls one helper:

```ts
trackEvent({
  type: "PRODUCT_VIEW",
  productId: "..."
});
```

The helper adds `visitorId` and `sessionId`. Logged-in requests also include the JWT. The API persists events in `UserEvent`.

Tracked events:

- `PRODUCT_IMPRESSION`
- `PRODUCT_VIEW`
- `PRODUCT_CLICK`
- `SEARCH`
- `FAVORITE`
- `UNFAVORITE`
- `ADD_TO_CART`
- `REMOVE_FROM_CART`
- `PURCHASE`
- `CATEGORY_VIEW`
- `RECOMMENDATION_IMPRESSION`
- `RECOMMENDATION_CLICK`

## User Profile

`UserProfileBuilder` reads behavior events and creates normalized preference maps:

- `categories`
- `brands`
- `tags`
- `priceRange`
- `interactedProductIds`
- `recentProductIds`

## Behavior Weights

Default weights:

- `PRODUCT_IMPRESSION`: 0.1
- `PRODUCT_VIEW`: 1
- `PRODUCT_CLICK`: 2
- `SEARCH`: 2
- `FAVORITE`: 5
- `ADD_TO_CART`: 7
- `PURCHASE`: 10

Weights live in `packages/recommendation/src/config.ts` and can be overridden through `RecommendationConfig`.

## Time Decay

Each behavior score is multiplied by exponential decay:

```text
0.5 ^ (ageDays / halfLifeDays)
```

The default half-life is 30 days.

## Candidate Recall

The first version recalls active products from PostgreSQL. This is intentionally simple and deterministic. Redis can later cache popular candidates and profile snapshots.

## Scoring

The engine combines independent scorers:

- `CategoryScorer`
- `BrandScorer`
- `TagScorer`
- `PriceScorer`
- `PopularityScorer`
- `FreshnessScorer`
- `CollaborativeScorer`
- `ExposurePenaltyScorer`

Default weighted formula:

```text
score =
  category * 0.30 +
  brand * 0.15 +
  tags * 0.20 +
  price * 0.10 +
  popularity * 0.15 +
  freshness * 0.10 +
  collaborative * 0.00 -
  exposurePenalty
```

The API returns `reason` with each weighted contribution.

## Strategies

- Personalized: `GET /recommendations/for-you`
- Similar Products: `GET /recommendations/similar/:productId`
- Popular Products: `GET /recommendations/popular`
- Recently Viewed Related Products: `GET /recommendations/recent-related`
- You May Like/Home mix: `GET /recommendations/home`

## Cold Start

If no user or visitor behavior exists, the engine returns popular/fresh products instead of an empty list.

## De-duplication and Exposure

The ranker removes duplicate product IDs and excludes caller-provided IDs. It also lowers score for products repeatedly exposed in the last 7 days.

## Impressions, Clicks, and CTR

Recommendation endpoints save `RecommendationImpression`. Recommendation clicks are saved through `POST /events` with `RECOMMENDATION_CLICK`. Admin analytics calculates total CTR and strategy-level CTR.

## Future Upgrade Path

- Item-based collaborative filtering using co-view/co-buy matrices
- User-based collaborative filtering with nearest-neighbor user profiles
- Embeddings for semantic product and search-query matching
- Vector database for approximate nearest-neighbor retrieval
- Learning-to-rank model using click/purchase labels
- Two-tower retrieval model for large catalogs

The current version avoids LLMs and heavyweight ML because explainability, iteration speed, and data quality are higher-leverage at this stage.
