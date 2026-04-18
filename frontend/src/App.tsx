import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type MouseEvent,
} from "react";
import { loginPublisher, registerPublisher } from "./services/api";
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

function renderManagementPage({
  pathname,
  mediaName,
  email,
  password,
  isSubmitting,
  authError,
  authSuccess,
  onMediaNameChange,
  onEmailChange,
  onPasswordChange,
  onLoginSubmit,
  onRegisterSubmit,
  onNavigate,
}: {
  pathname: string;
  mediaName: string;
  email: string;
  password: string;
  isSubmitting: boolean;
  authError: string | null;
  authSuccess: string | null;
  onMediaNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onLoginSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onRegisterSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onNavigate: (event: MouseEvent<HTMLAnchorElement>, href: string) => void;
}): JSX.Element {
  const isLogin = pathname === "/app/login";
  const isRegister = pathname === "/app/register";

  if (!isLogin && !isRegister && pathname !== "/app") {
    return (
      <main className="karticle-auth-page">
        <section className="karticle-auth-card">
          <h1>Page app introuvable</h1>
          <p>Choisissez une page de gestion valide pour continuer.</p>
          <div className="karticle-auth-links">
            <a href="/app" onClick={(event) => onNavigate(event, "/app")}>
              Tableau de bord
            </a>
            <a
              href="/app/login"
              onClick={(event) => onNavigate(event, "/app/login")}
            >
              Login
            </a>
            <a
              href="/app/register"
              onClick={(event) => onNavigate(event, "/app/register")}
            >
              Register
            </a>
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
            <a
              href="/app/login"
              onClick={(event) => onNavigate(event, "/app/login")}
            >
              Se connecter
            </a>
            <a
              href="/app/register"
              onClick={(event) => onNavigate(event, "/app/register")}
            >
              Creer un compte
            </a>
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
          onSubmit={isLogin ? onLoginSubmit : onRegisterSubmit}
        >
          {!isLogin ? (
            <label>
              Nom du media
              <input
                type="text"
                placeholder="Le Quotidien"
                value={mediaName}
                onChange={(event) => onMediaNameChange(event.target.value)}
              />
            </label>
          ) : null}

          <label>
            Email
            <input
              type="email"
              placeholder="contact@media.fr"
              value={email}
              onChange={(event) => onEmailChange(event.target.value)}
              required
            />
          </label>

          <label>
            Mot de passe
            <input
              type="password"
              placeholder="********"
              value={password}
              onChange={(event) => onPasswordChange(event.target.value)}
              required
            />
          </label>

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? "Traitement..."
              : isLogin
                ? "Se connecter"
                : "Creer un compte"}
          </button>
        </form>

        {authError ? (
          <p className="karticle-auth-status error">{authError}</p>
        ) : null}
        {authSuccess ? (
          <p className="karticle-auth-status success">{authSuccess}</p>
        ) : null}

        <div className="karticle-auth-links">
          <a href="/app" onClick={(event) => onNavigate(event, "/app")}>
            Retour app
          </a>
          <a
            href={isLogin ? "/app/register" : "/app/login"}
            onClick={(event) =>
              onNavigate(event, isLogin ? "/app/register" : "/app/login")
            }
          >
            {isLogin ? "Pas de compte ? Register" : "Deja inscrit ? Login"}
          </a>
        </div>
      </section>
    </main>
  );
}

function renderLandingPage(
  onNavigate: (event: MouseEvent<HTMLAnchorElement>, href: string) => void,
): JSX.Element {
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
          <a href="/widget" onClick={(event) => onNavigate(event, "/widget")}>
            Voir le widget
          </a>
          <a href="/app" onClick={(event) => onNavigate(event, "/app")}>
            Ouvrir l'app editeur
          </a>
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
  const [pathname, setPathname] = useState(() => window.location.pathname);
  const [search, setSearch] = useState(() => window.location.search);
  const [mediaName, setMediaName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  const navigate = useCallback((href: string) => {
    const target = new URL(href, window.location.origin);
    const nextPath = `${target.pathname}${target.search}`;
    const currentPath = `${window.location.pathname}${window.location.search}`;

    if (nextPath !== currentPath) {
      window.history.pushState({}, "", nextPath);
      setPathname(target.pathname);
      setSearch(target.search);
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  }, []);

  const onNavigate = useCallback(
    (event: MouseEvent<HTMLAnchorElement>, href: string) => {
      if (
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }
      event.preventDefault();
      navigate(href);
    },
    [navigate],
  );

  useEffect(() => {
    const onPopState = () => {
      setPathname(window.location.pathname);
      setSearch(window.location.search);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    setAuthError(null);
    setAuthSuccess(null);
  }, [pathname]);

  const isWidgetProcessRoute = pathname.startsWith("/widget/process");
  const isWidgetRoute = pathname.startsWith("/widget");
  const isPopupContext = Boolean(window.opener && !window.opener.closed);

  const rawQuery = search.startsWith("?") ? search.slice(1) : "";
  const decodedSlug = useMemo(() => {
    try {
      return decodeURIComponent(rawQuery || DEFAULT_ARTICLE_SLUG)
        .replace(/^\/+/, "")
        .trim();
    } catch {
      return DEFAULT_ARTICLE_SLUG;
    }
  }, [rawQuery]);
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

  const handleLoginSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setAuthError(null);
      setAuthSuccess(null);
      setIsSubmitting(true);

      try {
        const result = await loginPublisher({ email, password });
        setAuthSuccess(
          result.message ??
            "Connexion envoyee. Endpoint backend pret a etre branche.",
        );
      } catch (error) {
        setAuthError(
          error instanceof Error
            ? error.message
            : "Erreur de connexion inconnue.",
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [email, password],
  );

  const handleRegisterSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setAuthError(null);
      setAuthSuccess(null);

      if (!mediaName.trim()) {
        setAuthError("Le nom du media est requis.");
        return;
      }

      setIsSubmitting(true);
      try {
        const result = await registerPublisher({
          publisherName: mediaName.trim(),
          email,
          password,
        });
        setAuthSuccess(
          result.message ??
            "Inscription envoyee. Endpoint backend pret a etre branche.",
        );
      } catch (error) {
        setAuthError(
          error instanceof Error
            ? error.message
            : "Erreur d'inscription inconnue.",
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [email, mediaName, password],
  );

  if (pathname === "/") {
    return renderLandingPage(onNavigate);
  }

  if (pathname.startsWith("/app")) {
    return renderManagementPage({
      pathname,
      mediaName,
      email,
      password,
      isSubmitting,
      authError,
      authSuccess,
      onMediaNameChange: setMediaName,
      onEmailChange: setEmail,
      onPasswordChange: setPassword,
      onLoginSubmit: handleLoginSubmit,
      onRegisterSubmit: handleRegisterSubmit,
      onNavigate,
    });
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

  return renderLandingPage(onNavigate);
}
