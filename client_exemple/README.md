# client_exemple

Example publisher site implemented with React + Vite, showing a locked article with a paywall widget embedded in an iframe.

## Files

- `src/App.tsx`: index page, article page, and paywall iframe behavior.
- `src/styles.css`: visual styling for the article and paywall section.

## How it works

1. The app serves a journal index page on `/`.
2. The premium article page is available on `/ia-et-presse-ecrite-comment-les-redactions-reconfigurent-leur-modele-editorial-2026-04-18`.
3. The article page loads the widget inside an iframe from `http://localhost:5183/widget-frame.html`.
4. The iframe sends only one query parameter: `karticle_article_url`.
5. The widget posts a `karticle:unlocked` message to the parent page on success.
6. The parent page removes the locked state and reveals the premium content.

## Local usage

1. Start everything from the repository root:
   ```bash
   npm run dev:client_exemple
   ```
   or from inside `client_exemple/`:
   ```bash
   npm run dev:client_exemple
   ```
2. Open `http://localhost:4173` in the browser.
3. Open the article from the index or navigate directly to `http://localhost:4173/ia-et-presse-ecrite-comment-les-redactions-reconfigurent-leur-modele-editorial-2026-04-18`.

The widget iframe loads from `http://localhost:5183` while the article app runs on `http://localhost:4173`.

If one of those ports is already running, the launcher reuses the existing server instead of failing.

## Notes

- This is a demo site only.
- In a production site, the parent page should validate the unlock cookie/token server-side before exposing premium content.
