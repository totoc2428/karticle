# Publisher Integration Guide

## Local dev topology (Karticle monorepo)

In local development, the recommended split is:

- parent article page (`client_exemple`) on `http://localhost:4173`
- widget iframe host page (`frontend`) on `http://localhost:5183/widget-frame.html`

This means the integration runs cross-origin in dev (`4173 -> 5183`) and should validate `event.origin` when receiving messages.

## 1. Embed the widget in an iframe

The recommended integration is a dedicated iframe hosted in the publisher paywall area.

```html
<iframe
  title="Karticle widget"
  src="https://cdn.example.com/karticle/widget-frame.html?karticle_publisher_id=publisher-123&karticle_article_id=article-456&karticle_article_url=https%3A%2F%2Fpublisher.example%2Fnews%2Farticle-456&karticle_article_hash=hash_article_456&karticle_amount_cents=250&karticle_currency=EUR"
></iframe>
```

The widget reads its context from:

1. query parameters,
2. `postMessage`,
3. `document.referrer` as fallback.

## 2. Add a locked premium container

```html
<div data-premium-content class="is-locked">
  <p>Premium article content goes here.</p>
</div>
```

## 3. Listen for unlock events from the iframe

```html
<script>
  const WIDGET_ORIGIN = "https://cdn.example.com";

  window.addEventListener("message", (event) => {
    if (event.origin !== WIDGET_ORIGIN) {
      return;
    }

    if (!event.data || event.data.type !== "karticle:unlocked") {
      return;
    }

    console.log("Unlocked article", event.data.payload);
    document
      .querySelector("[data-premium-content]")
      ?.classList.remove("is-locked");
  });
</script>
```

## 4. Verify unlock token server-side

For production, verify the unlock cookie/token on your backend before exposing premium content.

## 5. Example site

See `client_exemple/` for a full static example article page with a paywall iframe.

Its iframe target is the widget host page served by `frontend`:

- `http://localhost:5183/widget-frame.html`

## 6. Troubleshooting

- The widget does not render: ensure the iframe points to the widget host page (`widget-frame.html`) served by your widget app origin.
- The article does not unlock: verify the parent page listens for the `karticle:unlocked` message.
- The article still does not unlock in dev: verify `event.origin` exactly matches your widget origin (`http://localhost:5183` by default).
- API errors: verify CORS, API base URL, and iframe context parameters.
