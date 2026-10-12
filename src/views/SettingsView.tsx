import { useRef, useState } from "react";
import { Download, Upload, Trash2, Sun, Moon, Monitor } from "lucide-react";
import { PageHeader } from "../components/layout/PageHeader";
import { Modal } from "../components/common/Modal";
import { ConfirmDialog } from "../components/common/ConfirmDialog";
import { useToast } from "../components/feedback/ToastProvider";
import { useAppStore } from "../state/appStore";
import { exportToJson } from "../state/storage";
import { sanitizeAppData, looksLikeBackup } from "../utils/validation";
import type { AppData } from "../types";
import type { ThemePreference, ProgressDisplay } from "../types/settings";
import { totalMemorizedAyahs } from "../state/selectors";
import { formatNumber } from "../utils/format";
import styles from "./SettingsView.module.css";

const THEME_OPTIONS: { value: ThemePreference; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Terang", icon: Sun },
  { value: "dark", label: "Gelap", icon: Moon },
  { value: "system", label: "Sistem", icon: Monitor },
];

export function SettingsView() {
  const store = useAppStore();
  const { notify } = useToast();
  const settings = store.data.settings;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importPreview, setImportPreview] = useState<AppData | null>(null);
  const [importMode, setImportMode] = useState<"replace" | "merge">("replace");
  const [confirmReset, setConfirmReset] = useState(false);

  const handleExport = () => {
    const json = exportToJson(store.data);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hafazan-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    notify("Cadangan JSON berhasil diunduh.", "success");
  };

  const handleFile = async (file: File) => {
    try {
      const text = await file.text();
      const parsed: unknown = JSON.parse(text);
      if (!looksLikeBackup(parsed)) {
        notify("File tidak dikenali sebagai cadangan HAFAZAN.", "error");
        return;
      }
      const sanitized = sanitizeAppData(parsed);
      setImportPreview(sanitized);
      setImportMode("replace");
    } catch {
      notify("Gagal membaca file. Pastikan file JSON cadangan yang valid.", "error");
    }
  };

  const confirmImport = () => {
    if (!importPreview) return;
    store.importData(importPreview, importMode);
    setImportPreview(null);
    notify(
      importMode === "replace" ? "Data berhasil diganti dari cadangan." : "Data berhasil digabungkan dari cadangan.",
      "success",
    );
  };

  const previewSurahs = importPreview ? Object.keys(importPreview.progress).length : 0;
  const previewReviews = importPreview ? importPreview.reviews.length : 0;
  const previewAyahs = importPreview ? totalMemorizedAyahs(importPreview) : 0;

  return (
    <>
      <PageHeader title="Pengaturan" subtitle="Profil lokal, tema, preferensi, dan cadangan data." />

      <section className={"card " + styles.block}>
        <h2 className={styles.blockTitle}>Profil Lokal</h2>
        <p className="hint" style={{ marginBottom: "1rem" }}>
          Profil ini hanya disimpan di peramban Anda. Tidak ada login atau akun.
        </p>
        <label>
          <span className="label">Nama panggilan</span>
          <input
            className="input"
            value={settings.nickname}
            onChange={(e) => store.updateSettings({ nickname: e.target.value })}
            placeholder="mis. Marlo"
            maxLength={40}
          />
        </label>
        <label style={{ display: "block", marginTop: "1rem" }}>
          <span className="label">Catatan singkat (opsional)</span>
          <textarea
            className="textarea"
            value={settings.bio}
            onChange={(e) => store.updateSettings({ bio: e.target.value })}
            placeholder="mis. Target khatam dalam 2 tahun, insyaAllah."
            maxLength={200}
          />
        </label>
      </section>

      <section className={"card " + styles.block}>
        <h2 className={styles.blockTitle}>Tema</h2>
        <div className={styles.themeGroup} role="group" aria-label="Pilih tema">
          {THEME_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`${styles.themeBtn} ${settings.theme === opt.value ? styles.themeActive : ""}`}
              aria-pressed={settings.theme === opt.value}
              onClick={() => store.updateSettings({ theme: opt.value })}
            >
              <opt.icon size={18} aria-hidden="true" />
              {opt.label}
            </button>
          ))}
        </div>
      </section>

      <section className={"card " + styles.block}>
        <h2 className={styles.blockTitle}>Preferensi</h2>
        <label>
          <span className="label">Format tampilan progres</span>
          <select
            className="select"
            value={settings.progressDisplay}
            onChange={(e) => store.updateSettings({ progressDisplay: e.target.value as ProgressDisplay })}
          >
            <option value="percent">Persentase</option>
            <option value="ayah">Jumlah ayat</option>
          </select>
        </label>
        <label className={styles.toggleRow}>
          <input
            type="checkbox"
            checked={settings.confirmDestructive}
            onChange={(e) => store.updateSettings({ confirmDestructive: e.target.checked })}
          />
          <span>Minta konfirmasi sebelum tindakan menghapus data</span>
        </label>
        <p className="hint">
          Notifikasi lokal peramban tidak diaktifkan karena bergantung pada izin dan dukungan peramban. HAFAZAN sepenuhnya berjalan tanpa koneksi setelah dimuat.
        </p>
      </section>

      <section className={"card " + styles.block}>
        <h2 className={styles.blockTitle}>Cadangan Data</h2>
        <p className="hint" style={{ marginBottom: "1rem" }}>
          Seluruh progres tersimpan lokal. Ekspor cadangan secara berkala agar data aman bila peramban dibersihkan.
        </p>
        <div className={styles.backupRow}>
          <button type="button" className="btn btn-primary" onClick={handleExport}>
            <Download size={16} /> Ekspor JSON
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => fileInputRef.current?.click()}>
            <Upload size={16} /> Impor JSON
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            className="visually-hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleFile(file);
              e.target.value = "";
            }}
          />
        </div>
      </section>

      <section className={"card " + styles.block}>
        <h2 className={styles.blockTitle}>Reset Data</h2>
        <p className="hint" style={{ marginBottom: "1rem" }}>
          Menghapus seluruh progres, catatan, riwayat muroja'ah, dan pengaturan. Tindakan ini tidak dapat dibatalkan.
        </p>
        <button
          type="button"
          className="btn btn-danger"
          onClick={() => (settings.confirmDestructive ? setConfirmReset(true) : doReset())}
        >
          <Trash2 size={16} /> Reset Seluruh Data
        </button>
      </section>

      <Modal
        open={importPreview !== null}
        title="Pratinjau Impor Cadangan"
        onClose={() => setImportPreview(null)}
        footer={
          <>
            <button type="button" className="btn btn-ghost" onClick={() => setImportPreview(null)}>
              Batal
            </button>
            <button type="button" className="btn btn-primary" onClick={confirmImport}>
              {importMode === "replace" ? "Ganti Data" : "Gabungkan Data"}
            </button>
          </>
        }
      >
        <ul className={styles.previewList}>
          <li>
            <span>Surah dengan progres</span>
            <strong>{previewSurahs}</strong>
          </li>
          <li>
            <span>Total ayat tercatat</span>
            <strong>{formatNumber(previewAyahs)}</strong>
          </li>
          <li>
            <span>Sesi muroja'ah</span>
            <strong>{previewReviews}</strong>
          </li>
        </ul>
        <fieldset className={styles.modeChoice}>
          <legend className="label">Mode impor</legend>
          <label className={styles.toggleRow}>
            <input
              type="radio"
              name="import-mode"
              checked={importMode === "replace"}
              onChange={() => setImportMode("replace")}
            />
            <span>
              <strong>Ganti</strong> — hapus data saat ini, gunakan data cadangan sepenuhnya.
            </span>
          </label>
          <label className={styles.toggleRow}>
            <input
              type="radio"
              name="import-mode"
              checked={importMode === "merge"}
              onChange={() => setImportMode("merge")}
            />
            <span>
              <strong>Gabung</strong> — pertahankan data saat ini, tambahkan data dari cadangan.
            </span>
          </label>
        </fieldset>
      </Modal>

      <ConfirmDialog
        open={confirmReset}
        title="Reset seluruh data?"
        message="Semua progres hafalan, catatan, riwayat muroja'ah, dan pengaturan akan dihapus permanen. Pastikan Anda sudah mengekspor cadangan bila diperlukan."
        confirmLabel="Ya, Reset"
        danger
        onConfirm={() => {
          doReset();
          setConfirmReset(false);
        }}
        onCancel={() => setConfirmReset(false)}
      />
    </>
  );

  function doReset() {
    store.resetData();
    notify("Seluruh data telah direset ke kondisi awal.", "info");
  }
}
