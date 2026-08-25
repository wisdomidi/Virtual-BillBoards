import React from 'react';
import { Zap } from 'lucide-react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  showSubtitle?: boolean;
  className?: string;
  onClick?: () => void;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showText = true,
  showSubtitle = false,
  className = '',
  onClick
}) => {
  const iconSizeClasses = {
    sm: 'w-6 h-6 rounded-lg text-[10px]',
    md: 'w-8 h-8 rounded-xl text-xs',
    lg: 'w-10 h-10 rounded-2xl text-sm'
  };

  const zapSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const titleSizes = {
    sm: 'text-sm',
    md: 'text-base sm:text-lg',
    lg: 'text-xl sm:text-2xl'
  };

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-2.5 ${onClick ? 'cursor-pointer group' : ''} ${className}`}
    >
      {/* Unified Brand Emblem (Matches Favicon: Gradient Rounded Box + Lightning Bolt) */}
      <div
        className={`${iconSizeClasses[size]} bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center text-slate-950 font-black shadow-md shadow-cyan-500/25 group-hover:scale-105 transition-transform shrink-0 border border-cyan-300/30`}
      >
        <Zap className={`${zapSizes[size]} fill-slate-950 text-slate-950 stroke-[2.5]`} />
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className={`${titleSizes[size]} font-black tracking-tight text-white flex items-center gap-1.5 leading-none`}>
            <span className="bg-gradient-to-r from-white via-slate-100 to-cyan-300 bg-clip-text text-transparent">
              Virtual BillBoard
            </span>
          </div>
          {showSubtitle && (
            <p className="text-[10px] text-slate-400 font-sans hidden sm:block leading-tight mt-0.5">
              World's First Infinite 24/7 Virtual Billboard
            </p>
          )}
        </div>
      )}
    </div>
  );
};
