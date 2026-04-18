# Payment Flow (Widget + Popup)

## Sequence

1. Publisher page loads the widget iframe on `/widget/process/?<article_slug>`.
2. The widget receives the article slug from the query string and resolves article context.
3. User clicks the widget button.
4. On desktop, widget opens a popup on the same `/widget/process/?<article_slug>` route.
5. On mobile, or if popup is blocked, widget falls back to the in-iframe modal.
6. Payment UI calls `POST /v1/payments/start` with `article_url`, `article_hash`, `publisher_id`, and `article_id`.
7. Payment completion calls `POST /v1/payments/complete` and backend issues unlock token/cookie.
8. Widget emits `karticle:unlocked` to parent page and popup opener contexts.
9. Parent page reveals premium content (optionally verify via `POST /v1/unlocks/verify`).

## Notes

- Current backend storage is in-memory and must be replaced by a database.
- Webhook signature algorithm is a placeholder for MVP bootstrap.
- Unlock token uses HS256 and expires after configured TTL days.
- Browser cookie lifetime is configured via `KARTICLE_UNLOCK_COOKIE_MAX_AGE_DAYS`.
