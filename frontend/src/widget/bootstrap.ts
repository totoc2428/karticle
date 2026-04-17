import React from "react";
import { createRoot, Root } from "react-dom/client";
import { WidgetApp, WidgetConfig } from "./WidgetApp";

interface MountEntry {
  root: Root;
  container: HTMLElement;
}

const mountedWidgets = new Map<string, MountEntry>();

function parseConfigFromDataset(container: HTMLElement): WidgetConfig {
  const amountCents = Number(container.dataset.karticleAmountCents ?? "0");
  return {
    publisherId: container.dataset.karticlePublisherId ?? "unknown-publisher",
    articleId: container.dataset.karticleArticleId ?? "unknown-article",
    amountCents,
    currency: container.dataset.karticleCurrency ?? "EUR",
    buttonLabel: container.dataset.karticleButtonLabel,
  };
}

function mount(container: HTMLElement, config?: Partial<WidgetConfig>): void {
  const widgetConfig = {
    ...parseConfigFromDataset(container),
    ...config,
  } as WidgetConfig;

  const root = createRoot(container);
  root.render(React.createElement(WidgetApp, { config: widgetConfig }));

  const mountId = container.id || `karticle-${Date.now()}`;
  mountedWidgets.set(mountId, { root, container });
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

for (const container of document.querySelectorAll<HTMLElement>(
  "[data-karticle-widget]",
)) {
  mount(container);
}
