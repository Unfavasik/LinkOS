import React from 'react';

interface LinkOsLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  tone?: 'dark' | 'light';
}

export const LinkOsLogo: React.FC<LinkOsLogoProps> = ({
  className = '',
  size = 'md',
  showTagline = false,
  tone = 'dark',
}) => {
  const light = tone === 'light';

  const logoSizes = {
    sm: 'w-[74px] h-[25px]',
    md: 'w-[104px] h-[35px]',
    lg: 'w-[132px] h-[44px]',
  };

  return (
    <div
      className={`flex items-center select-none shrink-0 ${logoSizes[size]} ${
        light ? '' : 'rounded-lg bg-[#060D1A] px-1'
      } ${className}`}
    >
      <img
        src="/images/linkos-logo-480-v2.webp"
        alt="LinkOS"
        width="480"
        height="160"
        decoding="async"
        fetchPriority="high"
        className="w-full h-full object-contain"
        draggable={false}
      />
      {showTagline && (
        <span className="text-[10px] tracking-wider uppercase text-zinc-400 font-medium ml-2">
          Smart Business Page
        </span>
      )}
    </div>
  );
};
