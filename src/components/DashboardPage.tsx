import React from 'react';
import {
  AlertTriangle,
  BarChart2,
  ChevronRight,
  Flame,
  TrendingUp,
} from 'lucide-react';
import {
  NegativeSpikeAlert,
  PeriodKey,
  SentimentType,
  SocialComment,
} from '../types/sentiment';
import {
  computeSentimentStats,
  computeTopicStats,
  computeTrendSeries,
  getPeriodLabel,
} from '../utils/sentimentAnalyzer';
import { SentimentTrendChart } from './Charts';

interface DashboardPageProps {
  comments: SocialComment[];
  period: PeriodKey;
  onPeriodChange: (period: PeriodKey) => void;
  alerts: NegativeSpikeAlert[];
  onNavigateToComments: (filter?: { sentiment?: SentimentType | 'Semua'; topic?: string }) => void;
}

const FaceIcon: React.FC<{ type: SentimentType }> = ({ type }) => {
  if (type === 'Positif') {
    return (
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#4BA96D] text-[#1A3D27]" aria-hidden="true">
        <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2.2">
          <circle cx="9" cy="10" r="1" fill="currentColor" stroke="none" />
          <circle cx="15" cy="10" r="1" fill="currentColor" stroke="none" />
          <path d="M8.5 14.5c1 1.3 2.2 2 3.5 2s2.5-.7 3.5-2" strokeLinecap="round" />
        </svg>
      </div>
    );
  }
  if (type === 'Negatif') {
    return (
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#E15D5D] text-[#4E1616]" aria-hidden="true">
        <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2.2">
          <circle cx="9" cy="10" r="1" fill="currentColor" stroke="none" />
          <circle cx="15" cy="10" r="1" fill="currentColor" stroke="none" />
          <path d="M8.5 16c1-1.3 2.2-2 3.5-2s2.5.7 3.5 2" strokeLinecap="round" />
        </svg>
      </div>
    );
  }
  return (
    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#9AA5B6] text-[#283142]" aria-hidden="true">
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2.2">
        <circle cx="9" cy="10" r="1" fill="currentColor" stroke="none" />
        <circle cx="15" cy="10" r="1" fill="currentColor" stroke="none" />
        <line x1="9" y1="15" x2="15" y2="15" strokeLinecap="round" />
      </svg>
    </div>
  );
};

