import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import "./styles/global.css";
import { App } from "./App";
import { AppDataProvider } from "./state/AppDataProvider";
import { ErrorBoundary } from "./components/feedback/ErrorBoundary";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element #root not found");
}

createRoot(rootElement).render(
  <StrictMode>
    {/* HashRouter keeps deep links + refresh working on GitHub Pages
        without any server-side rewrite. */}
    <ErrorBoundary>
      <HashRouter>
        <AppDataProvider>
          <App />
        </AppDataProvider>
      </HashRouter>
    </ErrorBoundary>
  </StrictMode>,
);
