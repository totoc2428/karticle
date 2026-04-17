import { WidgetApp } from "./widget/WidgetApp";

export default function App(): JSX.Element {
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
            amountCents: 250,
            currency: "EUR",
            buttonLabel: "Unlock with Karticle for €1.99",
          }}
        />
      </section>
    </main>
  );
}
