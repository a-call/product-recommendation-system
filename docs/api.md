# API

All endpoints return the shared response convention:

```json
{ "status": "success", "data": {} }
```

Errors return:

```json
{ "status": "error", "error": { "code": "BAD_REQUEST", "message": "..." } }
```

## Auth

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/me`
- `PATCH /auth/me`

Login/register accepts optional `visitorId` to merge anonymous behavior into the account.

## Catalog

- `GET /products`
- `GET /products/:slug`
- `GET /categories`
- `GET /brands`

`GET /products` supports `page`, `limit`, `q`, `category`, `brand`, `minPrice`, `maxPrice`, and `sort`.

## User

- `GET /me/favorites`
- `POST /me/favorites/:productId`
- `DELETE /me/favorites/:productId`
- `GET /me/cart`
- `POST /me/cart/:productId`
- `DELETE /me/cart/:productId`
- `POST /me/checkout`
- `GET /me/history`

## Events

- `POST /events`

Supports the unified event types defined in `packages/shared/src/index.ts`.

## Recommendations

- `GET /recommendations/home`
- `GET /recommendations/for-you`
- `GET /recommendations/similar/:productId`
- `GET /recommendations/popular`
- `GET /recommendations/recent-related`

Query parameters:

- `limit`
- `visitorId`
- `sessionId`
- `excludeProductIds`

## Admin

Admin endpoints require `ADMIN` or `SUPER_ADMIN`:

- `GET /admin/dashboard`
- `GET /admin/users`
- `GET /admin/users/:userId`
- `GET /admin/products`
- `POST /admin/products`
- `PATCH /admin/products/:productId`
- `DELETE /admin/products/:productId`
- `GET /admin/categories`
- `POST /admin/categories`
- `GET /admin/brands`
- `POST /admin/brands`
- `GET /admin/orders`
- `GET /admin/events`
- `GET /admin/recommendation-config`
- `PATCH /admin/recommendation-config`
- `GET /admin/recommendation-analytics`
