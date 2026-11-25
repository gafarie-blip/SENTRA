import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  Check,
  ChevronDown,
  Heart,
  MessageCircle,
  MessageSquarePlus,
  MoreHorizontal,
  RotateCcw,
  Search,
  Send,
  User,
} from 'lucide-react';
import {
  ComplaintCategory,
  PlatformType,
  SentimentAnalysisResult,
  SentimentType,
  SocialComment,
} from '../types/sentiment';
import {
  analyzeIndonesianSentiment,
  computeComplaintStats,
} from '../utils/sentimentAnalyzer';

interface CommentsPageProps {
  comments: SocialComment[];
  selectedSentiment: SentimentType | 'Semua';
  onSelectedSentimentChange: (s: SentimentType | 'Semua') => void;
  selectedTopic: string;
  onSelectedTopicChange: (topic: string) => void;
  onAddComment: (comment: SocialComment) => void;
}

const SAMPLE_INPUTS: Array<{ label: string; text: string }> = [
  {
    label: 'Contoh Positif',
    text: 'PKKMB UNJ tahun ini seru banget, acaranya menarik!',
  },
  {
    label: 'Contoh Negatif',
    text: 'Informasi kegiatan masih kurang jelas.',
  },
  {
    label: 'Contoh Netral',
    text: 'PKKMB UNJ dilaksanakan pada bulan November.',
  },
];

const PLATFORMS: PlatformType[] = ['Instagram', 'X', 'TikTok', 'YouTube', 'Facebook'];

const getSentimentPillStyle = (sentiment: SentimentType) => {
  if (sentiment === 'Positif') return 'bg-[#DDF3E4] text-[#287D4B]';
  if (sentiment === 'Negatif') return 'bg-[#FBE2E2] text-[#C23B3B]';
  return 'bg-[#E9EDF4] text-[#4C5A70]';
};

