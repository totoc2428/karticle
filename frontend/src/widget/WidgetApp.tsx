import { useMemo, useState } from "react";
import { completePaymentSession, startPaymentSession } from "../services/api";
import "./styles.css";

export interface WidgetConfig {
  publisherId: string;
  articleId: string;
  articleUrl: string;
  articleHash: string;
  amountCents: number;
  currency: string;
  returnUrl?: string;
  buttonLabel?: string;
}

interface WidgetAppProps {
  config: WidgetConfig;
  onUnlocked?: (paymentId: string) => void;
}

export function WidgetApp({ config, onUnlocked }: WidgetAppProps): JSX.Element {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);

  const formattedPrice = useMemo(() => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: config.currency,
    }).format(config.amountCents / 100);
  }, [config.amountCents, config.currency]);

  async function handleCheckout(): Promise<void> {
    setError(null);
    setIsLoading(true);

    try {
      const startPayload = {
        publisherId: config.publisherId,
        articleId: config.articleId,
        articleUrl: config.articleUrl,
        articleHash: config.articleHash,
        amountCents: config.amountCents,
        currency: config.currency,
        returnUrl: config.returnUrl ?? window.location.href,
      };

      const startResult = await startPaymentSession(startPayload);
      const completionResult = await completePaymentSession({
        paymentId: startResult.paymentId,
        providerEventId: `dev-${startResult.paymentId}`,
        signature: "dev-placeholder-signature",
      });

      setPaymentId(startResult.paymentId);
      if (completionResult.unlockToken || completionResult.processed) {
        onUnlocked?.(startResult.paymentId);
      }
      window.dispatchEvent(
        new CustomEvent("karticle:unlocked", {
          detail: {
            paymentId: startResult.paymentId,
            articleId: config.articleId,
            publisherId: config.publisherId,
            articleHash: config.articleHash,
          },
        }),
      );
    } catch (checkoutError) {
      const message =
        checkoutError instanceof Error
          ? checkoutError.message
          : "Unknown checkout error";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="karticle-widget-root">
      <button
        className="karticle-button"
        onClick={() => setIsModalOpen(true)}
        type="button"
      >
        {config.buttonLabel ?? "Unlock with Karticle for €1.99"}
      </button>

      {isModalOpen ? (
        <div className="karticle-modal-overlay" role="dialog" aria-modal="true">
          <div className="karticle-modal">
            <h2>Unlock this article</h2>
            <p>One-time purchase: {formattedPrice}</p>
            <p className="karticle-meta">{config.articleUrl}</p>

            {paymentId ? (
              <p className="karticle-success">Payment confirmed: {paymentId}</p>
            ) : null}
            {error ? <p className="karticle-error">{error}</p> : null}

            <div className="karticle-actions">
              <button
                className="karticle-secondary"
                type="button"
                onClick={() => setIsModalOpen(false)}
              >
                Close
              </button>
              <button
                className="karticle-primary"
                type="button"
                onClick={handleCheckout}
                disabled={isLoading}
              >
                {isLoading ? "Processing..." : "Pay now"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
