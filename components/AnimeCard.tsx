import React from 'react';

interface AnimeCardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  variant?: 'pink' | 'cyan' | 'gold' | 'black' | 'purple';
  className?: string;
}

const AnimeCard: React.FC<AnimeCardProps> = ({ children, title, subtitle, variant = 'black', className = '' }) => {
  const getBorderColor = () => {
    switch (variant) {
      case 'pink': return 'border-[#FF6B9D] anime-border-pink';
      case 'cyan': return 'border-[#4ECDC4] anime-border-cyan';
      case 'gold': return 'border-[#FFE66D]';
      case 'purple': return 'border-purple-500 anime-border-purple';
      default: return 'border-black anime-border';
    }
  };

  return (
    <div className={`bg-white dark:bg-[#2A2438] rounded-3xl border-4 p-6 transition-all duration-300 ${getBorderColor()} ${className}`}>
      {(title || subtitle) && (
        <div className="mb-6 border-b-2 border-dashed border-gray-300 dark:border-gray-700 pb-4">
          {title && <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight flex items-center gap-2 text-black dark:text-white">
            {title}
          </h3>}
          {subtitle && <p className="text-sm font-medium text-gray-600 dark:text-gray-400 italic">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
};

export default AnimeCard;