export const DashboardPage: React.FC<DashboardPageProps> = ({
  comments,
  period,
  onPeriodChange,
  alerts,
  onNavigateToComments,
}) => {
  const stats = computeSentimentStats(comments);
  const trendData = computeTrendSeries(comments);
  const topicStats = computeTopicStats(comments);
  const activeAlert = alerts[0];

  return (
    <div className="space-y-5">
      {/* Greeting & Period Switcher */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-[26px] font-bold tracking-tight text-[#213358]">
            Halo, Tim Humas!
          </h1>
          <p className="mt-0.5 text-sm text-slate-600">
            Berikut kondisi sentimen publik hari ini.
          </p>
        </div>

        <select
          value={period}
          onChange={(e) => onPeriodChange(e.target.value as PeriodKey)}
          aria-label="Pilih periode pemantauan"
          className="self-start sm:self-auto rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-[#213358] shadow-2xs focus:border-sky-600 focus:outline-none"
        >
          <option value="7d">7 Hari Terakhir</option>
          <option value="14d">14 Hari Terakhir</option>
          <option value="30d">30 Hari Terakhir</option>
          <option value="all">Semua Periode</option>
        </select>
      </div>

      {/* 3 Sentiment KPI Cards matching SENTRA Pulse */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          type="button"
          onClick={() => onNavigateToComments({ sentiment: 'Positif' })}
          className="flex flex-col items-center justify-center rounded-2xl border border-[#D3EED8] bg-[#E8F6EB] px-4 py-5 text-center hover:border-[#9AD4A7] transition-colors"
        >
          <FaceIcon type="Positif" />
          <div className="mt-3 text-3xl font-bold text-[#1E2E4A] tabular-nums">
            {stats.positifPct}%
          </div>
          <div className="mt-0.5 text-sm font-medium text-slate-700">Positif</div>
          <div className="mt-1 text-xs font-semibold text-[#2E854A] tabular-nums">
            ↑ 5% · {stats.positif} komentar
          </div>
        </button>

        <button
          type="button"
          onClick={() => onNavigateToComments({ sentiment: 'Negatif' })}
          className="flex flex-col items-center justify-center rounded-2xl border border-[#F7D3D3] bg-[#FDECEC] px-4 py-5 text-center hover:border-[#EEACAC] transition-colors"
        >
          <FaceIcon type="Negatif" />
          <div className="mt-3 text-3xl font-bold text-[#1E2E4A] tabular-nums">
            {stats.negatifPct}%
          </div>
          <div className="mt-0.5 text-sm font-medium text-slate-700">Negatif</div>
          <div className="mt-1 text-xs font-semibold text-[#C94040] tabular-nums">
            ↓ 2% · {stats.negatif} komentar
          </div>
        </button>

        <button
          type="button"
          onClick={() => onNavigateToComments({ sentiment: 'Netral' })}
          className="flex flex-col items-center justify-center rounded-2xl border border-[#DCE2EC] bg-[#ECEFF4] px-4 py-5 text-center hover:border-[#C2CCDC] transition-colors"
        >
          <FaceIcon type="Netral" />
          <div className="mt-3 text-3xl font-bold text-[#1E2E4A] tabular-nums">
            {stats.netralPct}%
          </div>
          <div className="mt-0.5 text-sm font-medium text-slate-700">Netral</div>
          <div className="mt-1 text-xs font-semibold text-slate-600 tabular-nums">
            → 0% · {stats.netral} komentar
          </div>
        </button>
      </div>

      {/* Tren Sentimen Card */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
        <div className="flex items-center gap-2 mb-3">
          <BarChart2 className="h-4 w-4 text-[#213358]" aria-hidden="true" />
          <h2 className="text-sm font-bold text-[#213358]">
            Tren Sentimen ({getPeriodLabel(period)})
          </h2>
        </div>

        <SentimentTrendChart data={trendData} />
      </section>

      {/* Bottom Split: Isu yang Sedang Ramai + Perhatian! Alert */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
        {/* Left: Isu yang Sedang Ramai */}
        <section className="md:col-span-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Flame className="h-4 w-4 text-[#213358]" aria-hidden="true" />
              <h2 className="text-sm font-bold text-[#213358]">
                Isu yang Sedang Ramai
              </h2>
            </div>

            <div className="divide-y divide-slate-100">
              {topicStats.slice(0, 4).map((item) => (
                <button
                  key={item.topic}
                  type="button"
                  onClick={() => onNavigateToComments({ topic: item.topic })}
                  className="w-full py-2.5 px-1.5 -mx-1.5 flex items-center justify-between gap-3 rounded-lg hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="min-w-0">
                    <span className="text-sm font-medium text-[#213358] truncate block">
                      {item.topic}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 text-xs text-slate-400 tabular-nums">
                    <span>{item.total} komentar</span>
                    <ChevronRight className="h-4 w-4 text-slate-400" aria-hidden="true" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Right: Perhatian! Negative Spike Alert */}
        <section className="md:col-span-6 rounded-2xl border border-[#F5D0D0] bg-[#FDF1F1] p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-[#B83232] mb-2">
              <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
              <h2 className="text-sm font-bold">Perhatian!</h2>
            </div>

            <p className="text-sm leading-relaxed text-[#7F2323]">
              {activeAlert
                ? activeAlert.description
                : 'Belum terdeteksi lonjakan komentar negatif signifikan pada periode ini.'}
              {activeAlert && (
                <TrendingUp className="inline-block ml-1.5 h-4 w-4 text-[#D64545]" aria-hidden="true" />
              )}
            </p>
          </div>

          <div className="mt-4">
            <button
              type="button"
              onClick={() => onNavigateToComments({ sentiment: 'Negatif' })}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-[#213358] hover:bg-slate-50 transition-colors shadow-2xs whitespace-nowrap"
            >
              <span>Lihat Detail</span>
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
