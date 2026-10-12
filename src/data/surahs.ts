import type { Surah, JuzSegment } from "../types/surah";
import { JUZ_START_POINTS, TOTAL_JUZ } from "./juz";

/**
 * Core reference metadata for the 114 surahs of the Qur'an.
 *
 * Ayah counts follow the Kufan (Hafs 'an 'Asim) counting standard, which is
 * the most widely printed mushaf (the "Madinah mushaf"). Under this standard
 * the total number of ayahs is exactly 6236. This standard is documented in
 * the project README.
 *
 * The `juzSegments`, `startJuz` and `endJuz` fields are NOT typed by hand here.
 * They are derived from the authoritative juz boundary table in `./juz.ts` by
 * {@link buildSurahs}, which guarantees that the surah→juz mapping and the
 * juz→surah mapping stay perfectly consistent.
 */
interface SurahSeed {
  number: number;
  nameArabic: string;
  nameLatin: string;
  meaningIndonesia: string;
  ayahCount: number;
}

const SURAH_SEEDS: SurahSeed[] = [
  { number: 1, nameArabic: "الفاتحة", nameLatin: "Al-Fatihah", meaningIndonesia: "Pembukaan", ayahCount: 7 },
  { number: 2, nameArabic: "البقرة", nameLatin: "Al-Baqarah", meaningIndonesia: "Sapi Betina", ayahCount: 286 },
  { number: 3, nameArabic: "آل عمران", nameLatin: "Ali 'Imran", meaningIndonesia: "Keluarga Imran", ayahCount: 200 },
  { number: 4, nameArabic: "النساء", nameLatin: "An-Nisa'", meaningIndonesia: "Wanita", ayahCount: 176 },
  { number: 5, nameArabic: "المائدة", nameLatin: "Al-Ma'idah", meaningIndonesia: "Hidangan", ayahCount: 120 },
  { number: 6, nameArabic: "الأنعام", nameLatin: "Al-An'am", meaningIndonesia: "Binatang Ternak", ayahCount: 165 },
  { number: 7, nameArabic: "الأعراف", nameLatin: "Al-A'raf", meaningIndonesia: "Tempat Tertinggi", ayahCount: 206 },
  { number: 8, nameArabic: "الأنفال", nameLatin: "Al-Anfal", meaningIndonesia: "Harta Rampasan Perang", ayahCount: 75 },
  { number: 9, nameArabic: "التوبة", nameLatin: "At-Taubah", meaningIndonesia: "Pengampunan", ayahCount: 129 },
  { number: 10, nameArabic: "يونس", nameLatin: "Yunus", meaningIndonesia: "Nabi Yunus", ayahCount: 109 },
  { number: 11, nameArabic: "هود", nameLatin: "Hud", meaningIndonesia: "Nabi Hud", ayahCount: 123 },
  { number: 12, nameArabic: "يوسف", nameLatin: "Yusuf", meaningIndonesia: "Nabi Yusuf", ayahCount: 111 },
  { number: 13, nameArabic: "الرعد", nameLatin: "Ar-Ra'd", meaningIndonesia: "Guruh", ayahCount: 43 },
  { number: 14, nameArabic: "إبراهيم", nameLatin: "Ibrahim", meaningIndonesia: "Nabi Ibrahim", ayahCount: 52 },
  { number: 15, nameArabic: "الحجر", nameLatin: "Al-Hijr", meaningIndonesia: "Negeri Hijr", ayahCount: 99 },
  { number: 16, nameArabic: "النحل", nameLatin: "An-Nahl", meaningIndonesia: "Lebah", ayahCount: 128 },
  { number: 17, nameArabic: "الإسراء", nameLatin: "Al-Isra'", meaningIndonesia: "Perjalanan Malam", ayahCount: 111 },
  { number: 18, nameArabic: "الكهف", nameLatin: "Al-Kahfi", meaningIndonesia: "Gua", ayahCount: 110 },
  { number: 19, nameArabic: "مريم", nameLatin: "Maryam", meaningIndonesia: "Maryam", ayahCount: 98 },
  { number: 20, nameArabic: "طه", nameLatin: "Taha", meaningIndonesia: "Ta Ha", ayahCount: 135 },
  { number: 21, nameArabic: "الأنبياء", nameLatin: "Al-Anbiya'", meaningIndonesia: "Para Nabi", ayahCount: 112 },
  { number: 22, nameArabic: "الحج", nameLatin: "Al-Hajj", meaningIndonesia: "Haji", ayahCount: 78 },
  { number: 23, nameArabic: "المؤمنون", nameLatin: "Al-Mu'minun", meaningIndonesia: "Orang-Orang Mukmin", ayahCount: 118 },
  { number: 24, nameArabic: "النور", nameLatin: "An-Nur", meaningIndonesia: "Cahaya", ayahCount: 64 },
  { number: 25, nameArabic: "الفرقان", nameLatin: "Al-Furqan", meaningIndonesia: "Pembeda", ayahCount: 77 },
  { number: 26, nameArabic: "الشعراء", nameLatin: "Asy-Syu'ara'", meaningIndonesia: "Para Penyair", ayahCount: 227 },
  { number: 27, nameArabic: "النمل", nameLatin: "An-Naml", meaningIndonesia: "Semut", ayahCount: 93 },
  { number: 28, nameArabic: "القصص", nameLatin: "Al-Qasas", meaningIndonesia: "Kisah-Kisah", ayahCount: 88 },
  { number: 29, nameArabic: "العنكبوت", nameLatin: "Al-'Ankabut", meaningIndonesia: "Laba-Laba", ayahCount: 69 },
  { number: 30, nameArabic: "الروم", nameLatin: "Ar-Rum", meaningIndonesia: "Bangsa Romawi", ayahCount: 60 },
  { number: 31, nameArabic: "لقمان", nameLatin: "Luqman", meaningIndonesia: "Luqman", ayahCount: 34 },
  { number: 32, nameArabic: "السجدة", nameLatin: "As-Sajdah", meaningIndonesia: "Sujud", ayahCount: 30 },
  { number: 33, nameArabic: "الأحزاب", nameLatin: "Al-Ahzab", meaningIndonesia: "Golongan Yang Bersekutu", ayahCount: 73 },
  { number: 34, nameArabic: "سبأ", nameLatin: "Saba'", meaningIndonesia: "Kaum Saba'", ayahCount: 54 },
  { number: 35, nameArabic: "فاطر", nameLatin: "Fatir", meaningIndonesia: "Pencipta", ayahCount: 45 },
  { number: 36, nameArabic: "يس", nameLatin: "Yasin", meaningIndonesia: "Ya Sin", ayahCount: 83 },
  { number: 37, nameArabic: "الصافات", nameLatin: "As-Saffat", meaningIndonesia: "Barisan-Barisan", ayahCount: 182 },
  { number: 38, nameArabic: "ص", nameLatin: "Sad", meaningIndonesia: "Sad", ayahCount: 88 },
  { number: 39, nameArabic: "الزمر", nameLatin: "Az-Zumar", meaningIndonesia: "Rombongan", ayahCount: 75 },
  { number: 40, nameArabic: "غافر", nameLatin: "Gafir", meaningIndonesia: "Yang Maha Pengampun", ayahCount: 85 },
  { number: 41, nameArabic: "فصلت", nameLatin: "Fussilat", meaningIndonesia: "Yang Dijelaskan", ayahCount: 54 },
  { number: 42, nameArabic: "الشورى", nameLatin: "Asy-Syura", meaningIndonesia: "Musyawarah", ayahCount: 53 },
  { number: 43, nameArabic: "الزخرف", nameLatin: "Az-Zukhruf", meaningIndonesia: "Perhiasan", ayahCount: 89 },
  { number: 44, nameArabic: "الدخان", nameLatin: "Ad-Dukhan", meaningIndonesia: "Kabut", ayahCount: 59 },
  { number: 45, nameArabic: "الجاثية", nameLatin: "Al-Jatsiyah", meaningIndonesia: "Yang Berlutut", ayahCount: 37 },
  { number: 46, nameArabic: "الأحقاف", nameLatin: "Al-Ahqaf", meaningIndonesia: "Bukit-Bukit Pasir", ayahCount: 35 },
  { number: 47, nameArabic: "محمد", nameLatin: "Muhammad", meaningIndonesia: "Nabi Muhammad", ayahCount: 38 },
  { number: 48, nameArabic: "الفتح", nameLatin: "Al-Fath", meaningIndonesia: "Kemenangan", ayahCount: 29 },
  { number: 49, nameArabic: "الحجرات", nameLatin: "Al-Hujurat", meaningIndonesia: "Kamar-Kamar", ayahCount: 18 },
  { number: 50, nameArabic: "ق", nameLatin: "Qaf", meaningIndonesia: "Qaf", ayahCount: 45 },
  { number: 51, nameArabic: "الذاريات", nameLatin: "Az-Zariyat", meaningIndonesia: "Angin Yang Menerbangkan", ayahCount: 60 },
  { number: 52, nameArabic: "الطور", nameLatin: "At-Tur", meaningIndonesia: "Bukit Tursina", ayahCount: 49 },
  { number: 53, nameArabic: "النجم", nameLatin: "An-Najm", meaningIndonesia: "Bintang", ayahCount: 62 },
  { number: 54, nameArabic: "القمر", nameLatin: "Al-Qamar", meaningIndonesia: "Bulan", ayahCount: 55 },
  { number: 55, nameArabic: "الرحمن", nameLatin: "Ar-Rahman", meaningIndonesia: "Yang Maha Pengasih", ayahCount: 78 },
  { number: 56, nameArabic: "الواقعة", nameLatin: "Al-Waqi'ah", meaningIndonesia: "Hari Kiamat", ayahCount: 96 },
  { number: 57, nameArabic: "الحديد", nameLatin: "Al-Hadid", meaningIndonesia: "Besi", ayahCount: 29 },
  { number: 58, nameArabic: "المجادلة", nameLatin: "Al-Mujadalah", meaningIndonesia: "Wanita Yang Mengajukan Gugatan", ayahCount: 22 },
  { number: 59, nameArabic: "الحشر", nameLatin: "Al-Hasyr", meaningIndonesia: "Pengusiran", ayahCount: 24 },
  { number: 60, nameArabic: "الممتحنة", nameLatin: "Al-Mumtahanah", meaningIndonesia: "Wanita Yang Diuji", ayahCount: 13 },
  { number: 61, nameArabic: "الصف", nameLatin: "As-Saff", meaningIndonesia: "Barisan", ayahCount: 14 },
  { number: 62, nameArabic: "الجمعة", nameLatin: "Al-Jumu'ah", meaningIndonesia: "Hari Jumat", ayahCount: 11 },
  { number: 63, nameArabic: "المنافقون", nameLatin: "Al-Munafiqun", meaningIndonesia: "Orang-Orang Munafik", ayahCount: 11 },
  { number: 64, nameArabic: "التغابن", nameLatin: "At-Tagabun", meaningIndonesia: "Hari Ditampakkan Kesalahan", ayahCount: 18 },
  { number: 65, nameArabic: "الطلاق", nameLatin: "At-Talaq", meaningIndonesia: "Talak", ayahCount: 12 },
  { number: 66, nameArabic: "التحريم", nameLatin: "At-Tahrim", meaningIndonesia: "Pengharaman", ayahCount: 12 },
  { number: 67, nameArabic: "الملك", nameLatin: "Al-Mulk", meaningIndonesia: "Kerajaan", ayahCount: 30 },
  { number: 68, nameArabic: "القلم", nameLatin: "Al-Qalam", meaningIndonesia: "Pena", ayahCount: 52 },
  { number: 69, nameArabic: "الحاقة", nameLatin: "Al-Haqqah", meaningIndonesia: "Hari Kiamat", ayahCount: 52 },
  { number: 70, nameArabic: "المعارج", nameLatin: "Al-Ma'arij", meaningIndonesia: "Tempat-Tempat Naik", ayahCount: 44 },
  { number: 71, nameArabic: "نوح", nameLatin: "Nuh", meaningIndonesia: "Nabi Nuh", ayahCount: 28 },
  { number: 72, nameArabic: "الجن", nameLatin: "Al-Jinn", meaningIndonesia: "Jin", ayahCount: 28 },
  { number: 73, nameArabic: "المزمل", nameLatin: "Al-Muzzammil", meaningIndonesia: "Orang Yang Berselimut", ayahCount: 20 },
  { number: 74, nameArabic: "المدثر", nameLatin: "Al-Muddassir", meaningIndonesia: "Orang Yang Berkemul", ayahCount: 56 },
  { number: 75, nameArabic: "القيامة", nameLatin: "Al-Qiyamah", meaningIndonesia: "Hari Kiamat", ayahCount: 40 },
  { number: 76, nameArabic: "الإنسان", nameLatin: "Al-Insan", meaningIndonesia: "Manusia", ayahCount: 31 },
  { number: 77, nameArabic: "المرسلات", nameLatin: "Al-Mursalat", meaningIndonesia: "Malaikat Yang Diutus", ayahCount: 50 },
  { number: 78, nameArabic: "النبأ", nameLatin: "An-Naba'", meaningIndonesia: "Berita Besar", ayahCount: 40 },
  { number: 79, nameArabic: "النازعات", nameLatin: "An-Nazi'at", meaningIndonesia: "Malaikat Yang Mencabut", ayahCount: 46 },
  { number: 80, nameArabic: "عبس", nameLatin: "'Abasa", meaningIndonesia: "Ia Bermuka Masam", ayahCount: 42 },
  { number: 81, nameArabic: "التكوير", nameLatin: "At-Takwir", meaningIndonesia: "Menggulung", ayahCount: 29 },
  { number: 82, nameArabic: "الانفطار", nameLatin: "Al-Infitar", meaningIndonesia: "Terbelah", ayahCount: 19 },
  { number: 83, nameArabic: "المطففين", nameLatin: "Al-Mutaffifin", meaningIndonesia: "Orang-Orang Yang Curang", ayahCount: 36 },
  { number: 84, nameArabic: "الانشقاق", nameLatin: "Al-Insyiqaq", meaningIndonesia: "Terbelah", ayahCount: 25 },
  { number: 85, nameArabic: "البروج", nameLatin: "Al-Buruj", meaningIndonesia: "Gugusan Bintang", ayahCount: 22 },
  { number: 86, nameArabic: "الطارق", nameLatin: "At-Tariq", meaningIndonesia: "Yang Datang Di Malam Hari", ayahCount: 17 },
  { number: 87, nameArabic: "الأعلى", nameLatin: "Al-A'la", meaningIndonesia: "Yang Paling Tinggi", ayahCount: 19 },
  { number: 88, nameArabic: "الغاشية", nameLatin: "Al-Gasyiyah", meaningIndonesia: "Hari Pembalasan", ayahCount: 26 },
  { number: 89, nameArabic: "الفجر", nameLatin: "Al-Fajr", meaningIndonesia: "Fajar", ayahCount: 30 },
  { number: 90, nameArabic: "البلد", nameLatin: "Al-Balad", meaningIndonesia: "Negeri", ayahCount: 20 },
  { number: 91, nameArabic: "الشمس", nameLatin: "Asy-Syams", meaningIndonesia: "Matahari", ayahCount: 15 },
  { number: 92, nameArabic: "الليل", nameLatin: "Al-Lail", meaningIndonesia: "Malam", ayahCount: 21 },
  { number: 93, nameArabic: "الضحى", nameLatin: "Ad-Duha", meaningIndonesia: "Waktu Dhuha", ayahCount: 11 },
  { number: 94, nameArabic: "الشرح", nameLatin: "Asy-Syarh", meaningIndonesia: "Melapangkan", ayahCount: 8 },
  { number: 95, nameArabic: "التين", nameLatin: "At-Tin", meaningIndonesia: "Buah Tin", ayahCount: 8 },
  { number: 96, nameArabic: "العلق", nameLatin: "Al-'Alaq", meaningIndonesia: "Segumpal Darah", ayahCount: 19 },
  { number: 97, nameArabic: "القدر", nameLatin: "Al-Qadr", meaningIndonesia: "Kemuliaan", ayahCount: 5 },
  { number: 98, nameArabic: "البينة", nameLatin: "Al-Bayyinah", meaningIndonesia: "Bukti Nyata", ayahCount: 8 },
  { number: 99, nameArabic: "الزلزلة", nameLatin: "Az-Zalzalah", meaningIndonesia: "Guncangan", ayahCount: 8 },
  { number: 100, nameArabic: "العاديات", nameLatin: "Al-'Adiyat", meaningIndonesia: "Kuda Perang Yang Berlari Kencang", ayahCount: 11 },
  { number: 101, nameArabic: "القارعة", nameLatin: "Al-Qari'ah", meaningIndonesia: "Hari Kiamat", ayahCount: 11 },
  { number: 102, nameArabic: "التكاثر", nameLatin: "At-Takasur", meaningIndonesia: "Bermegah-Megahan", ayahCount: 8 },
  { number: 103, nameArabic: "العصر", nameLatin: "Al-'Asr", meaningIndonesia: "Masa / Waktu", ayahCount: 3 },
  { number: 104, nameArabic: "الهمزة", nameLatin: "Al-Humazah", meaningIndonesia: "Pengumpat", ayahCount: 9 },
  { number: 105, nameArabic: "الفيل", nameLatin: "Al-Fil", meaningIndonesia: "Gajah", ayahCount: 5 },
  { number: 106, nameArabic: "قريش", nameLatin: "Quraisy", meaningIndonesia: "Suku Quraisy", ayahCount: 4 },
  { number: 107, nameArabic: "الماعون", nameLatin: "Al-Ma'un", meaningIndonesia: "Barang-Barang Yang Berguna", ayahCount: 7 },
  { number: 108, nameArabic: "الكوثر", nameLatin: "Al-Kausar", meaningIndonesia: "Nikmat Yang Berlimpah", ayahCount: 3 },
  { number: 109, nameArabic: "الكافرون", nameLatin: "Al-Kafirun", meaningIndonesia: "Orang-Orang Kafir", ayahCount: 6 },
  { number: 110, nameArabic: "النصر", nameLatin: "An-Nasr", meaningIndonesia: "Pertolongan", ayahCount: 3 },
  { number: 111, nameArabic: "المسد", nameLatin: "Al-Masad", meaningIndonesia: "Sabut (Gejolak Api)", ayahCount: 5 },
  { number: 112, nameArabic: "الإخلاص", nameLatin: "Al-Ikhlas", meaningIndonesia: "Ikhlas / Memurnikan Keesaan Allah", ayahCount: 4 },
  { number: 113, nameArabic: "الفلق", nameLatin: "Al-Falaq", meaningIndonesia: "Waktu Subuh", ayahCount: 5 },
  { number: 114, nameArabic: "الناس", nameLatin: "An-Nas", meaningIndonesia: "Manusia", ayahCount: 6 },
];

