# client_exemple

Example publisher site showing a locked article with a paywall widget embedded in an iframe.

## Files

- `index.html`: article page with premium content blocked behind the widget iframe.
- `widget-frame.html`: iframe host page that loads the Karticle widget bundle.
- `styles.css`: visual styling for the article and the paywall section.

## How it works

1. The article page loads the widget inside an iframe.
2. The iframe receives the article context via query parameters.
3. The widget posts a `karticle:unlocked` message to the parent page on success.
4. The parent page removes the locked state and reveals the premium content.

## Local usage

1. Build the widget bundle:
   ```bash
   npm run build:widget
   ```
2. Serve the repository with a static server so the HTML files can resolve relative paths.
3. Open `client_exemple/index.html` in the browser.

## Notes

- This is a demo site only.
- In a production site, the parent page should validate the unlock cookie/token server-side before exposing premium content.
