# Architecture Overview

## Components

- Frontend widget (`frontend/`): embeddable React modal for single-article purchase.
- Backend API (`backend/`): FastAPI service for pricing, payment intent, webhook handling, unlock verification.
- Payment provider: external provider (Stripe recommended) for checkout and settlement.
- Publisher website: hosts article, embeds widget script, unlocks article on success.

## Security baseline

- CORS allow-list from environment.
- Signed unlock token with expiration.
- Webhook signature verification and duplicate event rejection.

## Known MVP constraints

- No persistent DB yet.
- No authentication layer for publishers yet.
- Placeholder checkout URL in service layer.
