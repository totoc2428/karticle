# client_exemple

Example publisher site implemented with React + Vite, showing a locked article with a paywall widget embedded in an iframe.

## Files

- `src/App.tsx`: article page and paywall behavior.
- `src/styles.css`: visual styling for the article and paywall section.
- `public/widget-frame.html`: iframe host page that loads the Karticle widget app.

## How it works

1. The article page loads the widget inside an iframe.
2. The iframe receives the article context via query parameters.
3. The widget posts a `karticle:unlocked` message to the parent page on success.
4. The parent page removes the locked state and reveals the premium content.

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

The widget iframe loads from `http://localhost:5183` while the article app runs on `http://localhost:4173`.

If one of those ports is already running, the launcher reuses the existing server instead of failing.

## Notes

- This is a demo site only.
- In a production site, the parent page should validate the unlock cookie/token server-side before exposing premium content.
