import {
  ComplaintCategory,
  ComplaintStat,
  NegativeSpikeAlert,
  PeriodKey,
  SentimentAnalysisResult,
  SentimentType,
  SocialComment,
  TopicStat,
  TrendPoint,
} from '../types/sentiment';

const POSITIVE_PHRASES: Record<string, number> = {
  'seru banget': 2.5,
  'keren banget': 2.5,
  'bagus banget': 2.5,
  'sangat membantu': 2.2,
  'sangat jelas': 2.0,
  'sangat informatif': 2.2,
  'berjalan lancar': 2.0,
  'acaranya menarik': 2.2,
  'panitia ramah': 2.0,
  'tertib dan rapi': 2.0,
  'luar biasa': 2.2,
  'terima kasih': 1.5,
  'top banget': 2.2,
  'sukses terus': 1.8,
  'paling berkesan': 2.0,
};

const NEGATIVE_PHRASES: Record<string, number> = {
  'kurang jelas': -2.4,
  'tidak jelas': -2.4,
  'nggak jelas': -2.4,
  'gak jelas': -2.4,
  'kurang rapi': -2.0,
  'kurang koordinasi': -2.2,
  'sering error': -2.4,
  'susah diakses': -2.2,
  'terlalu lama': -1.8,
  'telat banget': -2.2,
  'panas banget': -2.0,
  'antri panjang': -2.0,
  'antre panjang': -2.0,
  'tidak sesuai': -2.0,
  'nggak sesuai': -2.0,
  'membingungkan sekali': -2.3,
  'minim informasi': -2.2,
  'sulit dihubungi': -2.0,
  'kurang memadai': -2.0,
  'belum ada kejelasan': -2.2,
};

const POSITIVE_WORDS: Record<string, number> = {
  seru: 1.6,
  menarik: 1.5,
  bagus: 1.5,
  keren: 1.6,
  mantap: 1.6,
  membantu: 1.4,
  ramah: 1.5,
  jelas: 1.2,
  tertib: 1.4,
  sukses: 1.6,
  inspiratif: 1.7,
  bangga: 1.6,
  puas: 1.6,
  rapi: 1.4,
  top: 1.4,
  terbaik: 1.8,
  lancar: 1.4,
  informatif: 1.5,
  asik: 1.5,
  asyik: 1.5,
  apresiasi: 1.5,
  hebat: 1.5,
  nyaman: 1.5,
  senang: 1.5,
  suka: 1.3,
  semangat: 1.3,
  kreatif: 1.5,
  kompak: 1.4,
  solutif: 1.5,
  berkesan: 1.6,
  meriah: 1.5,
  oke: 1.0,
  baik: 1.2,
  cepat: 1.1,
  mudah: 1.2,
  efektif: 1.3,
  memuaskan: 1.7,
  antusias: 1.4,
  mendukung: 1.3,
  dukung: 1.3,
  positif: 1.2,
  rekomendasi: 1.3,
  kerjasama: 1.1,
  profesional: 1.5,
};

const NEGATIVE_WORDS: Record<string, number> = {
  kecewa: -1.8,
  buruk: -1.8,
  jelek: -1.7,
  telat: -1.5,
  terlambat: -1.5,
  bingung: -1.5,
  membingungkan: -1.7,
  ribet: -1.6,
  parah: -1.8,
  lambat: -1.5,
  lelet: -1.6,
  susah: -1.5,
  sulit: -1.4,
  error: -1.7,
  gangguan: -1.5,
  rusak: -1.7,
  mahal: -1.4,
  panas: -1.3,
  antri: -1.4,
  antre: -1.4,
  membosankan: -1.7,
  bosan: -1.4,
  kacau: -1.9,
  keluhan: -1.5,
  mengeluh: -1.5,
  protes: -1.7,
  minim: -1.3,
  gagal: -1.8,
  padat: -1.1,
  sesak: -1.5,
  berantakan: -1.8,
  galak: -1.7,
  jutek: -1.7,
  kasar: -1.8,
  menyesal: -1.7,
  payah: -1.7,
  hancur: -1.9,
  batal: -1.4,
  ngaret: -1.6,
  molor: -1.6,
  macet: -1.3,
  kotor: -1.6,
  basi: -1.8,
  kelaparan: -1.6,
  kurang: -1.0,
  masalah: -1.3,
  kendala: -1.3,
  negatif: -1.3,
  kesal: -1.6,
  marah: -1.7,
  capek: -1.1,
};

