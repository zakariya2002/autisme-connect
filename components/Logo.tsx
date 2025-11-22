import Link from 'next/link';

interface LogoProps {
  href?: string;
  className?: string;
  iconSize?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export default function Logo({ href = '/', className = '', iconSize = 'md', showText = true }: LogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl'
  };

  const initialsSize = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  return (
    <Link href={href} className={`flex items-center group ${className}`}>
      {/* Logo professionnel médico-social : cercle avec initiales AC */}
      <div className={`${sizeClasses[iconSize]} bg-gradient-to-br from-primary-600 to-blue-600 rounded-full flex items-center justify-center shadow-md group-hover:shadow-lg transition-all border-2 border-white ${showText ? 'mr-2.5' : ''}`}>
        <span className={`text-white font-extrabold ${initialsSize[iconSize]}`}>AC</span>
      </div>
      {showText && (
        <div className="flex flex-col leading-tight">
          <span className={`${textSizeClasses[iconSize]} font-bold text-primary-700 group-hover:text-primary-800 transition-colors`}>
            Autisme Connect
          </span>
        </div>
      )}
    </Link>
  );
}
