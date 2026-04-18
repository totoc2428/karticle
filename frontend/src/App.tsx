import { WidgetApp } from "./widget/WidgetApp";
import "./widget/styles.css";

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

function buildWidgetConfig(articleSlug: string, articleUrl: string) {
  return {
    publisherId: "publisher-demo",
    articleId: articleSlug,
    articleUrl,
    articleHash: simpleHash(articleUrl),
    amountCents: 250,
    currency: "EUR",
    buttonLabel: "Unlock with Karticle for €1.99",
  };
}

function renderManagementPage(pathname: string): JSX.Element {
  const isLogin = pathname === "/app/login";
  const isRegister = pathname === "/app/register";

  if (!isLogin && !isRegister && pathname !== "/app") {
    return (
      <main className="karticle-auth-page">
        <section className="karticle-auth-card">
          <h1>Page app introuvable</h1>
          <p>Choisissez une page de gestion valide pour continuer.</p>
          <div className="karticle-auth-links">
            <a href="/app">Tableau de bord</a>
            <a href="/app/login">Login</a>
            <a href="/app/register">Register</a>
          </div>
        </section>
      </main>
    );
  }

  if (pathname === "/app") {
    return (
      <main className="karticle-auth-page">
        <section className="karticle-auth-card">
          <h1>Karticle Console</h1>
          <p>
            Espace de gestion editeur pour connecter un media, suivre les
            transactions article par article, et gerer la configuration du
            widget.
          </p>
          <div className="karticle-auth-links">
            <a href="/app/login">Se connecter</a>
            <a href="/app/register">Creer un compte</a>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="karticle-auth-page">
      <section className="karticle-auth-card">
        <h1>{isLogin ? "Login" : "Register"}</h1>
        <p>
          {isLogin
            ? "Connectez-vous pour piloter vos offres article et suivre vos revenus."
            : "Creer votre espace editeur pour commencer l'integration Karticle."}
        </p>

        <form
          className="karticle-auth-form"
          onSubmit={(event) => event.preventDefault()}
        >
          {!isLogin ? (
            <label>
              Nom du media
              <input type="text" placeholder="Le Quotidien" />
            </label>
          ) : null}

          <label>
            Email
            <input type="email" placeholder="contact@media.fr" />
          </label>

          <label>
            Mot de passe
            <input type="password" placeholder="********" />
          </label>

          <button type="submit">
            {isLogin ? "Se connecter" : "Creer un compte"}
          </button>
        </form>

        <div className="karticle-auth-links">
          <a href="/app">Retour app</a>
          <a href={isLogin ? "/app/register" : "/app/login"}>
            {isLogin ? "Pas de compte ? Register" : "Deja inscrit ? Login"}
          </a>
        </div>
      </section>
    </main>
  );
}

function renderLandingPage(): JSX.Element {
  return (
    <main className="karticle-landing">
      <section className="karticle-landing-hero">
        <p className="karticle-eyebrow">MICRO-PAYMENT FOR NEWSROOMS</p>
        <h1>Karticle</h1>
        <p>
          Karticle permet aux medias de monetiser chaque article premium avec un
          achat unitaire fluide, sans imposer un abonnement immediat.
        </p>
        <div className="karticle-landing-links">
          <a href="/widget">Voir le widget</a>
          <a href="/app">Ouvrir l'app editeur</a>
        </div>
      </section>

      <section className="karticle-landing-grid">
        <article>
          <h2>Experience lecteur</h2>
          <p>
            Paiement rapide depuis un iframe, popup desktop et fallback mobile
            natif pour limiter la friction.
          </p>
        </article>
        <article>
          <h2>Integration simple</h2>
          <p>
            Une URL widget, un slug article, puis un evenement
            <strong> karticle:unlocked</strong> pour reveler le contenu.
          </p>
        </article>
        <article>
          <h2>Controle editeur</h2>
          <p>
            Une future console permettra de suivre le revenu par article,
            configurer les prix et gerer les publications.
          </p>
        </article>
      </section>
    </main>
  );
}

export default function App(): JSX.Element {
  const pathname = window.location.pathname;
  const isWidgetProcessRoute = pathname.startsWith("/widget/process");
  const isWidgetRoute = pathname.startsWith("/widget");
  const isPopupContext = Boolean(window.opener && !window.opener.closed);

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

  const widgetArticleUrl = isWidgetProcessRoute
    ? articleUrlFromSlug
    : isWidgetRoute && document.referrer
      ? document.referrer
      : articleUrlFromSlug;

  if (pathname === "/") {
    return renderLandingPage();
  }

  if (pathname.startsWith("/app")) {
    return renderManagementPage(pathname);
  }

  if (isWidgetProcessRoute) {
    return (
      <main className="karticle-page">
        <section className="karticle-card">
          <WidgetApp
            autoOpenModal={isPopupContext}
            config={buildWidgetConfig(articleSlug, widgetArticleUrl)}
          />
        </section>
      </main>
    );
  }

  if (isWidgetRoute) {
    return (
      <main className="karticle-page">
        <section className="karticle-card">
          <WidgetApp
            config={buildWidgetConfig(articleSlug, widgetArticleUrl)}
          />
        </section>
      </main>
    );
  }

  return renderLandingPage();
}