const NEGATIONS = new Set(['tidak', 'nggak', 'gak', 'ga', 'tak', 'bukan', 'belum', 'kurang', 'jangan', 'tanpa']);
const INTENSIFIERS = new Set(['banget', 'sangat', 'sekali', 'amat', 'terlalu', 'bgt', 'benar-benar', 'sungguh']);

const COMPLAINT_RULES: Array<{ category: ComplaintCategory; keywords: string[] }> = [
  {
    category: 'Informasi Kegiatan',
    keywords: ['informasi', 'info', 'pengumuman', 'aturan', 'panduan', 'bingung', 'membingungkan', 'jelas', 'pedoman', 'sosialisasi', 'surat'],
  },
  {
    category: 'Teknis Pendaftaran',
    keywords: ['website', 'web', 'portal', 'siakad', 'link', 'tautan', 'aplikasi', 'login', 'daftar', 'pendaftaran', 'registrasi', 'error', 'server', 'presensi', 'absen', 'qr', 'krs'],
  },
  {
    category: 'Fasilitas Kampus',
    keywords: ['ruang', 'aula', 'ac', 'panas', 'sesak', 'kursi', 'parkir', 'toilet', 'konsumsi', 'makan', 'minum', 'snack', 'air', 'basi', 'antri', 'antre', 'fasilitas'],
  },
  {
    category: 'Jadwal & Koordinasi',
    keywords: ['jadwal', 'waktu', 'jam', 'telat', 'terlambat', 'ngaret', 'molor', 'koordinasi', 'mundur', 'berubah', 'mendadak', 'rundown'],
  },
  {
    category: 'Pelayanan Panitia',
    keywords: ['panitia', 'komdis', 'kakak', 'mentor', 'admin', 'humas', 'respon', 'respons', 'balas', 'galak', 'jutek', 'kasar', 'dihubungi', 'sikap'],
  },
];

const TOPIC_RULES: Array<{ topic: string; keywords: string[] }> = [
  {
    topic: 'PKKMB UNJ',
    keywords: ['pkkmb', 'acara', 'seru', 'narasumber', 'materi', 'talkshow', 'expo', 'ukm', 'pembukaan', 'informasi', 'kegiatan', 'panitia', 'maba'],
  },
  {
    topic: 'Jadwal KRS',
    keywords: ['krs', 'siakad', 'jadwal', 'registrasi', 'pendaftaran', 'daftar', 'portal', 'login', 'presensi', 'error'],
  },
  {
    topic: 'Fasilitas Kampus',
    keywords: ['aula', 'gedung', 'ac', 'panas', 'konsumsi', 'makan', 'snack', 'minum', 'parkir', 'fasilitas', 'tempat', 'kursi'],
  },
  {
    topic: 'Layanan Humas',
    keywords: ['humas', 'admin', 'mentor', 'panduan', 'twibbon', 'publikasi', 'siaran'],
  },
];

function detectTopic(lowerText: string): string {
  let bestTopic = 'PKKMB UNJ';
  let bestScore = 0;

  for (const rule of TOPIC_RULES) {
    let matches = 0;
    for (const kw of rule.keywords) {
      if (lowerText.includes(kw)) {
        matches += 1;
      }
    }
    if (matches > bestScore) {
      bestScore = matches;
      bestTopic = rule.topic;
    }
  }

  return bestTopic;
}

