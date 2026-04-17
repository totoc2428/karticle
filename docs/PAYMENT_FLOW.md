# Payment Flow (Option B Widget)

## Sequence

1. Publisher page loads `karticle-widget.js`.
2. Widget renders unlock button in target container.
3. User clicks button and opens payment modal.
4. Widget calls `POST /v1/payments/create-intent`.
5. Payment provider checkout is initiated (sandbox in MVP).
6. Provider sends webhook to `POST /v1/payments/webhook`.
7. Backend validates webhook signature and marks payment as paid.
8. Backend creates an `unlock_token` and returns unlock outcome.
9. Publisher page verifies unlock token with `POST /v1/unlocks/verify`.
10. Publisher reveals premium article content.

## Notes

- Current backend storage is in-memory and must be replaced by a database.
- Webhook signature algorithm is a placeholder for MVP bootstrap.
- Unlock token uses HS256 and expires after configured TTL days.
