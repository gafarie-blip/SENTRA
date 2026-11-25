export type SentimentType = 'Positif' | 'Negatif' | 'Netral';

export type PlatformType = 'Instagram' | 'X' | 'TikTok' | 'YouTube' | 'Facebook';

export type PeriodKey = '7d' | '14d' | '30d' | 'all';

export type PageTab = 'dashboard' | 'komentar' | 'laporan';

export type ComplaintCategory =
  | 'Informasi Kegiatan'
  | 'Teknis Pendaftaran'
  | 'Fasilitas Kampus'
  | 'Jadwal & Koordinasi'
  | 'Pelayanan Panitia';

export interface SocialComment {
  id: string;
  account: string;
  displayName: string;
  platform: PlatformType;
  content: string;
  sentiment: SentimentType;
  topic: string;
  complaintCategory?: ComplaintCategory;
  dateISO: string; // YYYY-MM-DD
  timeLabel: string; // HH:mm
  relativeTime: string;
  likes: number;
  replies: number;
  isUserAdded?: boolean;
}

export interface SentimentAnalysisResult {
  sentiment: SentimentType;
  score: number;
  positiveHits: string[];
  negativeHits: string[];
  neutralSignals: string[];
  topic: string;
  complaintCategory?: ComplaintCategory;
  explanation: string;
}

export interface TrendPoint {
  dateISO: string;
  label: string;
  positif: number;
  negatif: number;
  netral: number;
  total: number;
  positifPct: number;
  negatifPct: number;
  netralPct: number;
}

export interface TopicStat {
  topic: string;
  total: number;
  positif: number;
  negatif: number;
  netral: number;
  dominantSentiment: SentimentType;
  sharePercent: number;
}

export interface ComplaintStat {
  category: ComplaintCategory;
  count: number;
  sharePercent: number;
}

export interface NegativeSpikeAlert {
  id: string;
  title: string;
  description: string;
  increasePercent: number;
  topCategory: ComplaintCategory | string;
  dateLabel: string;
  read: boolean;
}