function detectComplaintCategory(lowerText: string): ComplaintCategory {
  let bestCategory: ComplaintCategory = 'Informasi Kegiatan';
  let bestScore = 0;

  for (const rule of COMPLAINT_RULES) {
    let matches = 0;
    for (const kw of rule.keywords) {
      if (lowerText.includes(kw)) {
        matches += 1;
      }
    }
    if (matches > bestScore) {
      bestScore = matches;
      bestCategory = rule.category;
    }
  }

  return bestCategory;
}

export function analyzeIndonesianSentiment(rawText: string): SentimentAnalysisResult {
  const cleaned = rawText.trim();
  const lower = cleaned.toLowerCase();
  const tokens = lower
    .replace(/[^\p{L}\p{N}\s-]/gu, ' ')
    .split(/\s+/)
    .filter(Boolean);

  let score = 0;
  const positiveHits: string[] = [];
  const negativeHits: string[] = [];
  const neutralSignals: string[] = [];

  const consumedPhrases = new Set<string>();
  for (const [phrase, weight] of Object.entries(POSITIVE_PHRASES)) {
    if (lower.includes(phrase)) {
      score += weight;
      positiveHits.push(phrase);
      phrase.split(' ').forEach((w) => consumedPhrases.add(w));
    }
  }
  for (const [phrase, weight] of Object.entries(NEGATIVE_PHRASES)) {
    if (lower.includes(phrase)) {
      score += weight;
      negativeHits.push(phrase);
      phrase.split(' ').forEach((w) => consumedPhrases.add(w));
    }
  }

  for (let i = 0; i < tokens.length; i += 1) {
    const word = tokens[i];
    if (consumedPhrases.has(word)) {
      continue;
    }

    const prevWord = i > 0 ? tokens[i - 1] : '';
    const nextWord = i < tokens.length - 1 ? tokens[i + 1] : '';
    const hasNegation = NEGATIONS.has(prevWord);
    const hasIntensifier = INTENSIFIERS.has(prevWord) || INTENSIFIERS.has(nextWord);
    const multiplier = hasIntensifier ? 1.35 : 1;

    if (word in POSITIVE_WORDS) {
      const base = POSITIVE_WORDS[word] * multiplier;
      if (hasNegation) {
        score -= base * 1.15;
        negativeHits.push(`${prevWord} ${word}`);
      } else {
        score += base;
        positiveHits.push(word);
      }
    } else if (word in NEGATIVE_WORDS) {
      const base = NEGATIVE_WORDS[word] * multiplier;
      if (hasNegation && prevWord !== 'kurang') {
        score += Math.abs(base) * 0.85;
        positiveHits.push(`${prevWord} ${word}`);
      } else {
        score += base;
        negativeHits.push(hasNegation ? `${prevWord} ${word}` : word);
      }
    }
  }

  const informativeMarkers = ['dilaksanakan', 'jadwal', 'tanggal', 'bulan', 'lokasi', 'bertempat', 'pukul', 'jam', 'hari', 'peserta', 'semoga'];
  for (const marker of informativeMarkers) {
    if (lower.includes(marker)) {
      neutralSignals.push(marker);
    }
  }

  // Handle neutral hopeful statements like "Semoga tahun depan lebih baik"
  if (lower.includes('semoga') && score > 0 && score < 1.5 && negativeHits.length === 0) {
    score = 0.3;
  }

  let sentiment: SentimentType = 'Netral';
  if (score >= 0.9) {
    sentiment = 'Positif';
  } else if (score <= -0.8) {
    sentiment = 'Negatif';
  } else {
    sentiment = 'Netral';
  }

  const topic = detectTopic(lower);
  const complaintCategory = sentiment === 'Negatif' ? detectComplaintCategory(lower) : undefined;

  let explanation = '';
  if (sentiment === 'Positif') {
    explanation =
      positiveHits.length > 0
        ? `Teridentifikasi ungkapan dukungan dan kepuasan melalui kata kunci: ${Array.from(new Set(positiveHits)).slice(0, 4).join(', ')}.`
        : 'Komentar menunjukkan apresiasi atau respons baik terhadap kegiatan.';
  } else if (sentiment === 'Negatif') {
    explanation =
      negativeHits.length > 0
        ? `Teridentifikasi kritik atau keluhan melalui kata kunci: ${Array.from(new Set(negativeHits)).slice(0, 4).join(', ')}.`
        : 'Komentar mengandung nada ketidakpuasan atau kendala operasional.';
  } else {
    explanation =
      neutralSignals.length > 0
        ? `Komentar bersifat informatif atau netral (memuat kata: ${Array.from(new Set(neutralSignals)).slice(0, 3).join(', ')}) tanpa kecenderungan emosi kuat.`
        : 'Tidak ditemukan ekspresi pujian maupun keluhan yang dominan sehingga diklasifikasikan sebagai Netral.';
  }

  return {
    sentiment,
    score: Number(score.toFixed(2)),
    positiveHits: Array.from(new Set(positiveHits)),
    negativeHits: Array.from(new Set(negativeHits)),
    neutralSignals: Array.from(new Set(neutralSignals)),
    topic,
    complaintCategory,
    explanation,
  };
}

