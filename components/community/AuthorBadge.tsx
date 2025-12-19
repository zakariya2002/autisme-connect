'use client';

import { AuthorProfile, AuthorRole } from '@/types/community';
import Image from 'next/image';

interface AuthorBadgeProps {
  author?: AuthorProfile | null;
  isAnonymous: boolean;
  anonymousName?: string;
  authorRole: AuthorRole;
  showRole?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function AuthorBadge({
  author,
  isAnonymous,
  anonymousName,
  authorRole,
  showRole = true,
  size = 'md',
  className = ''
}: AuthorBadgeProps) {
  const sizeClasses = {
    sm: { avatar: 'w-6 h-6', text: 'text-xs', badge: 'text-[10px] px-1.5 py-0.5' },
    md: { avatar: 'w-8 h-8', text: 'text-sm', badge: 'text-xs px-2 py-0.5' },
    lg: { avatar: 'w-10 h-10', text: 'text-base', badge: 'text-xs px-2 py-1' }
  };

  const sizes = sizeClasses[size];

  // Role badge colors
  const roleColors = {
    educator: 'bg-primary/10 text-primary',
    family: 'bg-teal-100 text-teal-700'
  };

  const roleLabels = {
    educator: 'Professionnel',
    family: 'Famille'
  };

  if (isAnonymous) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className={`${sizes.avatar} rounded-full bg-gray-200 flex items-center justify-center`}>
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <div className="flex flex-col">
          <span className={`${sizes.text} font-medium text-gray-700`}>
            {anonymousName || 'Anonyme'}
          </span>
          {showRole && (
            <span className={`${sizes.badge} rounded-full ${roleColors[authorRole]} font-medium inline-flex items-center gap-1 w-fit`}>
              {authorRole === 'educator' ? '🧑‍⚕️' : '👨‍👩‍👧'} {roleLabels[authorRole]}
            </span>
          )}
        </div>
      </div>
    );
  }

  const displayName = author
    ? `${author.first_name}${author.last_name ? ` ${author.last_name.charAt(0)}.` : ''}`
    : 'Utilisateur';

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`${sizes.avatar} rounded-full overflow-hidden bg-gray-100 flex-shrink-0`}>
        {author?.avatar_url ? (
          <Image
            src={author.avatar_url}
            alt={displayName}
            width={40}
            height={40}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className={`w-full h-full flex items-center justify-center ${authorRole === 'educator' ? 'bg-primary/20 text-primary' : 'bg-teal-100 text-teal-700'}`}>
            <span className="font-semibold text-sm">
              {author?.first_name?.charAt(0)?.toUpperCase() || '?'}
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className={`${sizes.text} font-medium text-gray-900`}>
            {displayName}
          </span>
          {author?.is_verified && (
            <svg className="w-4 h-4 text-teal-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          )}
        </div>
        {showRole && (
          <span className={`${sizes.badge} rounded-full ${roleColors[authorRole]} font-medium inline-flex items-center gap-1 w-fit`}>
            {authorRole === 'educator' ? '🧑‍⚕️' : '👨‍👩‍👧'} {roleLabels[authorRole]}
          </span>
        )}
      </div>
    </div>
  );
}
