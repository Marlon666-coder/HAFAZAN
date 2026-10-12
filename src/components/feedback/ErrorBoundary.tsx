import { Component, type ErrorInfo, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

/**
 * Catches render-time errors anywhere in the tree and shows a readable
 * fallback instead of an all-white blank page. This makes failures
 * diagnosable in production (e.g. on GitHub Pages) rather than silent.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, message: "" };

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return {
      hasError: true,
      message: error instanceof Error ? error.message : String(error),
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Surface to the console for debugging.
    console.error("HAFAZAN runtime error:", error, info.componentStack);
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, message: "" });
  };

  render(): ReactNode {
    if (!this.state.hasError) return this.props.children;

    return (
      <div
        role="alert"
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          fontFamily: "system-ui, sans-serif",
          background: "#f7f5ee",
          color: "#202923",
        }}
      >
        <div style={{ maxWidth: 420, textAlign: "center" }}>
          <h1 style={{ fontSize: "1.4rem", marginBottom: "0.75rem", color: "#176b50" }}>
            Terjadi kesalahan
          </h1>
          <p style={{ marginBottom: "1rem", lineHeight: 1.5 }}>
            Aplikasi mengalami galat saat memuat. Data Anda tetap aman di penyimpanan lokal.
          </p>
          <pre
            style={{
              textAlign: "left",
              background: "#fff",
              border: "1px solid #e5e7df",
              borderRadius: 12,
              padding: "0.75rem",
              fontSize: "0.8rem",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              marginBottom: "1rem",
            }}
          >
            {this.state.message}
          </pre>
          <button
            type="button"
            onClick={this.handleReset}
            style={{
              minHeight: 44,
              padding: "0 1rem",
              border: "none",
              borderRadius: 12,
              background: "#176b50",
              color: "#fff",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }
}
