import { WidgetApp } from "./widget/WidgetApp";

const DEFAULT_ARTICLE_SLUG =
  "ia-et-presse-ecrite-comment-les-redactions-reconfigurent-leur-modele-editorial-2026-04-18";
const PUBLISHER_ORIGIN =
  import.meta.env.VITE_CLIENT_ARTICLE_ORIGIN ?? "http://localhost:4173";

function simpleHash(value: string): string {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return `hash_${Math.abs(hash).toString(16)}`;
}

export default function App(): JSX.Element {
  const pathname = window.location.pathname;
  const isWidgetRoute = pathname.startsWith("/widget");

  const rawQuery = window.location.search.startsWith("?")
    ? window.location.search.slice(1)
    : "";
  const decodedSlug = decodeURIComponent(rawQuery || DEFAULT_ARTICLE_SLUG)
    .replace(/^\/+/, "")
    .trim();
  const articleSlug = decodedSlug || DEFAULT_ARTICLE_SLUG;
  const articleUrlFromSlug = new URL(
    `/${articleSlug}`,
    PUBLISHER_ORIGIN,
  ).toString();

  const articleUrl =
    isWidgetRoute && document.referrer
      ? document.referrer
      : isWidgetRoute
        ? articleUrlFromSlug
        : window.location.href;
  const articleHash = simpleHash(articleUrl);

  if (isWidgetRoute) {
    return (
      <main className="karticle-page">
        <section className="karticle-card">
          <WidgetApp
            config={{
              publisherId: "publisher-demo",
              articleId: articleSlug,
              articleUrl,
              articleHash,
              amountCents: 250,
              currency: "EUR",
              buttonLabel: "Unlock with Karticle for €1.99",
            }}
          />
        </section>
      </main>
    );
  }

  return (
    <main className="karticle-page">
      <section className="karticle-card">
        <header className="karticle-card-header">
          <img
            className="karticle-logo"
            src="https://api.dicebear.com/9.x/shapes/svg?seed=karticle"
            alt="Karticle icon"
            width={44}
            height={44}
          />
          <h1>Karticle</h1>
        </header>

        <p>You don&apos;t want to sucribe ? Just pay for this article.</p>

        <WidgetApp
          config={{
            publisherId: "publisher-demo",
            articleId: "article-001",
            articleUrl,
            articleHash,
            amountCents: 250,
            currency: "EUR",
            buttonLabel: "Unlock with Karticle for €1.99",
          }}
        />
      </section>
    </main>
  );
}
