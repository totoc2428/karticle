import { useEffect, useMemo, useState } from "react";
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
  preferPopup?: boolean;
  autoOpenModal?: boolean;
}

const MOBILE_QUERY = "(max-width: 760px), (pointer: coarse)";

function isMobileDevice(): boolean {
  if (typeof window.matchMedia === "function") {
    return window.matchMedia(MOBILE_QUERY).matches;
  }
  return window.innerWidth <= 760;
}

function buildProcessUrl(articleId: string): string {
  const processUrl = new URL("/widget/process/", window.location.origin);
  processUrl.search = `?${encodeURIComponent(articleId)}`;
  return processUrl.toString();
}

function isPopupContext(): boolean {
  return Boolean(window.opener && !window.opener.closed);
}

export function WidgetApp({
  config,
  onUnlocked,
  preferPopup = true,
  autoOpenModal = false,
}: WidgetAppProps): JSX.Element {
  const [isModalOpen, setIsModalOpen] = useState(autoOpenModal);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [popupWarning, setPopupWarning] = useState<string | null>(null);

  useEffect(() => {
    if (autoOpenModal) {
      setIsModalOpen(true);
    }
  }, [autoOpenModal]);

  const formattedPrice = useMemo(() => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: config.currency,
    }).format(config.amountCents / 100);
  }, [config.amountCents, config.currency]);

  function notifyUnlock(confirmedPaymentId: string): void {
    const message = {
      type: "karticle:unlocked",
      payload: {
        paymentId: confirmedPaymentId,
        articleId: config.articleId,
        publisherId: config.publisherId,
        articleHash: config.articleHash,
      },
    };

    if (window.parent && window.parent !== window) {
      window.parent.postMessage(message, "*");
    }

    if (window.opener && !window.opener.closed) {
      window.opener.postMessage(message, "*");
      try {
        window.opener.parent.postMessage(message, "*");
      } catch {
        // Ignore cross-origin access errors when opener.parent is unavailable.
      }
    }

    window.dispatchEvent(
      new CustomEvent("karticle:unlocked", {
        detail: message.payload,
      }),
    );
  }

  async function runCheckoutInCurrentContext(): Promise<void> {
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
        notifyUnlock(startResult.paymentId);

        if (window.opener && !window.opener.closed) {
          setTimeout(() => {
            window.close();
          }, 120);
        }
      }
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

  function openPaymentPopup(): boolean {
    const popup = window.open(
      buildProcessUrl(config.articleId),
      "karticle-payment",
      "popup=yes,width=520,height=760,resizable=yes,scrollbars=yes",
    );

    if (!popup) {
      return false;
    }

    popup.focus();
    return true;
  }

  function handleEntryClick(): void {
    setError(null);
    setPopupWarning(null);

    const shouldUsePopup =
      preferPopup && !isMobileDevice() && !isPopupContext();
    if (!shouldUsePopup) {
      setIsModalOpen(true);
      return;
    }

    const opened = openPaymentPopup();
    if (!opened) {
      setPopupWarning(
        "Popup bloquee par le navigateur. Le paiement continue dans cette fenetre.",
      );
      setIsModalOpen(true);
    }
  }

  return (
    <div className="karticle-widget-root">
      <button
        className="karticle-button"
        onClick={handleEntryClick}
        type="button"
      >
        {config.buttonLabel ?? "Unlock with Karticle for €1.99"}
      </button>
      {popupWarning ? <p className="karticle-warning">{popupWarning}</p> : null}

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
                onClick={runCheckoutInCurrentContext}
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
