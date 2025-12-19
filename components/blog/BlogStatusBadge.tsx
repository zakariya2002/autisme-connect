'use client';

import { BlogPostStatus, getStatusInfo } from '@/types/blog';

interface BlogStatusBadgeProps {
  status: BlogPostStatus;
  className?: string;
}

export default function BlogStatusBadge({ status, className = '' }: BlogStatusBadgeProps) {
  const { label, color, bgColor } = getStatusInfo(status);

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${className}`}
      style={{ backgroundColor: bgColor, color }}
    >
      {status === 'pending' && (
        <svg className="w-3 h-3 mr-1 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" />
        </svg>
      )}
      {status === 'published' && (
        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      )}
      {status === 'rejected' && (
        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      )}
      {label}
    </span>
  );
}
