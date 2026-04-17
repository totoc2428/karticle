import { useEffect, useMemo, useState } from "react";

interface UnlockPayload {
  paymentId?: string;
  articleId?: string;
}

function buildWidgetFrameSrc(): string {
  const articleUrl = encodeURIComponent(window.location.href);
  const params = new URLSearchParams({
    karticle_publisher_id: "publisher-demo",
    karticle_article_id: "article-ai-2026",
    karticle_article_url: articleUrl,
    karticle_article_hash: "hash_article_ai_2026",
    karticle_amount_cents: "199",
    karticle_currency: "EUR",
  });

  return `/widget-frame.html?${params.toString()}`;
}

export function App(): JSX.Element {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const widgetFrameSrc = useMemo(() => buildWidgetFrameSrc(), []);

  useEffect(() => {
    function onMessage(event: MessageEvent): void {
      const data = event.data as
        | { type?: string; payload?: UnlockPayload }
        | undefined;
      if (!data || data.type !== "karticle:unlocked") {
        return;
      }

      setIsUnlocked(true);
      setPaymentId(data.payload?.paymentId ?? null);
    }

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  return (
    <div className="figaro-page">
      <header className="figaro-topbar">
        <div className="figaro-topbar-inner">
          <div className="figaro-logo">LE QUOTIDIEN</div>
          <nav className="figaro-nav">
            <a href="#">Politique</a>
            <a href="#">International</a>
            <a href="#">Economie</a>
            <a href="#">Culture</a>
            <a href="#">Tech</a>
          </nav>
        </div>
      </header>

      <main className="figaro-content-wrap">
        <article className="figaro-article">
          <p className="figaro-kicker">DECRYPTAGE</p>
          <h1 className="figaro-title">
            IA et presse ecrite: comment les redactions reconfigurent leur
            modele editorial
          </h1>
          <p className="figaro-subtitle">
            Enquetes, verification et montee des contenus premium: les journaux
            accelerent leur transformation tout en protegeant leur valeur.
          </p>

          <div className="figaro-meta">
            Par Redaction Economie · Mis a jour a 08:12
          </div>

          <section className="figaro-body">
            <p>
              Depuis deux ans, les grands quotidiens europeens adaptent leurs
              chaines de production pour integrer des outils d'intelligence
              artificielle. Les usages se concentrent sur l'aide a la recherche,
              la priorisation des sujets et l'optimisation de la diffusion.
            </p>
            <p>
              Cette evolution s'accompagne d'un renforcement des offres premium.
              Les lecteurs occasionnels peuvent desormais acheter un article a
              l'unite, sans abonnement, via un parcours de paiement tres court.
            </p>

            <aside
              className={`paywall-box ${isUnlocked ? "is-unlocked" : "is-locked"}`}
            >
              <div className="paywall-intro">
                <h2>{isUnlocked ? "Acces confirme" : "Contenu reserve"}</h2>
                <p>
                  {isUnlocked
                    ? "Le contenu premium est maintenant visible pour cet article."
                    : "Debloquez cet article via le module de paiement integre dans l'iframe."}
                </p>
                {paymentId ? (
                  <p className="paywall-payment-id">Paiement: {paymentId}</p>
                ) : null}
              </div>

              {!isUnlocked ? (
                <div className="paywall-iframe-shell">
                  <iframe
                    title="Karticle paywall iframe"
                    src={widgetFrameSrc}
                    loading="lazy"
                    referrerPolicy="strict-origin-when-cross-origin"
                  />
                </div>
              ) : (
                <div className="premium-revealed">
                  <p>
                    Les lecteurs qui paient a l'article deviennent un levier de
                    croissance pour les medias: ils monetisent les contenus de
                    reference sans imposer une friction d'abonnement immediate.
                  </p>
                  <p>
                    A moyen terme, ce modele hybride combine abonnement, achat
                    unitaire et offres partenaires pour stabiliser les revenus
                    editoriaux.
                  </p>
                </div>
              )}
            </aside>
          </section>
        </article>
      </main>
    </div>
  );
}
