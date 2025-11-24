'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function TndNav() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'ACCUEIL', icon: '🏠' },
    { href: '/search', label: 'RECHERCHE', icon: '🔍' },
    { href: '/about', label: 'À PROPOS', icon: '📖' },
    { href: '/pricing', label: 'TARIFS', icon: '💰' },
    { href: '/messages', label: 'MESSAGES', icon: '💬' },
    { href: '/contact', label: 'CONTACT', icon: '📧' },
    { href: '/support', label: 'AIDE', icon: '❓' },
  ];

  return (
    <nav className="bg-white border-b-4 border-blue-600 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="text-3xl font-bold text-blue-600">
            AUTISME CONNECT
          </div>
        </div>

        {/* Navigation links */}
        <div className="grid grid-cols-4 md:grid-cols-7 gap-1.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={`p-1.5 rounded-lg text-center transition-all border ${
                    isActive
                      ? 'bg-blue-600 text-white border-blue-800 shadow-md'
                      : 'bg-white text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-400'
                  }`}
                >
                  <div className="text-base mb-0.5">{item.icon}</div>
                  <div className="text-[0.6rem] font-bold leading-tight">{item.label}</div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
