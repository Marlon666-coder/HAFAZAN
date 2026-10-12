import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, within, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach } from "vitest";
import { HashRouter } from "react-router-dom";
import { App } from "../src/App";
import { AppDataProvider } from "../src/state/AppDataProvider";

function renderApp() {
  return render(
    <HashRouter>
      <AppDataProvider>
        <App />
      </AppDataProvider>
    </HashRouter>,
  );
}

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  cleanup();
});

describe("app navigation and core flows", () => {
  it("shows the empty dashboard welcome on first load", () => {
    renderApp();
    expect(screen.getByText(/Selamat datang di HAFAZAN/i)).toBeInTheDocument();
  });

  it("navigates to the surah list and lists 114 surahs", async () => {
    const user = userEvent.setup();
    renderApp();
    await user.click(screen.getAllByRole("link", { name: /Surah/i })[0]);
    expect(await screen.findByText(/Menampilkan 114 dari 114 surah/i)).toBeInTheDocument();
  });

  it("filters surahs by search query", async () => {
    const user = userEvent.setup();
    renderApp();
    await user.click(screen.getAllByRole("link", { name: /Surah/i })[0]);
    const search = await screen.findByRole("searchbox", { name: /Cari surah/i });
    await user.type(search, "Al-Fatihah");
    expect(await screen.findByText(/Menampilkan 1 dari 114 surah/i)).toBeInTheDocument();
  });

  it("records an ayah range and reflects it in progress, persisting to storage", async () => {
    const user = userEvent.setup();
    renderApp();

    // Go to surah list, open Al-Fatihah (surah 1).
    await user.click(screen.getAllByRole("link", { name: /Surah/i })[0]);
    const fatihah = await screen.findByRole("link", { name: /Al-Fatihah/i });
    await user.click(fatihah);

    // Add range 1-7.
    const from = await screen.findByPlaceholderText("1");
    const to = screen.getByPlaceholderText("7");
    await user.type(from, "1");
    await user.type(to, "7");
    await user.click(screen.getByRole("button", { name: /Tambah Rentang/i }));

    // The range chip should appear.
    expect(await screen.findByText(/Ayat 1–7/i)).toBeInTheDocument();

    // Storage should now contain surah 1 progress.
    const raw = window.localStorage.getItem("hafazan:appdata:v1");
    expect(raw).toBeTruthy();
    const stored = JSON.parse(raw as string);
    expect(stored.progress["1"].memorizedRanges).toEqual([{ start: 1, end: 7 }]);
  });

  it("updates surah status via the status buttons", async () => {
    const user = userEvent.setup();
    renderApp();
    await user.click(screen.getAllByRole("link", { name: /Surah/i })[0]);
    await user.click(await screen.findByRole("link", { name: /An-Nas/i }));

    const group = await screen.findByRole("group", { name: /Ubah status hafalan/i });
    await user.click(within(group).getByRole("button", { name: "Sudah Hafal" }));

    const stored = JSON.parse(window.localStorage.getItem("hafazan:appdata:v1") as string);
    expect(stored.progress["114"].status).toBe("memorized");
  });

  it("switches to the dark theme from settings and persists it", async () => {
    const user = userEvent.setup();
    renderApp();
    await user.click(screen.getAllByRole("link", { name: /Pengaturan/i })[0]);
    const group = await screen.findByRole("group", { name: /Pilih tema/i });
    await user.click(within(group).getByRole("button", { name: /Gelap/i }));

    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    const stored = JSON.parse(window.localStorage.getItem("hafazan:appdata:v1") as string);
    expect(stored.settings.theme).toBe("dark");
  });
});
