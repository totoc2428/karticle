# Publisher Integration Guide

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
  window.addEventListener("message", (event) => {
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

## 6. Troubleshooting

- The widget does not render: ensure the iframe points to the built widget bundle.
- The article does not unlock: verify the parent page listens for the `karticle:unlocked` message.
- API errors: verify CORS, API base URL, and iframe context parameters.
