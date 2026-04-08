'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminTheme } from './ThemeProvider';
import { supabase } from '@/lib/supabase';

interface TopBarProps {
  onMenuClick: () => void;
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const router = useRouter();
  const { theme, toggle } = useAdminTheme();
  const [today, setToday] = useState('');

  useEffect(() => {
    const d = new Date();
    setToday(
      d.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      })
    );
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-admin-surface-dark/80 backdrop-blur-md border-b border-gray-200 dark:border-admin-border-dark">
      <div className="flex items-center justify-between h-14 px-4 sm:px-6">
        {/* Left: hamburger (mobile) + date (desktop) */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg text-gray-600 dark:text-admin-muted-dark hover:bg-gray-100 dark:hover:bg-admin-surface-dark-2"
            aria-label="Ouvrir le menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="hidden sm:inline text-sm text-gray-500 dark:text-admin-muted-dark capitalize">
            {today}
          </span>
        </div>

        {/* Right: theme toggle, notifications, logout */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Theme toggle */}
          <button
            onClick={toggle}
            className="p-2 rounded-lg text-gray-600 dark:text-admin-muted-dark hover:bg-gray-100 dark:hover:bg-admin-surface-dark-2 transition-colors"
            aria-label={theme === 'dark' ? 'Passer au mode clair' : 'Passer au mode sombre'}
            title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
          >
            {theme === 'dark' ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          {/* Notification bell */}
          <button
            className="relative p-2 rounded-lg text-gray-600 dark:text-admin-muted-dark hover:bg-gray-100 dark:hover:bg-admin-surface-dark-2 transition-colors"
            aria-label="Notifications"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg text-gray-600 dark:text-admin-muted-dark hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors"
            aria-label="Déconnexion"
            title="Déconnexion"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
