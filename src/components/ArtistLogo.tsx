import React from 'react';

interface ArtistLogoProps {
  variant?: 'icon' | 'full' | 'monogram' | 'badge';
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
}

export const ArtistLogo: React.FC<ArtistLogoProps> = ({
  variant = 'full',
  className = '',
  size = 'md',
  showSubtitle = true,
}) => {
  const sizeMap = {
    sm: { text: 'text-lg', sub: 'text-[9px]' },
    md: { text: 'text-2xl', sub: 'text-[11px]' },
    lg: { text: 'text-3xl', sub: 'text-xs' },
    xl: { text: 'text-4xl', sub: 'text-sm' },
  };

  const currentSize = sizeMap[size];
  const wordmark = (
    <span className={`font-bengali font-bold tracking-tight text-zinc-950 ${currentSize.text}`}>
      অপূর্ব
    </span>
  );

  if (variant === 'icon') {
    return <span className={`inline-flex items-center ${className}`}>{wordmark}</span>;
  }

  if (variant === 'monogram') {
    return (
      <div className={`flex flex-col items-center justify-center gap-2 ${className}`}>
        {wordmark}
        <span className="font-display text-[10px] uppercase tracking-widest text-zinc-500 font-semibold">
          Zalvix
        </span>
      </div>
    );
  }

  if (variant === 'badge') {
    return (
      <div className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl glass-pill border border-white/90 shadow-xs ${className}`}>
        <div className="flex flex-col text-left">
          {wordmark}
        </div>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center group ${className}`}>
      <div className="flex flex-col text-left">
        <div className="flex items-baseline">
          <span className={`${currentSize.text} font-bengali font-bold text-zinc-950 tracking-tight leading-none group-hover:text-indigo-600 transition-colors`}>
            অপূর্ব
          </span>
        </div>
        {showSubtitle && (
          <span className={`font-mono uppercase tracking-widest text-indigo-600 font-medium mt-0.5 ${currentSize.sub}`}>
            Electronic Music · Khalid Bin Alam
          </span>
        )}
      </div>
    </div>
  );
};
