import React from 'react';

export interface VagouLogoProps {
  variant?: 'full' | 'header' | 'icon' | 'splash' | 'compact';
  theme?: 'dark' | 'light';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  className?: string;
}

export const VagouLogo: React.FC<VagouLogoProps> = ({
  variant = 'header',
  theme = 'dark',
  size = 'md',
  showTagline = true,
  className = '',
}) => {
  // Height map in pixels
  const heightMap = {
    xs: 24,
    sm: 32,
    md: 40,
    lg: 43,
    xl: 80,
  };

  const widthMap = {
    xs: 64,
    sm: 85,
    md: 106,
    lg: 115,
    xl: 160,
  };

  const h = heightMap[size] || 40;
  const w = widthMap[size] || 'auto';

  // Standalone Icon (Green Checkmark V)
  if (variant === 'icon') {
    return (
      <div className={`inline-flex items-center shrink-0 bg-transparent select-none ${className}`}>
        <svg
          width={h}
          height={h}
          viewBox="0 0 160 160"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="shrink-0"
        >
          <defs>
            <linearGradient id="vGradIconOnly" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10982B" />
              <stop offset="50%" stopColor="#20C933" />
              <stop offset="100%" stopColor="#38E54B" />
            </linearGradient>
          </defs>
          <path
            d="M 25 72 C 15 60, 30 42, 46 52 L 72 82 C 80 90, 92 88, 100 78 L 142 22 C 152 8, 168 22, 158 36 L 98 126 C 86 142, 64 142, 52 126 Z"
            fill="url(#vGradIconOnly)"
          />
        </svg>
      </div>
    );
  }

  // Se showTagline for falso, ainda assim mostraremos a imagem completa para garantir a integridade da marca, 
  // mas usaremos um contêiner que permita que a imagem se ajuste naturalmente sem cortes.
  const isSplash = variant === 'splash';
  
  return (
    <div 
      className={`inline-flex items-center justify-start shrink-0 select-none bg-transparent ${className}`}
      style={{ height: h, width: w }}
    >
      <img
        src="/logo.png"
        alt="Vagou App"
        style={{ height: h, width: w }}
        className="block object-contain"
        referrerPolicy="no-referrer"
      />
    </div>
  );
};

export default VagouLogo;
