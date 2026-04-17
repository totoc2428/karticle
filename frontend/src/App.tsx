import { WidgetApp } from "./widget/WidgetApp";

function simpleHash(value: string): string {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return `hash_${Math.abs(hash).toString(16)}`;
}

export default function App(): JSX.Element {
  const articleUrl = window.location.href;
  const articleHash = simpleHash(articleUrl);

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
