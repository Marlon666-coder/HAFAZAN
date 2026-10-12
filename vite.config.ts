import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/**
 * Derive the GitHub Pages base path from the environment.
 *
 * - On GitHub Actions, `GITHUB_REPOSITORY` is `owner/repo`.
 * - For a normal project repo we serve from `/<repo>/`.
 * - For a user/org page repo (`owner.github.io`) we serve from `/`.
 * - Locally (no env var) we serve from `/`.
 * - Invalid input falls back to `/` safely.
 */
function resolveBase(): string {
  const repository = process.env.GITHUB_REPOSITORY;
  if (!repository || typeof repository !== "string") {
    return "/";
  }

  const parts = repository.split("/");
  if (parts.length !== 2) {
    return "/";
  }

  const [owner, repo] = parts;
  if (!owner || !repo) {
    return "/";
  }

  // User/org page: served from the domain root.
  if (repo.toLowerCase() === `${owner.toLowerCase()}.github.io`) {
    return "/";
  }

  return `/${repo}/`;
}

// https://vite.dev/config/
export default defineConfig({
  base: resolveBase(),
  plugins: [react()],
  build: {
    outDir: "dist",
    sourcemap: false,
  },
});
