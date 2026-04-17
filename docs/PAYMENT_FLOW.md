# Payment Flow (Option B Widget)

## Sequence

1. Publisher page loads the widget iframe.
2. The iframe receives the article context through query params, `postMessage`, or referrer fallback.
3. Widget renders unlock button and opens the payment modal.
4. Widget calls `POST /v1/payments/start` with `article_url`, `article_hash`, `publisher_id`, and `article_id`.
5. Payment is completed in the iframe SPA.
6. Widget calls `POST /v1/payments/complete` and the backend issues a long-lived unlock cookie/token.
7. Widget emits a `karticle:unlocked` message to the parent page.
8. Parent page verifies or trusts the unlock state and reveals premium article content.
9. Optional server-side verification can call `POST /v1/unlocks/verify`.

## Notes

- Current backend storage is in-memory and must be replaced by a database.
- Webhook signature algorithm is a placeholder for MVP bootstrap.
- Unlock token uses HS256 and expires after configured TTL days.
- Browser cookie lifetime is configured via `KARTICLE_UNLOCK_COOKIE_MAX_AGE_DAYS`.
