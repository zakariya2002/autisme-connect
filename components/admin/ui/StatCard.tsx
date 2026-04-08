import { ReactNode } from 'react';
import Link from 'next/link';

interface StatCardProps {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  trend?: {
    value: string;
    direction: 'up' | 'down' | 'neutral';
  };
  href?: string;
  hint?: string;
}

const trendColors = {
  up: 'text-emerald-600 dark:text-emerald-400',
  down: 'text-red-600 dark:text-red-400',
  neutral: 'text-gray-500 dark:text-admin-muted-dark',
};

export function StatCard({ label, value, icon, trend, href, hint }: StatCardProps) {
  const content = (
    <div className="bg-white dark:bg-admin-surface-dark border border-gray-200 dark:border-admin-border-dark rounded-xl p-5 transition-colors hover:border-primary-300 dark:hover:border-primary-700">
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-admin-muted-dark">
          {label}
        </span>
        {icon && (
          <span className="text-primary-600 dark:text-primary-400 flex-shrink-0">
            {icon}
          </span>
        )}
      </div>
      <div className="text-3xl font-bold text-gray-900 dark:text-admin-text-dark">
        {value}
      </div>
      {(trend || hint) && (
        <div className="mt-2 flex items-center gap-2 text-xs">
          {trend && (
            <span className={`font-medium ${trendColors[trend.direction]}`}>
              {trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : '→'}{' '}
              {trend.value}
            </span>
          )}
          {hint && (
            <span className="text-gray-500 dark:text-admin-muted-dark">{hint}</span>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}
