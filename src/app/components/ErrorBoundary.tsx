import { Component, type ReactNode, type ErrorInfo } from "react";

// ── Types ──────────────────────────────────────────────────────

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

// ── Composant ──────────────────────────────────────────────────

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });

    // Log en production (remplace par Sentry si besoin)
    console.error("[ErrorBoundary] Erreur interceptée :", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      // Fallback personnalisé si fourni
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Fallback par défaut
      return (
        <div className="min-h-screen bg-[var(--pc-surface)] flex items-center justify-center px-6">
          <div className="max-w-md w-full text-center space-y-6">
            {/* Icône */}
            <div className="w-20 h-20 mx-auto rounded-3xl bg-red-100 dark:bg-red-950/30 flex items-center justify-center">
              <span className="text-4xl">⚠️</span>
            </div>

            {/* Message */}
            <div className="space-y-2">
              <h1 className="text-[var(--pc-text-primary)] text-xl font-bold">
                Quelque chose s'est mal passé
              </h1>
              <p className="text-[var(--pc-text-secondary)] text-sm leading-relaxed">
                Une erreur inattendue s'est produite. Veuillez rafraîchir la
                page ou revenir à l'accueil.
              </p>
            </div>

            {/* Détail erreur (dev uniquement) */}
            {import.meta.env.DEV && this.state.error && (
              <div className="text-left bg-[var(--pc-surface-2)] border border-[var(--pc-border)] rounded-xl p-4 space-y-2">
                <p className="text-red-500 text-xs font-mono font-semibold">
                  {this.state.error.name}: {this.state.error.message}
                </p>
                {this.state.errorInfo && (
                  <pre className="text-[var(--pc-text-secondary)] text-xs font-mono overflow-auto max-h-40 whitespace-pre-wrap">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-3">
              <button
                onClick={this.handleReset}
                className="w-full py-3 rounded-xl bg-[var(--pc-primary)] text-white font-semibold text-sm hover:opacity-90 transition-opacity"
              >
                Réessayer
              </button>
              <button
                onClick={() => {
                  this.handleReset();
                  window.location.href = "/";
                }}
                className="w-full py-3 rounded-xl bg-[var(--pc-surface-2)] border border-[var(--pc-border)] text-[var(--pc-text-primary)] font-semibold text-sm hover:bg-[var(--pc-border)] transition-colors"
              >
                Retour à l'accueil
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// ── ErrorBoundary léger pour les sections ─────────────────────
// Utilise celui-ci pour entourer des sections spécifiques
// sans bloquer toute l'app si une section crashe

export function SectionErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="flex items-center justify-center p-8">
          <div className="text-center space-y-2">
            <p className="text-[var(--pc-text-secondary)] text-sm">
              Cette section n'a pas pu se charger.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="text-[var(--pc-primary)] text-xs hover:underline"
            >
              Rafraîchir la page
            </button>
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}
