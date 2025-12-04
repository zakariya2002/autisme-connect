import Link from 'next/link';

interface LogoProps {
  href?: string;
  className?: string;
  iconSize?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export default function Logo({ href = '/', className = '', iconSize = 'md', showText = true }: LogoProps) {
  const sizeClasses = {
    sm: 'w-9 h-9',
    md: 'w-11 h-11',
    lg: 'w-14 h-14'
  };

  const textSizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl'
  };

  const iconScale = {
    sm: 'scale-90',
    md: 'scale-100',
    lg: 'scale-110'
  };

  return (
    <Link href={href} className={`flex items-center group ${className}`}>
      {/* Logo neurocare - icône avec onde neurologique */}
      <div className={`${sizeClasses[iconSize]} relative flex items-center justify-center ${showText ? 'mr-2.5' : ''}`}>
        <svg
          viewBox="0 0 40 40"
          className={`w-full h-full ${iconScale[iconSize]}`}
          fill="none"
        >
          <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7c3aed" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>
          {/* Cercle externe */}
          <circle
            cx="20"
            cy="20"
            r="16"
            stroke="url(#logoGradient)"
            strokeWidth="3.5"
            fill="none"
          />
          {/* Onde neurologique avec pics arrondis */}
          <path
            d="M9 20 L12 20 Q14 20 15 12 Q16 8 17 12 L20 20 L23 28 Q24 32 25 28 Q26 20 28 20 L31 20"
            stroke="url(#logoGradient)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </div>
      {showText && (
        <span className={`${textSizeClasses[iconSize]} font-bold bg-gradient-to-r from-violet-600 to-purple-500 bg-clip-text text-transparent group-hover:from-violet-700 group-hover:to-purple-600 transition-all tracking-tight`}>
          neurocare
        </span>
      )}
    </Link>
  );
}
