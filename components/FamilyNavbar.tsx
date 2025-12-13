'use client';

import Logo from '@/components/Logo';
import FamilyMobileMenu from '@/components/FamilyMobileMenu';
import FamilyNotificationBell from '@/components/FamilyNotificationBell';
import { signOut } from '@/lib/auth';

interface FamilyNavbarProps {
  profile?: any;
  familyId?: string | null;
  userId?: string | null;
}

export default function FamilyNavbar({ profile, familyId, userId }: FamilyNavbarProps) {
  const handleLogout = async () => {
    await signOut();
    window.location.href = '/';
  };

  return (
    <nav className="bg-white shadow-sm flex-shrink-0 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14 sm:h-16 items-center">
          {/* Logo - redirige vers le dashboard */}
          <Logo href="/dashboard/family" />

          {/* Menu mobile */}
          <div className="md:hidden flex items-center gap-2">
            {familyId && userId && (
              <FamilyNotificationBell familyId={familyId} userId={userId} />
            )}
            <FamilyMobileMenu profile={profile} onLogout={handleLogout} />
          </div>

          {/* Menu desktop - Logo, Notifications, Déconnexion uniquement */}
          <div className="hidden md:flex items-center space-x-4">
            {familyId && userId && (
              <FamilyNotificationBell familyId={familyId} userId={userId} />
            )}
            <button
              onClick={handleLogout}
              className="text-purple-600 bg-purple-50 hover:bg-purple-100 px-4 py-2 rounded-lg font-medium transition"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
