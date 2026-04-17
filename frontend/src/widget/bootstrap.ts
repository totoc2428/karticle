import React from "react";
import { createRoot, Root } from "react-dom/client";
import { WidgetApp, WidgetConfig } from "./WidgetApp";

interface MountEntry {
  root: Root;
  container: HTMLElement;
  config: WidgetConfig;
}

const mountedWidgets = new Map<string, MountEntry>();

function simpleHash(value: string): string {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return `hash_${Math.abs(hash).toString(16)}`;
}

function readSearchParam(name: string): string | null {
  return new URLSearchParams(window.location.search).get(name);
}

function resolveArticleUrl(container: HTMLElement): string {
  return (
    readSearchParam("karticle_article_url") ??
    container.dataset.karticleArticleUrl ??
    document.referrer ??
    window.location.href
  );
}

function parseConfigFromDataset(container: HTMLElement): WidgetConfig {
  const amountCents = Number(
    readSearchParam("karticle_amount_cents") ?? container.dataset.karticleAmountCents ?? "0",
  );
  const articleUrl = resolveArticleUrl(container);
  const articleHash =
    readSearchParam("karticle_article_hash") ??
    container.dataset.karticleArticleHash ??
    simpleHash(articleUrl);

  return {
    publisherId:
      readSearchParam("karticle_publisher_id") ??
      container.dataset.karticlePublisherId ??
      "unknown-publisher",
    articleId:
      readSearchParam("karticle_article_id") ??
      container.dataset.karticleArticleId ??
      "unknown-article",
    articleUrl,
    articleHash,
    amountCents,
    currency: readSearchParam("karticle_currency") ?? container.dataset.karticleCurrency ?? "EUR",
    returnUrl: readSearchParam("karticle_return_url") ?? container.dataset.karticleReturnUrl ?? articleUrl,
    buttonLabel: container.dataset.karticleButtonLabel,
  };
}

function mount(container: HTMLElement, config?: Partial<WidgetConfig>): void {
  const widgetConfig: WidgetConfig = {
    ...parseConfigFromDataset(container),
    ...config,
  };

  const root = createRoot(container);
  root.render(React.createElement(WidgetApp, { config: widgetConfig }));

  const mountId = container.id || `karticle-${Date.now()}`;
  mountedWidgets.set(mountId, { root, container, config: widgetConfig });
}

function remountAllWithMessageConfig(messageConfig: Partial<WidgetConfig>): void {
  for (const [mountId, entry] of mountedWidgets.entries()) {
    const nextConfig: WidgetConfig = {
      ...entry.config,
      ...messageConfig,
    };
    entry.root.render(React.createElement(WidgetApp, { config: nextConfig }));
    mountedWidgets.set(mountId, { ...entry, config: nextConfig });
  }
}

function unmount(containerId: string): void {
  const entry = mountedWidgets.get(containerId);
  if (!entry) {
    return;
  }
  entry.root.unmount();
  mountedWidgets.delete(containerId);
}

declare global {
  interface Window {
    KarticleWidget?: {
      mount: (container: HTMLElement, config?: Partial<WidgetConfig>) => void;
      unmount: (containerId: string) => void;
    };
  }
}

window.KarticleWidget = {
  mount,
  unmount,
};

window.addEventListener("message", (event: MessageEvent) => {
  const data = event.data as
    | { type?: string; payload?: Partial<WidgetConfig> }
    | undefined;

  if (!data || data.type !== "karticle:context" || !data.payload) {
    return;
  }

  remountAllWithMessageConfig(data.payload);
});

for (const container of document.querySelectorAll<HTMLElement>(
  "[data-karticle-widget]",
)) {
  mount(container);
}