export const REFERENCE_TODAY = '2026-11-25';

export function filterCommentsByPeriod(comments: SocialComment[], period: PeriodKey): SocialComment[] {
  if (period === 'all') {
    return comments;
  }
  const refDate = new Date(`${REFERENCE_TODAY}T23:59:59`);
  const daysMap: Record<Exclude<PeriodKey, 'all'>, number> = {
    '7d': 7,
    '14d': 14,
    '30d': 30,
  };
  const cutoff = new Date(refDate);
  cutoff.setDate(cutoff.getDate() - (daysMap[period] - 1));
  cutoff.setHours(0, 0, 0, 0);

  return comments.filter((c) => {
    const d = new Date(`${c.dateISO}T12:00:00`);
    return d >= cutoff && d <= refDate;
  });
}

export function getPeriodLabel(period: PeriodKey): string {
  switch (period) {
    case '7d':
      return '7 Hari Terakhir';
    case '14d':
      return '14 Hari Terakhir';
    case '30d':
      return '30 Hari Terakhir';
    case 'all':
      return 'Semua Periode';
  }
}

export function computeSentimentStats(comments: SocialComment[]) {
  const total = comments.length;
  const positif = comments.filter((c) => c.sentiment === 'Positif').length;
  const negatif = comments.filter((c) => c.sentiment === 'Negatif').length;
  const netral = comments.filter((c) => c.sentiment === 'Netral').length;

  const pct = (n: number) => (total === 0 ? 0 : Math.round((n / total) * 100));
  const positifPct = pct(positif);
  const negatifPct = pct(negatif);
  const netralPct = total === 0 ? 0 : Math.max(0, 100 - positifPct - negatifPct);

  return {
    total,
    positif,
    negatif,
    netral,
    positifPct,
    negatifPct,
    netralPct,
  };
}

export function computeTrendSeries(comments: SocialComment[]): TrendPoint[] {
  const grouped = new Map<string, { positif: number; negatif: number; netral: number }>();

  for (const c of comments) {
    const existing = grouped.get(c.dateISO) ?? { positif: 0, negatif: 0, netral: 0 };
    if (c.sentiment === 'Positif') existing.positif += 1;
    else if (c.sentiment === 'Negatif') existing.negatif += 1;
    else existing.netral += 1;
    grouped.set(c.dateISO, existing);
  }

  return Array.from(grouped.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([dateISO, counts]) => {
      const [, m, d] = dateISO.split('-');
      const total = counts.positif + counts.negatif + counts.netral;
      const positifPct = total ? Math.round((counts.positif / total) * 100) : 0;
      const negatifPct = total ? Math.round((counts.negatif / total) * 100) : 0;
      const netralPct = total ? Math.max(0, 100 - positifPct - negatifPct) : 0;

      return {
        dateISO,
        label: `${d}/${m}`,
        positif: counts.positif,
        negatif: counts.negatif,
        netral: counts.netral,
        total,
        positifPct,
        negatifPct,
        netralPct,
      };
    });
}

