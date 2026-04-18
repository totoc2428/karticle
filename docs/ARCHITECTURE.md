# Architecture Overview

## Components

- Frontend widget (`frontend/`): embeddable React modal for single-article purchase.
- Backend API (`backend/`): FastAPI service for pricing, payment intent, webhook handling, unlock verification.
- Example publisher site (`client_exemple/`): static article page that embeds the widget in an iframe and reveals premium content after unlock.
- Payment provider: external provider (Stripe recommended) for checkout and settlement.
- Publisher website: hosts article, embeds widget script, unlocks article on success.

## Frontend routing (Vite SPA)

- `/`: Karticle public landing page.
- `/widget`: widget interface (WidgetApp core UI).
- `/widget/process/?<article_slug>`: process route used inside publisher iframe and popup flow.
- `/app`: publisher management entry page.
- `/app/login`: management login page (frontend form posting to `v1/app/login`).
- `/app/register`: management registration page (frontend form posting to `v1/app/register`).

## Iframe communication

- The parent page passes article context to the iframe using query parameters or `postMessage`.
- The iframe widget sends a `karticle:unlocked` message back to the parent when payment completes.
- The parent page is responsible for revealing premium content and can additionally validate the unlock token server-side.

## Security baseline

- CORS allow-list from environment.
- Signed unlock token with expiration.
- Webhook signature verification and duplicate event rejection.

## Known MVP constraints

- No persistent DB yet.
- No authentication layer for publishers yet.
- Placeholder checkout URL in service layer.
- Third-party cookie behavior may vary in iframes depending on browser policies.
