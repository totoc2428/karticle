# Publisher Integration Guide

## 1. Include the widget bundle

```html
<script src="https://cdn.example.com/karticle-widget.js" defer></script>
```

## 2. Add a container where the button should appear

```html
<div
  id="karticle-paywall-slot"
  data-karticle-widget
  data-karticle-publisher-id="publisher-123"
  data-karticle-article-id="article-456"
  data-karticle-amount-cents="250"
  data-karticle-currency="EUR"
  data-karticle-button-label="Unlock this article for 2.50 EUR"
></div>
```

## 3. Listen for unlock event

```html
<script>
  window.addEventListener("karticle:unlocked", async (event) => {
    const { articleId, paymentId } = event.detail;
    console.log("Unlocked", articleId, paymentId);
    // Replace this by your own content-unlock implementation.
    document
      .querySelector("[data-premium-content]")
      ?.classList.remove("is-locked");
  });
</script>
```

## 4. Verify unlock token server-side

For production, verify unlock tokens on your backend before exposing premium content.

## 5. Troubleshooting

- Button does not appear: check script URL and container attributes.
- API errors: verify CORS and API base URL.
- Token rejected: ensure same `article_id` and valid token TTL.