/**
 * Build the full surah list, deriving juz segments from the authoritative
 * juz boundary table so the two data sources can never drift apart.
 */
function buildSurahs(seeds: SurahSeed[]): Surah[] {
  // Map each (surah, ayah) to a juz using the ordered start-point table.
  // JUZ_START_POINTS[j] = { surah, ayah } where juz (j+1) begins.
  const juzForPosition = (surah: number, ayah: number): number => {
    let current = 1;
    for (let j = 0; j < JUZ_START_POINTS.length; j += 1) {
      const start = JUZ_START_POINTS[j];
      const afterStart =
        surah > start.surah || (surah === start.surah && ayah >= start.ayah);
      if (afterStart) {
        current = j + 1;
      } else {
        break;
      }
    }
    return current;
  };

  return seeds.map((seed): Surah => {
    const segments: JuzSegment[] = [];
    let segStart = 1;
    let segJuz = juzForPosition(seed.number, 1);

    for (let ayah = 2; ayah <= seed.ayahCount; ayah += 1) {
      const j = juzForPosition(seed.number, ayah);
      if (j !== segJuz) {
        segments.push({ juz: segJuz, startAyah: segStart, endAyah: ayah - 1 });
        segStart = ayah;
        segJuz = j;
      }
    }
    segments.push({ juz: segJuz, startAyah: segStart, endAyah: seed.ayahCount });

    return {
      number: seed.number,
      nameArabic: seed.nameArabic,
      nameLatin: seed.nameLatin,
      meaningIndonesia: seed.meaningIndonesia,
      ayahCount: seed.ayahCount,
      startJuz: segments[0].juz,
      endJuz: segments[segments.length - 1].juz,
      juzSegments: segments,
    };
  });
}

export const SURAHS: Surah[] = buildSurahs(SURAH_SEEDS);

/** Total ayahs across the mushaf under the Kufan (Hafs) standard: 6236. */
export const TOTAL_AYAHS = SURAHS.reduce((sum, s) => sum + s.ayahCount, 0);

/** Expected total under the chosen standard; used by validation + tests. */
export const EXPECTED_TOTAL_AYAHS = 6236;

const SURAH_BY_NUMBER = new Map<number, Surah>(SURAHS.map((s) => [s.number, s]));

export function getSurah(number: number): Surah | undefined {
  return SURAH_BY_NUMBER.get(number);
}

export { TOTAL_JUZ };
