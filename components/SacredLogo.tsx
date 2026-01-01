
import React from 'react';

interface SacredLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const SacredLogo: React.FC<SacredLogoProps> = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-3xl',
    xl: 'text-5xl'
  };

  return (
    <div className={`${sizes[size]} flex items-center justify-center rounded-2xl bg-gradient-to-br from-saffron-400 to-saffron-600 shadow-lg shadow-saffron-500/20 ${className}`}>
      <span className={`${textSizes[size]} text-white font-display select-none`}>ॐ</span>
    </div>
  );
};

export default SacredLogo;
