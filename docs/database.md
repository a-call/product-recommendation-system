# Database

## Core Models

- `User`: account, role, bcrypt password hash, profile, events, favorites, cart, orders, recommendations.
- `UserProfile`: computed interest profile for categories, brands, tags, and price range.
- `Product`: catalog entity with category, brand, price, images, tags, attributes, stock, and status.
- `Category`, `Brand`, `ProductTag`: product taxonomy and feature signals.
- `Favorite`, `Cart`, `CartItem`, `Order`, `OrderItem`: commerce state and purchase signal.
- `UserEvent`: unified event stream for browsing, search, favorites, cart, purchase, and recommendation interactions.
- `SearchHistory`: query-specific read model.
- `RecommendationImpression`: records product exposure by strategy, position, score, and reason.
- `RecommendationClick`: records clicked recommendation impressions.
- `RecommendationConfig`: database-editable behavior and scorer weights.

## Important Indexes

- `UserEvent`: `userId/createdAt`, `visitorId/createdAt`, `sessionId/createdAt`, `productId/eventType/createdAt`, `eventType/createdAt`, `recommendationId`.
- `RecommendationImpression`: `userId/createdAt`, `visitorId/createdAt`, `productId/createdAt`, `strategy/createdAt`.
- `RecommendationClick`: `userId/createdAt`, `visitorId/createdAt`, `productId/createdAt`, `strategy/createdAt`.
- `Product`: `categoryId/status`, `brandId/status`, `price`, `status/createdAt`.

## Seed Data

The seed script creates:

- 6 categories
- 8 brands
- 72 products
- admin and sample user accounts
- realistic user events
- favorites, cart, one paid order
- recommendation impressions/clicks
- default recommendation config
