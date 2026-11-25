import React from 'react';

interface SentraLogoProps {
  variant?: 'light' | 'dark';
  layout?: 'horizontal' | 'stacked';
}

export const SentraLogo: React.FC<SentraLogoProps> = ({
  variant = 'dark',
  layout = 'horizontal',
}) => {
  const isDarkBg = variant === 'dark';

  return (
    <div
      className={`flex items-center select-none whitespace-nowrap shrink-0 ${
        layout === 'stacked' ? 'flex-col gap-2 text-center' : 'gap-2.5'
      }`}
    >
      <div
        className={`flex items-center justify-center rounded-full ${
          layout === 'stacked' ? 'h-12 w-12' : 'h-8 w-8'
        } ${isDarkBg ? 'bg-[#3B629E]/40 text-[#72B6E8]' : 'bg-[#213358] text-[#72B6E8]'}`}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 24 24"
          className={layout === 'stacked' ? 'h-7 w-7' : 'h-5 w-5'}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M7.5 12h2.2l1.6-3.2 2.2 6.4 1.6-3.2H17"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <span
        className={`font-bold tracking-tight ${
          layout === 'stacked' ? 'text-lg' : 'text-base'
        } ${isDarkBg ? 'text-white' : 'text-[#213358]'}`}
      >
        SENTRA
      </span>
    </div>
  );
};