export const CommentsPage: React.FC<CommentsPageProps> = ({
  comments,
  selectedSentiment,
  onSelectedSentimentChange,
  selectedTopic,
  onSelectedTopicChange,
  onAddComment,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState<PlatformType | 'Semua'>('Semua');
  const [complaintFilter, setComplaintFilter] = useState<ComplaintCategory | 'Semua'>('Semua');
  const [showAllComplaints, setShowAllComplaints] = useState(false);

  // Automatic sentiment analyzer state (Prompt Revisi)
  const [draftText, setDraftText] = useState('');
  const [draftPlatform, setDraftPlatform] = useState<PlatformType>('Instagram');
  const [draftAccount, setDraftAccount] = useState('@publik_unj');
  const [analysisResult, setAnalysisResult] = useState<SentimentAnalysisResult | null>(null);
  const [analyzedTextSnapshot, setAnalyzedTextSnapshot] = useState('');
  const [inputError, setInputError] = useState('');
  const [savedNotice, setSavedNotice] = useState(false);

  const complaintStats = useMemo(() => computeComplaintStats(comments), [comments]);

  const filteredComments = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return comments.filter((c) => {
      if (selectedSentiment !== 'Semua' && c.sentiment !== selectedSentiment) return false;
      if (platformFilter !== 'Semua' && c.platform !== platformFilter) return false;
      if (selectedTopic && c.topic !== selectedTopic) return false;
      if (complaintFilter !== 'Semua' && c.complaintCategory !== complaintFilter) return false;
      if (q) {
        const hay = `${c.content} ${c.account} ${c.displayName} ${c.topic} ${c.platform}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [comments, selectedSentiment, platformFilter, selectedTopic, complaintFilter, searchQuery]);

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = draftText.trim();
    if (!trimmed) {
      setInputError('Silakan masukkan komentar terlebih dahulu untuk dianalisis.');
      setAnalysisResult(null);
      return;
    }
    setInputError('');
    setSavedNotice(false);
    const result = analyzeIndonesianSentiment(trimmed);
    setAnalysisResult(result);
    setAnalyzedTextSnapshot(trimmed);
  };

  const handleSaveAnalyzedComment = () => {
    if (!analysisResult || !analyzedTextSnapshot) return;
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const formattedAccount = draftAccount.trim().startsWith('@')
      ? draftAccount.trim()
      : `@${draftAccount.trim() || 'publik_unj'}`;

    const newEntry: SocialComment = {
      id: `cmt-user-${Date.now()}`,
      account: formattedAccount,
      displayName: formattedAccount.replace('@', ''),
      platform: draftPlatform,
      content: analyzedTextSnapshot,
      sentiment: analysisResult.sentiment,
      topic: analysisResult.topic,
      complaintCategory: analysisResult.complaintCategory,
      dateISO: '2026-11-25',
      timeLabel: `${hh}:${mm}`,
      relativeTime: 'Baru saja',
      likes: 1,
      replies: 0,
      isUserAdded: true,
    };

    onAddComment(newEntry);
    setSavedNotice(true);
    setDraftText('');
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    onSelectedSentimentChange('Semua');
    setPlatformFilter('Semua');
    onSelectedTopicChange('');
    setComplaintFilter('Semua');
  };

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedSentiment !== 'Semua' ||
    platformFilter !== 'Semua' ||
    selectedTopic !== '' ||
    complaintFilter !== 'Semua';

  const displayedComplaints = showAllComplaints
    ? complaintStats
    : complaintStats.slice(0, 3);

  return (
    <div className="space-y-5">
      {/* Sentiment Filter Pill Bar matching SENTRA Voice */}
      <div className="flex flex-wrap items-center gap-2">
        {(['Semua', 'Positif', 'Negatif', 'Netral'] as const).map((tab) => {
          const active = selectedSentiment === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => {
                onSelectedSentimentChange(tab);
                if (tab !== 'Negatif') setComplaintFilter('Semua');
              }}
              className={`rounded-full px-5 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                active
                  ? 'bg-[#213358] text-white shadow-2xs'
                  : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Search & Platform Filter Bar matching SENTRA Voice */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari komentar..."
            aria-label="Cari komentar"
            className="w-full rounded-full border border-slate-200 bg-white pl-11 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#213358] focus:outline-none"
          />
        </div>

        <div className="relative">
          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value as PlatformType | 'Semua')}
            aria-label="Filter kanal media sosial"
            className="appearance-none rounded-full border border-slate-200 bg-white pl-4 pr-9 py-2.5 text-xs font-semibold text-[#213358] focus:border-[#213358] focus:outline-none cursor-pointer"
          >
            <option value="Semua">Filter: Semua</option>
            {PLATFORMS.map((p) => (
              <option key={p} value={p}>
                Kanal: {p}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500"
            aria-hidden="true"
          />
        </div>
      </div>

      {/* Active Topic / Complaint Banner */}
      {(selectedTopic || complaintFilter !== 'Semua') && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-sky-200 bg-sky-50 px-4 py-2.5 text-xs text-[#213358]">
          <span>
            Filter aktif:{' '}
            <strong>
              {[selectedTopic, complaintFilter !== 'Semua' ? `Keluhan: ${complaintFilter}` : '']
                .filter(Boolean)
                .join(' · ')}
            </strong>
          </span>
          <button
            type="button"
            onClick={() => {
              onSelectedTopicChange('');
              setComplaintFilter('Semua');
            }}
            className="font-semibold text-sky-700 hover:underline"
          >
            Hapus Filter
          </button>
        </div>
      )}

      {/* Automatic Sentiment Analysis Module (Prompt Revisi) */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
          <div>
            <h2 className="text-sm font-bold text-[#213358]">
              Analisis Sentimen Otomatis
            </h2>
            <p className="text-xs text-slate-500">
              Masukkan komentar untuk mengidentifikasi kategori Positif, Negatif, atau Netral secara langsung.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {SAMPLE_INPUTS.map((sample) => (
              <button
                key={sample.label}
                type="button"
                onClick={() => {
                  setDraftText(sample.text);
                  setInputError('');
                  setSavedNotice(false);
                }}
                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-medium text-slate-700 hover:border-[#213358] hover:text-[#213358] transition-colors whitespace-nowrap"
              >
                {sample.label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleAnalyze} className="space-y-3">
          <div>
            <label htmlFor="comment-analyzer-input" className="sr-only">
              Masukkan komentar publik
            </label>
            <textarea
              id="comment-analyzer-input"
              rows={2}
              value={draftText}
              onChange={(e) => {
                setDraftText(e.target.value);
                if (inputError) setInputError('');
              }}
              placeholder="Tulis komentar publik di sini... (misal: PKKMB UNJ tahun ini seru banget, acaranya menarik!)"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#213358] focus:bg-white focus:outline-none"
            />
            {inputError && (
              <p className="mt-1 flex items-center gap-1.5 text-xs text-red-600">
                <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{inputError}</span>
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                value={draftAccount}
                onChange={(e) => setDraftAccount(e.target.value)}
                aria-label="Nama akun"
                className="w-32 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:border-[#213358] focus:outline-none"
              />
              <select
                value={draftPlatform}
                onChange={(e) => setDraftPlatform(e.target.value as PlatformType)}
                aria-label="Platform media sosial"
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:border-[#213358] focus:outline-none"
              >
                {PLATFORMS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-full bg-[#213358] px-5 py-2 text-xs font-semibold text-white hover:bg-[#192847] transition-colors whitespace-nowrap shrink-0"
            >
              <Send className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Analisis Sentimen</span>
            </button>
          </div>
        </form>

        {/* Live Analysis Result */}
        {analysisResult && (
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium text-slate-600">Hasil Kategori:</span>
                <span
                  className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-bold ${getSentimentPillStyle(
                    analysisResult.sentiment
                  )}`}
                >
                  {analysisResult.sentiment}
                </span>
                <span className="text-xs text-slate-500">· Topik: {analysisResult.topic}</span>
                {analysisResult.complaintCategory && (
                  <span className="text-xs font-medium text-red-700">
                    · Keluhan: {analysisResult.complaintCategory}
                  </span>
                )}
              </div>
              <p className="text-sm font-medium text-slate-800">&ldquo;{analyzedTextSnapshot}&rdquo;</p>
              <p className="text-xs text-slate-600">{analysisResult.explanation}</p>
            </div>

            <div className="shrink-0">
              {savedNotice ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#287D4B]">
                  <Check className="h-4 w-4" aria-hidden="true" />
                  <span>Tersimpan</span>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleSaveAnalyzedComment}
                  className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-[#213358] hover:bg-slate-100 transition-colors whitespace-nowrap"
                >
                  <MessageSquarePlus className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Simpan ke Daftar</span>
                </button>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Main Content Split: Comment Card Feed + Top Complaints */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Comment Feed Cards matching SENTRA Voice */}
        <div className="lg:col-span-8 space-y-3">
          {filteredComments.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <p className="text-sm font-semibold text-slate-700">
                Tidak ada komentar yang sesuai dengan filter.
              </p>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-[#213358] hover:bg-slate-100"
                >
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Reset Filter</span>
                </button>
              )}
            </div>
          ) : (
            filteredComments.map((cmt) => (
              <article
                key={cmt.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs transition-colors hover:border-slate-300"
              >
                <div className="flex items-start gap-3.5">
                  {/* Avatar circle */}
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-200/80 text-slate-500"
                    aria-hidden="true"
                  >
                    <User className="h-5 w-5" />
                  </div>

                  {/* Body */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs">
                        <span className="font-semibold text-[#213358]">{cmt.account}</span>
                        <span className="text-slate-400">·</span>
                        <span className="text-slate-500">{cmt.relativeTime}</span>
                        <span className="text-slate-400">·</span>
                        <span className="text-sky-700 font-medium">{cmt.platform}</span>
                      </div>

                      <span
                        className={`rounded-md px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap shrink-0 ${getSentimentPillStyle(
                          cmt.sentiment
                        )}`}
                      >
                        {cmt.sentiment}
                      </span>
                    </div>

                    <p className="mt-1.5 text-sm leading-relaxed text-slate-800">
                      {cmt.content}
                    </p>

                    <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                      <div className="flex items-center gap-4 tabular-nums">
                        <span className="inline-flex items-center gap-1.5">
                          <Heart className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                          <span>{cmt.likes}</span>
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <MessageCircle className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                          <span>{cmt.replies}</span>
                        </span>
                        <span className="text-slate-400 hidden sm:inline">
                          {cmt.topic}
                          {cmt.complaintCategory ? ` · ${cmt.complaintCategory}` : ''}
                        </span>
                      </div>

                      <MoreHorizontal className="h-4 w-4 text-slate-400" aria-hidden="true" />
                    </div>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>

        {/* Kategori Keluhan Terbanyak Card matching SENTRA Voice */}
        <aside className="lg:col-span-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-bold text-[#213358]">
              Kategori Keluhan Terbanyak
            </h2>
            <button
              type="button"
              onClick={() => setShowAllComplaints((v) => !v)}
              className="text-xs font-semibold text-sky-700 hover:underline whitespace-nowrap shrink-0"
            >
              {showAllComplaints ? 'Ringkas' : 'Lihat Semua →'}
            </button>
          </div>

          {displayedComplaints.length === 0 ? (
            <p className="text-xs text-slate-500">Belum ada keluhan tercatat.</p>
          ) : (
            <div className="space-y-3.5">
              {displayedComplaints.map((item) => {
                const isSelected = complaintFilter === item.category;
                return (
                  <button
                    key={item.category}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        setComplaintFilter('Semua');
                      } else {
                        setComplaintFilter(item.category);
                        onSelectedSentimentChange('Negatif');
                      }
                    }}
                    className={`w-full text-left rounded-xl p-2 -mx-2 transition-colors ${
                      isSelected ? 'bg-slate-100' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 text-xs mb-1.5">
                      <span className="font-medium text-slate-700 truncate">
                        {item.category}
                      </span>
                      <span className="font-bold text-[#213358] tabular-nums shrink-0">
                        {item.sharePercent}%
                      </span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#E6EAF2]">
                      <div
                        className="h-full rounded-full bg-[#314873] transition-all duration-300"
                        style={{ width: `${item.sharePercent}%` }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};