export function computeTopicStats(comments: SocialComment[]): TopicStat[] {
  const map = new Map<string, { positif: number; negatif: number; netral: number }>();

  for (const c of comments) {
    const entry = map.get(c.topic) ?? { positif: 0, negatif: 0, netral: 0 };
    if (c.sentiment === 'Positif') entry.positif += 1;
    else if (c.sentiment === 'Negatif') entry.negatif += 1;
    else entry.netral += 1;
    map.set(c.topic, entry);
  }

  const grandTotal = comments.length || 1;

  return Array.from(map.entries())
    .map(([topic, counts]) => {
      const total = counts.positif + counts.negatif + counts.netral;
      let dominantSentiment: SentimentType = 'Netral';
      if (counts.positif >= counts.negatif && counts.positif >= counts.netral) {
        dominantSentiment = 'Positif';
      } else if (counts.negatif > counts.positif && counts.negatif >= counts.netral) {
        dominantSentiment = 'Negatif';
      }
      return {
        topic,
        total,
        positif: counts.positif,
        negatif: counts.negatif,
        netral: counts.netral,
        dominantSentiment,
        sharePercent: Math.round((total / grandTotal) * 100),
      };
    })
    .sort((a, b) => b.total - a.total);
}

export function computeComplaintStats(comments: SocialComment[]): ComplaintStat[] {
  const negatives = comments.filter((c) => c.sentiment === 'Negatif');
  const map = new Map<ComplaintCategory, number>();

  for (const c of negatives) {
    const cat = c.complaintCategory ?? detectComplaintCategory(c.content.toLowerCase());
    map.set(cat, (map.get(cat) ?? 0) + 1);
  }

  const totalNeg = negatives.length || 1;

  return Array.from(map.entries())
    .map(([category, count]) => ({
      category,
      count,
      sharePercent: Math.round((count / totalNeg) * 100),
    }))
    .sort((a, b) => b.count - a.count);
}

export function computeNegativeAlerts(comments: SocialComment[]): NegativeSpikeAlert[] {
  const trend = computeTrendSeries(comments);
  const complaints = computeComplaintStats(comments);
  const topCat = complaints[0]?.category ?? 'Informasi Kegiatan';
  const negativesCount = comments.filter((c) => c.sentiment === 'Negatif').length;

  const alerts: NegativeSpikeAlert[] = [];

  if (trend.length >= 2) {
    const latest = trend[trend.length - 1];
    const previous = trend[trend.length - 2];
    if (latest.negatif >= previous.negatif && latest.negatif >= 2) {
      const increase =
        previous.negatif === 0
          ? 20
          : Math.max(20, Math.round(((latest.negatif - previous.negatif) / previous.negatif) * 100));
      alerts.push({
        id: `spike-${latest.dateISO}`,
        title: `Perhatian!`,
        description: `Komentar negatif meningkat ${increase}% pada ${previous.label.split('/')[0]}–${latest.label.split('/')[0]} Nov (kategori terbanyak: ${topCat}).`,
        increasePercent: increase,
        topCategory: topCat,
        dateLabel: `${previous.label}–${latest.label}`,
        read: false,
      });
    }
  }

  if (negativesCount >= 5 && alerts.length === 0) {
    alerts.push({
      id: 'threshold-complaint',
      title: `Perhatian!`,
      description: `Terdapat ${negativesCount} komentar negatif aktif pada periode ini, dominan pada isu ${topCat}.`,
      increasePercent: complaints[0]?.sharePercent ?? 35,
      topCategory: topCat,
      dateLabel: 'Pemantauan Aktif',
      read: false,
    });
  }

  return alerts;
}
