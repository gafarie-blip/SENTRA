import React, { useState } from 'react';
import { SentimentType, TrendPoint } from '../types/sentiment';

interface SentimentTrendChartProps {
  data: TrendPoint[];
}

export const SentimentTrendChart: React.FC<SentimentTrendChartProps> = ({ data }) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [visibleSeries, setVisibleSeries] = useState<Record<'positif' | 'negatif' | 'netral', boolean>>({
    positif: true,
    negatif: true,
    netral: true,
  });

  const toggleSeries = (key: 'positif' | 'negatif' | 'netral') => {
    setVisibleSeries((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      if (!next.positif && !next.negatif && !next.netral) return prev;
      return next;
    });
  };

  if (data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-slate-200 text-sm text-slate-500">
        Belum ada data tren untuk periode yang dipilih.
      </div>
    );
  }

  const width = 560;
  const height = 210;
  const padLeft = 42;
  const padRight = 18;
  const padTop = 16;
  const padBottom = 34;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  const yTicks = [0, 50, 100];

  const getX = (idx: number) => {
    if (data.length === 1) return padLeft + plotW / 2;
    return padLeft + (idx / (data.length - 1)) * plotW;
  };

  const getY = (pct: number) => padTop + plotH - (pct / 100) * plotH;

  const buildPath = (key: 'positifPct' | 'negatifPct' | 'netralPct') =>
    data
      .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)} ${getY(pt[key]).toFixed(1)}`)
      .join(' ');

  const activePoint = hoverIndex !== null ? data[hoverIndex] : null;
  const labelStep = data.length > 8 ? Math.ceil(data.length / 7) : 1;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="flex-1 min-w-0">
        <div className="relative w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="h-52 w-full min-w-[380px]"
            role="img"
            aria-label="Grafik tren persentase sentimen publik"
            onMouseLeave={() => setHoverIndex(null)}
          >
            {/* Horizontal gridlines */}
            {yTicks.map((tick) => {
              const y = getY(tick);
              return (
                <g key={tick}>
                  <line
                    x1={padLeft}
                    y1={y}
                    x2={width - padRight}
                    y2={y}
                    stroke="#E5E9F0"
                    strokeWidth="1"
                  />
                  <text
                    x={padLeft - 8}
                    y={y + 4}
                    textAnchor="end"
                    className="fill-slate-500 text-[11px] font-mono tabular-nums"
                  >
                    {tick}%
                  </text>
                </g>
              );
            })}

            {/* Vertical hover guide */}
            {hoverIndex !== null && (
              <line
                x1={getX(hoverIndex)}
                y1={padTop}
                x2={getX(hoverIndex)}
                y2={padTop + plotH}
                stroke="#213358"
                strokeOpacity="0.2"
                strokeWidth="1.5"
              />
            )}

            {/* Trend Lines */}
            {visibleSeries.netral && data.length > 1 && (
              <path
                d={buildPath('netralPct')}
                fill="none"
                stroke="#94A0B4"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
            {visibleSeries.negatif && data.length > 1 && (
              <path
                d={buildPath('negatifPct')}
                fill="none"
                stroke="#DF5858"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
            {visibleSeries.positif && data.length > 1 && (
              <path
                d={buildPath('positifPct')}
                fill="none"
                stroke="#49A86C"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Nodes & X labels */}
            {data.map((pt, i) => {
              const x = getX(i);
              const colW = data.length > 1 ? plotW / data.length : plotW;
              const isHovered = hoverIndex === i;

              return (
                <g key={pt.dateISO}>
                  {i % labelStep === 0 || i === data.length - 1 ? (
                    <text
                      x={x}
                      y={height - 10}
                      textAnchor="middle"
                      className={`text-[11px] tabular-nums ${
                        isHovered ? 'fill-[#213358] font-semibold' : 'fill-slate-500'
                      }`}
                    >
                      {pt.label}
                    </text>
                  ) : null}

                  {visibleSeries.netral && (
                    <circle
                      cx={x}
                      cy={getY(pt.netralPct)}
                      r={isHovered ? 4.5 : 3}
                      fill="#94A0B4"
                      stroke="#ffffff"
                      strokeWidth="1.2"
                    />
                  )}
                  {visibleSeries.negatif && (
                    <circle
                      cx={x}
                      cy={getY(pt.negatifPct)}
                      r={isHovered ? 5 : 3.2}
                      fill="#DF5858"
                      stroke="#ffffff"
                      strokeWidth="1.2"
                    />
                  )}
                  {visibleSeries.positif && (
                    <circle
                      cx={x}
                      cy={getY(pt.positifPct)}
                      r={isHovered ? 5 : 3.4}
                      fill="#49A86C"
                      stroke="#ffffff"
                      strokeWidth="1.2"
                    />
                  )}

                  <rect
                    x={x - colW / 2}
                    y={padTop}
                    width={Math.max(colW, 24)}
                    height={plotH + 22}
                    fill="transparent"
                    className="cursor-pointer"
                    onMouseEnter={() => setHoverIndex(i)}
                  />
                </g>
              );
            })}
          </svg>
        </div>

        {activePoint && (
          <div className="mt-1 text-xs text-slate-600 tabular-nums">
            <span className="font-semibold text-[#213358]">{activePoint.label}</span>
            <span className="mx-1.5 text-slate-300">·</span>
            <span className="text-[#3C8D59] font-medium">
              Positif {activePoint.positifPct}% ({activePoint.positif})
            </span>
            <span className="mx-1.5 text-slate-300">·</span>
            <span className="text-[#C74242] font-medium">
              Negatif {activePoint.negatifPct}% ({activePoint.negatif})
            </span>
            <span className="mx-1.5 text-slate-300">·</span>
            <span className="text-slate-600 font-medium">
              Netral {activePoint.netralPct}% ({activePoint.netral})
            </span>
          </div>
        )}
      </div>

      {/* Right-aligned Legend matching mockup */}
      <div className="flex sm:flex-col gap-3 sm:gap-3.5 shrink-0 sm:pl-2">
        <button
          type="button"
          onClick={() => toggleSeries('positif')}
          className={`flex items-center gap-2 text-xs font-medium transition-opacity whitespace-nowrap ${
            visibleSeries.positif ? 'text-slate-700' : 'text-slate-400 opacity-50'
          }`}
        >
          <span className="h-2.5 w-2.5 rounded-full bg-[#49A86C]" aria-hidden="true" />
          <span>Positif</span>
        </button>
        <button
          type="button"
          onClick={() => toggleSeries('negatif')}
          className={`flex items-center gap-2 text-xs font-medium transition-opacity whitespace-nowrap ${
            visibleSeries.negatif ? 'text-slate-700' : 'text-slate-400 opacity-50'
          }`}
        >
          <span className="h-2.5 w-2.5 rounded-full bg-[#DF5858]" aria-hidden="true" />
          <span>Negatif</span>
        </button>
        <button
          type="button"
          onClick={() => toggleSeries('netral')}
          className={`flex items-center gap-2 text-xs font-medium transition-opacity whitespace-nowrap ${
            visibleSeries.netral ? 'text-slate-700' : 'text-slate-400 opacity-50'
          }`}
        >
          <span className="h-2.5 w-2.5 rounded-full bg-[#94A0B4]" aria-hidden="true" />
          <span>Netral</span>
        </button>
      </div>
    </div>
  );
};

interface SentimentComparisonChartProps {
  positif: number;
  negatif: number;
  netral: number;
  onSelectSentiment?: (sentiment: SentimentType) => void;
}

export const SentimentComparisonChart: React.FC<SentimentComparisonChartProps> = ({
  positif,
  negatif,
  netral,
  onSelectSentiment,
}) => {
  const [hovered, setHovered] = useState<SentimentType | null>(null);
  const total = positif + negatif + netral;

  const posPct = total ? Math.round((positif / total) * 100) : 0;
  const negPct = total ? Math.round((negatif / total) * 100) : 0;
  const netPct = total ? Math.max(0, 100 - posPct - negPct) : 0;

  const items: Array<{
    key: SentimentType;
    count: number;
    pct: number;
    color: string;
    dotClass: string;
  }> = [
    { key: 'Positif', count: positif, pct: posPct, color: '#53B175', dotClass: 'bg-[#53B175]' },
    { key: 'Negatif', count: negatif, pct: negPct, color: '#DF6464', dotClass: 'bg-[#DF6464]' },
    { key: 'Netral', count: netral, pct: netPct, color: '#9BA6B8', dotClass: 'bg-[#9BA6B8]' },
  ];

  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  let cumulativeOffset = 0;

  const centerItem = hovered ? items.find((i) => i.key === hovered) ?? items[0] : items[0];

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
      {/* Donut chart */}
      <div className="relative h-44 w-44 shrink-0">
        <svg
          viewBox="0 0 160 160"
          className="h-full w-full -rotate-90"
          role="img"
          aria-label="Grafik donat perbandingan sentimen"
        >
          <circle cx="80" cy="80" r={radius} fill="none" stroke="#F1F5F9" strokeWidth="24" />
          {total > 0 &&
            items.map((item) => {
              const segLength = (item.count / total) * circumference;
              const dashArray = `${segLength} ${circumference - segLength}`;
              const dashOffset = -cumulativeOffset;
              cumulativeOffset += segLength;
              const isActive = hovered === item.key;

              return (
                <circle
                  key={item.key}
                  cx="80"
                  cy="80"
                  r={radius}
                  fill="none"
                  stroke={item.color}
                  strokeWidth={isActive ? 28 : 24}
                  strokeDasharray={dashArray}
                  strokeDashoffset={dashOffset}
                  className="transition-all duration-200 cursor-pointer"
                  onMouseEnter={() => setHovered(item.key)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => onSelectSentiment?.(item.key)}
                />
              );
            })}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-bold text-[#213358] tabular-nums leading-none">
            {centerItem.pct}%
          </span>
          <span className="mt-1 text-xs font-semibold text-slate-600">
            {centerItem.key}
          </span>
        </div>
      </div>

      {/* Clean Legend List matching mockup */}
      <div className="flex-1 w-full space-y-3.5 sm:pl-4">
        {items.map((item) => (
          <button
            key={item.key}
            type="button"
            onMouseEnter={() => setHovered(item.key)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => onSelectSentiment?.(item.key)}
            className="w-full flex items-center justify-between gap-4 rounded-lg px-3 py-2 hover:bg-slate-50 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <span className={`h-3.5 w-3.5 rounded-full ${item.dotClass}`} aria-hidden="true" />
              <span className="text-sm font-medium text-slate-700">{item.key}</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-base font-bold text-[#213358] tabular-nums">{item.pct}%</span>
              <span className="text-xs text-slate-400 tabular-nums">({item.count})</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

interface SentimentDevelopmentChartProps {
  data: TrendPoint[];
  overallPositifPct: number;
}

export const SentimentDevelopmentChart: React.FC<SentimentDevelopmentChartProps> = ({
  data,
  overallPositifPct,
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (data.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-slate-200 text-sm text-slate-500">
        Belum ada data perkembangan sentimen.
      </div>
    );
  }

  const width = 560;
  const height = 165;
  const padLeft = 42;
  const padRight = 24;
  const padTop = 32;
  const padBottom = 28;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  const yTicks = [0, 50, 100];
  const getX = (idx: number) =>
    data.length === 1 ? padLeft + plotW / 2 : padLeft + (idx / (data.length - 1)) * plotW;
  const getY = (pct: number) => padTop + plotH - (pct / 100) * plotH;

  const linePath = data
    .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)} ${getY(pt.positifPct).toFixed(1)}`)
    .join(' ');
  const areaPath = `${linePath} L ${getX(data.length - 1).toFixed(1)} ${(padTop + plotH).toFixed(1)} L ${getX(0).toFixed(1)} ${(padTop + plotH).toFixed(1)} Z`;

  const activeIdx = hoverIndex !== null ? hoverIndex : data.length - 1;
  const activePt = data[activeIdx];
  const calloutPct = hoverIndex !== null ? activePt.positifPct : overallPositifPct;
  const calloutX = getX(activeIdx);
  const calloutY = Math.max(26, getY(activePt.positifPct) - 14);
  const labelStep = data.length > 6 ? Math.ceil(data.length / 4) : 1;

  return (
    <div className="relative w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-44 w-full min-w-[380px]"
        role="img"
        aria-label="Grafik perkembangan persentase sentimen positif"
        onMouseLeave={() => setHoverIndex(null)}
      >
        <defs>
          <linearGradient id="sentraBlueArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3B5B96" stopOpacity="0.24" />
            <stop offset="100%" stopColor="#3B5B96" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {yTicks.map((tick) => {
          const y = getY(tick);
          return (
            <g key={tick}>
              <line x1={padLeft} y1={y} x2={width - padRight} y2={y} stroke="#E5E9F0" strokeWidth="1" />
              <text
                x={padLeft - 8}
                y={y + 4}
                textAnchor="end"
                className="fill-slate-500 text-[11px] font-mono tabular-nums"
              >
                {tick}%
              </text>
            </g>
          );
        })}

        {data.length > 1 && <path d={areaPath} fill="url(#sentraBlueArea)" />}
        {data.length > 1 && (
          <path
            d={linePath}
            fill="none"
            stroke="#3B5B96"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {data.map((pt, i) => {
          const x = getX(i);
          const colW = data.length > 1 ? plotW / data.length : plotW;
          const isActive = activeIdx === i;

          return (
            <g key={pt.dateISO}>
              {i % labelStep === 0 || i === data.length - 1 ? (
                <text
                  x={x}
                  y={height - 6}
                  textAnchor="middle"
                  className={`text-[11px] tabular-nums ${
                    isActive ? 'fill-[#213358] font-semibold' : 'fill-slate-500'
                  }`}
                >
                  {pt.label}
                </text>
              ) : null}

              <circle
                cx={x}
                cy={getY(pt.positifPct)}
                r={isActive ? 4.5 : 3}
                fill={isActive ? '#213358' : '#3B5B96'}
                stroke="#ffffff"
                strokeWidth="1.5"
              />

              <rect
                x={x - colW / 2}
                y={padTop}
                width={Math.max(colW, 24)}
                height={plotH + 22}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHoverIndex(i)}
              />
            </g>
          );
        })}

        {/* Dark Navy Callout Pill at active/latest point */}
        <g transform={`translate(${Math.min(width - 54, Math.max(padLeft + 26, calloutX))}, ${calloutY - 12})`}>
          <rect x="-24" y="-12" width="48" height="22" rx="6" fill="#213358" />
          <text
            x="0"
            y="3"
            textAnchor="middle"
            className="fill-white text-[11px] font-bold tabular-nums"
          >
            {calloutPct}%
          </text>
        </g>
      </svg>
    </div>
  );
};
