import React, { useState } from 'react';
import {
  BarChart2,
  Calendar,
  Check,
  Download,
  FileText,
  Lightbulb,
  Printer,
  Star,
  TrendingUp,
} from 'lucide-react';
import { PeriodKey, SentimentType, SocialComment } from '../types/sentiment';
import {
  computeComplaintStats,
  computeSentimentStats,
  computeTopicStats,
  computeTrendSeries,
  getPeriodLabel,
} from '../utils/sentimentAnalyzer';
import {
  SentimentComparisonChart,
  SentimentDevelopmentChart,
} from './Charts';

interface ReportPageProps {
  comments: SocialComment[];
  period: PeriodKey;
  onPeriodChange: (period: PeriodKey) => void;
  onInspectSentiment: (sentiment: SentimentType) => void;
}

type ReportSubTab = 'ringkasan' | 'isu' | 'rekomendasi';

export const ReportPage: React.FC<ReportPageProps> = ({
  comments,
  period,
  onPeriodChange,
  onInspectSentiment,
}) => {
  const [subTab, setSubTab] = useState<ReportSubTab>('ringkasan');
  const [downloadStatus, setDownloadStatus] = useState<string | null>(null);

  const stats = computeSentimentStats(comments);
  const trend = computeTrendSeries(comments);
  const topics = computeTopicStats(comments);
  const complaints = computeComplaintStats(comments);

  const periodLabel = getPeriodLabel(period);
  const topTopic = topics[0]?.topic ?? 'PKKMB UNJ';
  const topComplaint = complaints[0]?.category ?? 'Teknis Pendaftaran';

  const summaryRecommendationText = `Pertahankan komunikasi positif terkait ${topTopic} (${stats.positifPct}% respons baik) dan perhatikan isu ${topComplaint.toLowerCase()} agar keluhan berkurang.`;

  const detailedRecommendations = [
    {
      priority: 'Tinggi',
      title: `Tindak Lanjut Keluhan ${topComplaint}`,
      action:
        'Publikasikan panduan ringkas, tautan cadangan presensi/registrasi, dan FAQ resmi di kanal Instagram Story serta X agar informasi mudah diakses.',
      channel: 'Instagram & X',
    },
    {
      priority: 'Sedang',
      title: 'Siaga Admin Humas pada Jam Puncak',
      action:
        'Jadwalkan tim respon cepat pukul 07.00–10.00 WIB untuk menjawab pertanyaan peserta seputar jadwal KRS, ruang gugus, dan fasilitas.',
      channel: 'DM & Kolom Komentar',
    },
    {
      priority: 'Terjadwal',
      title: `Penguatan Narasi Positif ${topTopic}`,
      action:
        'Angkat sorotan materi narasumber, keseruan Expo UKM, dan testimoni mahasiswa baru guna menjaga momentum opini positif.',
      channel: 'TikTok & YouTube',
    },
  ];

  const triggerToast = (msg: string) => {
    setDownloadStatus(msg);
    window.setTimeout(() => setDownloadStatus(null), 3500);
  };

  const handleDownloadCSV = () => {
    const header = [
      'ID',
      'Tanggal',
      'Waktu',
      'Platform',
      'Akun',
      'Topik',
      'Sentimen',
      'Kategori Keluhan',
      'Komentar',
    ];
    const escapeCell = (val: string) => `"${val.replace(/"/g, '""')}"`;

    const rows = comments.map((c) =>
      [
        c.id,
        c.dateISO,
        c.timeLabel,
        c.platform,
        c.account,
        c.topic,
        c.sentiment,
        c.complaintCategory ?? '-',
        c.content,
      ]
        .map(escapeCell)
        .join(',')
    );

    const csvContent = '\uFEFF' + [header.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `laporan-sentra-${period}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    triggerToast('Laporan CSV berhasil diunduh.');
  };

  const handleDownloadSummaryTxt = () => {
    const lines = [
      'LAPORAN EVALUASI SENTIMEN PUBLIK — SENTRA (HUMAS)',
      '========================================================',
      `Periode Pemantauan : ${periodLabel}`,
      `Total Komentar     : ${stats.total}`,
      `Sentimen Positif   : ${stats.positif} (${stats.positifPct}%)`,
      `Sentimen Negatif   : ${stats.negatif} (${stats.negatifPct}%)`,
      `Sentimen Netral    : ${stats.netral} (${stats.netralPct}%)`,
      '',
      'ISU DOMINAN:',
      ...topics.map(
        (t, idx) =>
          `${idx + 1}. ${t.topic} — ${t.total} komentar (${t.sharePercent}%) [Dominan: ${t.dominantSentiment}]`
      ),
      '',
      'REKOMENDASI KOMUNIKASI:',
      summaryRecommendationText,
      ...detailedRecommendations.map(
        (r, idx) => `${idx + 1}. [${r.priority}] ${r.title}: ${r.action} (${r.channel})`
      ),
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ringkasan-sentra-${period}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    triggerToast('Ringkasan laporan TXT berhasil diunduh.');
  };

  return (
    <div className="space-y-5">
      {/* Top Row: Sub-tabs + Period Dropdown matching SENTRA Insight */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {(
            [
              { key: 'ringkasan', label: 'Ringkasan' },
              { key: 'isu', label: 'Analisis Isu' },
              { key: 'rekomendasi', label: 'Rekomendasi' },
            ] as const
          ).map((t) => {
            const active = subTab === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setSubTab(t.key)}
                className={`rounded-full px-5 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  active
                    ? 'bg-[#213358] text-white shadow-2xs'
                    : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        <div className="relative self-start sm:self-auto no-print">
          <Calendar
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#213358]"
            aria-hidden="true"
          />
          <select
            value={period}
            onChange={(e) => onPeriodChange(e.target.value as PeriodKey)}
            aria-label="Pilih periode laporan"
            className="rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2 text-xs font-semibold text-[#213358] focus:border-[#213358] focus:outline-none cursor-pointer"
          >
            <option value="7d">7 Hari Terakhir</option>
            <option value="14d">14 Hari Terakhir</option>
            <option value="30d">30 Hari Terakhir</option>
            <option value="all">Semua Periode</option>
          </select>
        </div>
      </div>

      {downloadStatus && (
        <div
          role="status"
          className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-800"
        >
          <Check className="h-4 w-4" aria-hidden="true" />
          <span>{downloadStatus}</span>
        </div>
      )}

      {/* Ringkasan View (Matches SENTRA Insight Screen 3 composition) */}
      {subTab === 'ringkasan' && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Perbandingan Sentimen Donut Card */}
            <section className="lg:col-span-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
              <div className="flex items-center gap-2 mb-4">
                <BarChart2 className="h-4 w-4 text-[#213358]" aria-hidden="true" />
                <h2 className="text-sm font-bold text-[#213358]">
                  Perbandingan Sentimen
                </h2>
              </div>

              <SentimentComparisonChart
                positif={stats.positif}
                negatif={stats.negatif}
                netral={stats.netral}
                onSelectSentiment={onInspectSentiment}
              />
            </section>

            {/* Perkembangan Sentimen Area Line Card */}
            <section className="lg:col-span-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-[#213358]" aria-hidden="true" />
                  <h2 className="text-sm font-bold text-[#213358]">
                    Perkembangan Sentimen
                  </h2>
                </div>
                <span className="text-xs text-slate-400">{periodLabel}</span>
              </div>

              <SentimentDevelopmentChart
                data={trend}
                overallPositifPct={stats.positifPct}
              />
            </section>
          </div>

          {/* Bottom 2-Column Split: Isu Dominan + Rekomendasi */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
            <section className="md:col-span-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
              <div className="flex items-center gap-2 mb-3">
                <Star className="h-4 w-4 text-[#213358] fill-[#213358]" aria-hidden="true" />
                <h2 className="text-sm font-bold text-[#213358]">Isu Dominan</h2>
              </div>

              <ol className="space-y-2.5">
                {topics.slice(0, 4).map((t, idx) => (
                  <li key={t.topic} className="flex items-center justify-between gap-3 text-sm">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-200/80 text-[11px] font-bold text-[#213358] tabular-nums">
                        {idx + 1}
                      </span>
                      <span className="font-medium text-slate-800 truncate">{t.topic}</span>
                    </div>
                    <span className="text-xs font-mono text-slate-500 tabular-nums shrink-0">
                      {t.sharePercent}%
                    </span>
                  </li>
                ))}
              </ol>
            </section>

            <section className="md:col-span-7 rounded-2xl border border-[#F3E5AB] bg-[#FEF9E6] p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="h-4 w-4 text-[#C59316]" aria-hidden="true" />
                  <h2 className="text-sm font-bold text-[#213358]">Rekomendasi</h2>
                </div>
                <p className="text-sm leading-relaxed text-slate-700">
                  {summaryRecommendationText}
                </p>
              </div>
              <div className="mt-3 pt-3 border-t border-[#F0DF9B] flex items-center justify-between text-xs text-slate-600">
                <span>
                  Ringkasan: <strong className="text-[#213358]">{stats.total} komentar</strong> ({stats.positif} positif, {stats.negatif} negatif, {stats.netral} netral)
                </span>
                <button
                  type="button"
                  onClick={() => setSubTab('rekomendasi')}
                  className="font-semibold text-[#213358] hover:underline whitespace-nowrap"
                >
                  Lihat Rencana Aksi →
                </button>
              </div>
            </section>
          </div>
        </>
      )}

      {/* Analisis Isu Sub-Tab */}
      {subTab === 'isu' && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="mb-4">
            <h2 className="text-sm font-bold text-[#213358]">
              Rincian Analisis Isu ({periodLabel})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Perbandingan sentimen per topik yang paling banyak dibicarakan publik.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500">
                  <th className="py-2.5 pr-4">Topik</th>
                  <th className="py-2.5 px-3 text-right">Volume</th>
                  <th className="py-2.5 px-3 text-right">Positif</th>
                  <th className="py-2.5 px-3 text-right">Negatif</th>
                  <th className="py-2.5 px-3 text-right">Netral</th>
                  <th className="py-2.5 pl-4">Dominan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {topics.map((t) => (
                  <tr key={t.topic} className="hover:bg-slate-50">
                    <td className="py-3 pr-4 font-semibold text-[#213358]">{t.topic}</td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-700">
                      {t.total} ({t.sharePercent}%)
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-[#287D4B]">
                      {t.positif}
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-[#C23B3B]">
                      {t.negatif}
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-600">
                      {t.netral}
                    </td>
                    <td className="py-3 pl-4 font-medium text-slate-700">
                      {t.dominantSentiment}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Rekomendasi Sub-Tab */}
      {subTab === 'rekomendasi' && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
          <div>
            <h2 className="text-sm font-bold text-[#213358]">
              Rekomendasi Tindak Lanjut Komunikasi
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Langkah strategis tim Humas berdasarkan hasil evaluasi periode {periodLabel}.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {detailedRecommendations.map((rec, idx) => (
              <div
                key={rec.title}
                className="rounded-xl border border-[#F3E5AB] bg-[#FEF9E6]/70 p-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-mono text-slate-500">0{idx + 1}</span>
                    <span className="font-semibold text-[#213358]">
                      Prioritas {rec.priority}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-[#213358]">{rec.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-700">{rec.action}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#F0DF9B] text-xs text-slate-600">
                  Kanal: <span className="font-semibold">{rec.channel}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Bottom Full-Width Primary Download Action Bar matching SENTRA Insight */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 no-print">
        <button
          type="button"
          onClick={handleDownloadCSV}
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#213358] px-5 py-3 text-sm font-semibold text-white hover:bg-[#192847] transition-colors shadow-xs"
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          <span>Unduh Laporan</span>
        </button>

        <button
          type="button"
          onClick={handleDownloadSummaryTxt}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-semibold text-[#213358] hover:bg-slate-50 transition-colors whitespace-nowrap"
        >
          <FileText className="h-4 w-4" aria-hidden="true" />
          <span>Ringkasan (.TXT)</span>
        </button>

        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-semibold text-[#213358] hover:bg-slate-50 transition-colors whitespace-nowrap"
        >
          <Printer className="h-4 w-4" aria-hidden="true" />
          <span>Cetak PDF</span>
        </button>
      </div>
    </div>
  );
};
