import React, { useMemo, useState } from 'react';
import {
  Bell,
  FileText,
  Home,
  Menu,
  MessageSquare,
  Settings,
  User,
  X,
} from 'lucide-react';
import { CommentsPage } from './components/CommentsPage';
import { DashboardPage } from './components/DashboardPage';
import { ReportPage } from './components/ReportPage';
import { SentraLogo } from './components/SentraLogo';
import { INITIAL_COMMENTS } from './data/mockSentiments';
import {
  PageTab,
  PeriodKey,
  SentimentType,
  SocialComment,
} from './types/sentiment';
import {
  computeNegativeAlerts,
  filterCommentsByPeriod,
} from './utils/sentimentAnalyzer';

export default function App() {
  const [activeTab, setActiveTab] = useState<PageTab>('dashboard');
  const [comments, setComments] = useState<SocialComment[]>(INITIAL_COMMENTS);
  const [period, setPeriod] = useState<PeriodKey>('7d');

  // Cross-page filters
  const [selectedSentiment, setSelectedSentiment] = useState<SentimentType | 'Semua'>('Semua');
  const [selectedTopic, setSelectedTopic] = useState<string>('');

  // UI popovers & settings modal
  const [notifOpen, setNotifOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [dismissedAlertIds, setDismissedAlertIds] = useState<string[]>([]);

  // Workspace preferences (for working Pengaturan item in sidebar)
  const [unitName, setUnitName] = useState('Humas UNJ');
  const [spikeThreshold, setSpikeThreshold] = useState(20);

  const periodComments = useMemo(
    () => filterCommentsByPeriod(comments, period),
    [comments, period]
  );

  const alerts = useMemo(
    () => computeNegativeAlerts(periodComments),
    [periodComments]
  );

  const unreadAlerts = useMemo(
    () => alerts.filter((a) => !dismissedAlertIds.includes(a.id)),
    [alerts, dismissedAlertIds]
  );

  const handleNavigateToComments = (filter?: {
    sentiment?: SentimentType | 'Semua';
    topic?: string;
  }) => {
    setSelectedSentiment(filter?.sentiment ?? 'Semua');
    setSelectedTopic(filter?.topic ?? '');
    setActiveTab('komentar');
    setNotifOpen(false);
    setMobileMenuOpen(false);
  };

  const handleAddComment = (newComment: SocialComment) => {
    setComments((prev) => [newComment, ...prev]);
  };

  const handleDismissAlert = (id: string) => {
    setDismissedAlertIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const navItems: Array<{
    id: PageTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    { id: 'dashboard', label: 'Beranda', icon: Home },
    { id: 'komentar', label: 'Komentar', icon: MessageSquare },
    { id: 'laporan', label: 'Laporan', icon: FileText },
  ];

  const pageTitles: Record<PageTab, string> = {
    dashboard: 'Beranda',
    komentar: 'Komentar',
    laporan: 'Laporan',
  };

  return (
    <div className="min-h-screen bg-[#F4F6FA] text-[#1E2E4A] flex flex-col lg:flex-row">
      {/* Desktop Navy Sidebar matching SENTRA Pulse */}
      <aside className="hidden lg:flex lg:w-60 lg:flex-col lg:fixed lg:inset-y-0 bg-[#213358] text-white">
        <div className="px-6 pt-7 pb-6 flex justify-center border-b border-white/10">
          <SentraLogo variant="dark" layout="stacked" />
        </div>

        <nav className="flex-1 px-3 py-5 space-y-1.5" aria-label="Navigasi utama SENTRA">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-[#364E7E] text-white shadow-2xs'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{item.label}</span>
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            className="w-full flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            <Settings className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>Pengaturan</span>
          </button>
        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            className="w-full flex items-center gap-2.5 rounded-xl px-2 py-2 text-left hover:bg-white/10 transition-colors"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15 text-slate-200">
              <User className="h-4 w-4" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-white truncate">{unitName}</div>
              <div className="text-[11px] text-slate-300 truncate">Tim Pemantauan</div>
            </div>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-60 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-30 h-15 bg-[#213358] lg:bg-white text-white lg:text-[#213358] border-b border-[#192847] lg:border-slate-200 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="lg:hidden rounded-lg p-1.5 text-slate-200 hover:bg-white/10"
              aria-label="Menu navigasi"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <div className="lg:hidden">
              <SentraLogo variant="dark" layout="horizontal" />
            </div>

            <div className="hidden lg:flex items-center gap-2 text-sm">
              <span className="text-slate-400">SENTRA</span>
              <span className="text-slate-300">/</span>
              <span className="font-bold text-[#213358]">{pageTitles[activeTab]}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Compact Tablet Nav */}
            <div className="hidden sm:flex lg:hidden items-center gap-1 rounded-full bg-white/10 p-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`rounded-full px-3.5 py-1 text-xs font-semibold transition-colors whitespace-nowrap ${
                    activeTab === item.id
                      ? 'bg-white text-[#213358]'
                      : 'text-slate-200 hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotifOpen((v) => !v)}
                className="relative inline-flex items-center justify-center rounded-full p-2 text-white lg:text-[#213358] hover:bg-white/10 lg:hover:bg-slate-100 transition-colors"
                aria-label="Notifikasi Humas"
                aria-expanded={notifOpen}
              >
                <Bell className="h-5 w-5" aria-hidden="true" />
                {unreadAlerts.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500" />
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-lg p-4 z-40">
                  <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                    <h3 className="text-sm font-bold text-[#213358]">
                      Notifikasi Sentimen
                    </h3>
                    <button
                      type="button"
                      onClick={() => setNotifOpen(false)}
                      className="text-xs text-slate-400 hover:text-slate-600"
                    >
                      Tutup
                    </button>
                  </div>

                  {unreadAlerts.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-500">
                      Tidak ada peringatan lonjakan komentar negatif saat ini.
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                      {unreadAlerts.map((alert) => (
                        <div key={alert.id} className="py-3 space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-[#B83232]">
                              {alert.title}
                            </span>
                            <span className="text-[11px] text-slate-400">{alert.dateLabel}</span>
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            {alert.description}
                          </p>
                          <div className="flex items-center justify-between pt-1">
                            <button
                              type="button"
                              onClick={() => handleNavigateToComments({ sentiment: 'Negatif' })}
                              className="text-xs font-semibold text-[#213358] hover:underline"
                            >
                              Lihat Komentar Negatif
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDismissAlert(alert.id)}
                              className="text-xs text-slate-400 hover:text-slate-700"
                            >
                              Tandai Dibaca
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Mobile Drawer Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#213358] text-white px-4 py-3 border-b border-white/10 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium ${
                    isActive ? 'bg-[#364E7E] text-white' : 'text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  <span>{item.label}</span>
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => {
                setSettingsOpen(true);
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/10"
            >
              <Settings className="h-4 w-4" aria-hidden="true" />
              <span>Pengaturan</span>
            </button>
          </div>
        )}

        {/* Page Body */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-6xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <DashboardPage
              comments={periodComments}
              period={period}
              onPeriodChange={setPeriod}
              alerts={alerts}
              onNavigateToComments={handleNavigateToComments}
            />
          )}

          {activeTab === 'komentar' && (
            <CommentsPage
              comments={comments}
              selectedSentiment={selectedSentiment}
              onSelectedSentimentChange={setSelectedSentiment}
              selectedTopic={selectedTopic}
              onSelectedTopicChange={setSelectedTopic}
              onAddComment={handleAddComment}
            />
          )}

          {activeTab === 'laporan' && (
            <ReportPage
              comments={periodComments}
              period={period}
              onPeriodChange={setPeriod}
              onInspectSentiment={(s) => handleNavigateToComments({ sentiment: s })}
            />
          )}
        </main>
      </div>

      {/* Working Settings Modal for Sidebar "Pengaturan" */}
      {settingsOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="settings-title"
        >
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 id="settings-title" className="text-base font-bold text-[#213358]">
                Pengaturan Pemantauan
              </h2>
              <button
                type="button"
                onClick={() => setSettingsOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                aria-label="Tutup pengaturan"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label htmlFor="unit-name" className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Unit / Tim Humas
                </label>
                <input
                  id="unit-name"
                  type="text"
                  value={unitName}
                  onChange={(e) => setUnitName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-900 focus:border-[#213358] focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="spike-threshold" className="block text-xs font-semibold text-slate-700 mb-1">
                  Ambang Batas Peringatan Lonjakan Negatif ({spikeThreshold}%)
                </label>
                <input
                  id="spike-threshold"
                  type="range"
                  min={10}
                  max={50}
                  step={5}
                  value={spikeThreshold}
                  onChange={(e) => setSpikeThreshold(Number(e.target.value))}
                  className="w-full accent-[#213358]"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSettingsOpen(false)}
                className="rounded-xl bg-[#213358] px-5 py-2 text-xs font-semibold text-white hover:bg-[#192847]"
              >
                Simpan Pengaturan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
