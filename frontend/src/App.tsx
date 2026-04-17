import { WidgetApp } from "./widget/WidgetApp";

export default function App(): JSX.Element {
  return (
    <main style={{ padding: "2rem", maxWidth: "860px", margin: "0 auto" }}>
      <h1>Karticle Widget Demo</h1>
      <p>
        Use this page to validate the embedded single-article unlock journey.
      </p>
      <WidgetApp
        config={{
          publisherId: "publisher-demo",
          articleId: "article-001",
          amountCents: 250,
          currency: "EUR",
        }}
      />
    </main>
  );
}
