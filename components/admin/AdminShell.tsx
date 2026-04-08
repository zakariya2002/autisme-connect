'use client';

import { ReactNode, useState } from 'react';
import { ThemeProvider } from './ThemeProvider';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

export function AdminShell({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-admin-bg-dark text-gray-900 dark:text-admin-text-dark">
        <div className="flex h-screen overflow-hidden">
          <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <div className="flex-1 flex flex-col overflow-hidden">
            <TopBar onMenuClick={() => setSidebarOpen(true)} />
            <main className="flex-1 overflow-y-auto">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {children}
              </div>
            </main>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}
