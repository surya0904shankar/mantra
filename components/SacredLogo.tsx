
import React, { useState, useEffect } from 'react';
import { generateAppIcon } from '../services/imageService';
import { Loader2, Sparkles } from 'lucide-react';

interface SacredLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const SacredLogo: React.FC<SacredLogoProps> = ({ size = 'md', className = '' }) => {
  const [iconUrl, setIconUrl] = useState<string | null>(() => localStorage.getItem('om_app_icon'));
  const [isGenerating, setIsGenerating] = useState(false);

  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-16 h-16 text-xl',
    xl: 'w-24 h-24 text-3xl'
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    const url = await generateAppIcon();
    if (url) {
      setIconUrl(url);
      localStorage.setItem('om_app_icon', url);
    }
    setIsGenerating(false);
  };

  useEffect(() => {
    if (!iconUrl && !isGenerating) {
      handleGenerate();
    }
  }, []);

  if (isGenerating && !iconUrl) {
    return (
      <div className={`${sizes[size]} rounded-xl bg-gradient-to-br from-saffron-100 to-orange-100 dark:from-stone-800 dark:to-stone-700 flex items-center justify-center animate-pulse border border-saffron-200 dark:border-stone-600 ${className}`}>
        <Loader2 className="w-1/2 h-1/2 text-saffron-500 animate-spin" />
      </div>
    );
  }

  if (iconUrl) {
    return (
      <div className={`relative group ${className}`}>
        <img 
          src={iconUrl} 
          alt="OmCounter Icon" 
          className={`${sizes[size]} rounded-xl shadow-lg border border-white/20 dark:border-stone-700 object-cover`}
        />
        <button 
          onClick={handleGenerate}
          className="absolute -top-1 -right-1 bg-white dark:bg-stone-800 rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity border border-stone-100 dark:border-stone-700"
          title="Regenerate Sacred Icon"
        >
          <Sparkles size={10} className="text-saffron-500" />
        </button>
      </div>
    );
  }

  // Fallback
  return (
    <div className={`${sizes[size]} bg-gradient-to-br from-saffron-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg text-white font-display font-bold ${className}`}>
      OM
    </div>
  );
};

export default SacredLogo;
