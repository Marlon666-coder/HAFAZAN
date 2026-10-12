# HAFAZAN

**Jaga Hafalan. Rawat Konsistensi. Dekatkan Hati.**

HAFAZAN adalah _personal Qur'an memorization tracker_ — alat pribadi untuk mencatat progres hafalan Al-Qur'an, menjaga konsistensi muroja'ah, menyusun target realistis, dan mengevaluasi perkembangan hafalan. Dibuat oleh **Marlo Rizky Valentino**.

HAFAZAN **bukan** aplikasi membaca Al-Qur'an dan bukan pengganti mushaf. Aplikasi ini tidak memuat teks ayat — fokusnya adalah pelacakan hafalan.

Seluruh data tersimpan **lokal di peramban Anda** (localStorage). Tidak ada backend, akun, login, atau koneksi internet yang dibutuhkan setelah aplikasi dimuat.

---

## ✨ Fitur

- **Dashboard** — ringkasan ayat dihafal, persentase dari 6.236 ayat, surah selesai, juz tercakup, streak muroja'ah, target harian, dan rekomendasi langkah berikutnya.
- **Daftar 114 Surah** — pencarian (nama Latin/Arab/arti), filter status, filter juz, pengurutan, dan indikator progres.
- **Detail & Tracking per Surah** — ubah status, catat/koreksi rentang ayat (otomatis dinormalisasi tanpa hitung ganda), catatan pribadi, dan riwayat pembaruan.
- **Muroja'ah Harian** — sesi muroja'ah dengan checklist, catatan, kalender aktivitas, dan perhitungan streak berbasis hari kalender lokal.
- **Target & Jadwal** — kalkulator target transparan dengan hari belajar aktif, estimasi ayat/hari, estimasi tanggal selesai, dan peringatan realisme.
- **Statistik & Pencapaian** — grafik progres (SVG), breakdown per juz berbasis pemetaan rentang ayat, ringkasan status, dan badge pencapaian.
- **Pengaturan** — profil lokal, tema terang/gelap/sistem, preferensi, ekspor/impor cadangan JSON, dan reset dengan konfirmasi.

## 🧱 Teknologi

- React 18 + TypeScript (strict mode)
- Vite 5
- React Router (HashRouter — aman untuk GitHub Pages)
- CSS Modules + CSS custom properties (tanpa framework CSS)
- Lucide React (ikon)
- Grafik SVG buatan sendiri (tanpa library chart)
- Vitest + React Testing Library

## 📖 Standar Metadata Qur'an

Metadata 114 surah menggunakan standar penghitungan **Kufan (Hafs 'an 'Asim)** — standar mushaf Madinah yang paling umum dicetak. Di bawah standar ini, total ayat berjumlah tepat **6.236**.

Pembagian juz menggunakan tabel titik awal juz standar mushaf Madinah (`src/data/juz.ts`). Segmen juz per surah **diturunkan** dari tabel ini (`src/data/surahs.ts`) sehingga pemetaan surah↔juz selalu konsisten. Hal ini diverifikasi oleh pengujian otomatis (`tests/metadata.test.ts`).

> Catatan: juz tidak sama dengan surah. Satu juz dapat mencakup beberapa surah, dan satu surah dapat melintasi beberapa juz (mis. Al-Baqarah membentang di juz 1–3).

---

## 🚀 Menjalankan Secara Lokal

### Persyaratan

- **Node.js** 18+ (direkomendasikan Node.js 20 LTS)
- **npm** 9+

### Langkah

```bash
# 1. Clone repository
git clone https://github.com/<owner>/<repo>.git
cd <repo>

# 2. Install dependensi
npm install

# 3. Jalankan dev server
npm run dev
# buka URL yang ditampilkan (mis. http://localhost:5173)

# 4. Jalankan test
npm run test:run

# 5. Type check
npm run typecheck

# 6. Build production
npm run build

# 7. Preview hasil build
npm run preview
```

### Skrip npm

| Skrip               | Fungsi                                         |
| ------------------- | ---------------------------------------------- |
| `npm run dev`       | Menjalankan dev server Vite                    |
| `npm run build`     | `tsc -b` (type check) lalu `vite build`        |
| `npm run preview`   | Preview hasil build production                 |
| `npm run test`      | Vitest (mode watch)                            |
| `npm run test:run`  | Vitest sekali jalan                            |
| `npm run typecheck` | Pemeriksaan tipe TypeScript tanpa emit         |

---

## 🌐 Deploy ke GitHub Pages

Repo ini menyertakan workflow `.github/workflows/deploy.yml` yang otomatis membangun dan men-deploy ke GitHub Pages pada setiap push ke `main` (atau manual via **Run workflow**).

### Cara mengaktifkan

1. Push kode ke branch `main`:
   ```bash
   git add .
   git commit -m "Deploy HAFAZAN"
   git push origin main
   ```
2. Buka repository Anda di GitHub.
3. Masuk ke **Settings → Pages**.
4. Pada **Source**, pilih **GitHub Actions**.
5. Buka tab **Actions** untuk melihat status deployment workflow "Deploy to GitHub Pages".
6. Setelah job `deploy` selesai, URL situs tampil pada ringkasan run (environment `github-pages`) — biasanya `https://<owner>.github.io/<repo>/`.

### Base path otomatis

`vite.config.ts` menurunkan base path dari environment `GITHUB_REPOSITORY`:

- Repo proyek biasa → base `/<repo>/`
- Repo user/org (`owner.github.io`) → base `/`
- Lokal (tanpa env) → base `/`

Nama repository **tidak** di-hardcode, sehingga aset JS/CSS dimuat dengan path yang benar di GitHub Pages. Karena aplikasi memakai **HashRouter**, me-refresh halaman detail (mis. detail surah) tetap berfungsi tanpa konfigurasi rewrite server, dan file `public/.nojekyll` memastikan aset statis tidak diproses Jekyll.

---

## 💾 Backup & Restore Data

Seluruh progres tersimpan di localStorage peramban. **Membersihkan data peramban akan menghapus progres**, dan progres tidak otomatis tersinkron antar perangkat/peramban.

- **Ekspor:** Pengaturan → Cadangan Data → **Ekspor JSON**. Simpan file secara berkala.
- **Impor:** Pengaturan → Cadangan Data → **Impor JSON**. Anda akan melihat pratinjau ringkasan data dan dapat memilih mode **Ganti** atau **Gabung** sebelum konfirmasi.

Backup JSON adalah tanggung jawab pengguna. HAFAZAN tidak dapat memulihkan data yang tidak pernah dicadangkan.

## 🔒 Privasi

- Semua data berada lokal di peramban Anda; tidak dikirim ke server mana pun.
- Tidak ada login, akun cloud, API eksternal, atau API key.
- Keterbatasan localStorage: kapasitas terbatas dan dapat terhapus bersama data peramban — ekspor cadangan secara rutin.

## 📄 Lisensi

MIT.
