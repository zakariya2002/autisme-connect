'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { signOut } from '@/lib/auth';
import LogoPro from '@/components/LogoPro';
import EducatorMobileMenu from '@/components/EducatorMobileMenu';
import NotificationBell from '@/components/NotificationBell';

interface EducatorNavbarProps {
  profile?: any;
  subscription?: any;
}

export default function EducatorNavbar({ profile: propProfile, subscription: propSubscription }: EducatorNavbarProps) {
  const [profile, setProfile] = useState<any>(propProfile || null);
  const [subscription, setSubscription] = useState<any>(propSubscription || null);
  const [userId, setUserId] = useState<string>('');
  const [loading, setLoading] = useState(!propProfile);

  useEffect(() => {
    if (!propProfile) {
      fetchData();
    } else {
      setProfile(propProfile);
      setSubscription(propSubscription);
    }
  }, [propProfile, propSubscription]);

  const fetchData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      setUserId(session.user.id);

      // Récupérer le profil éducateur
      const { data: educatorProfile } = await supabase
        .from('educator_profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (educatorProfile) {
        setProfile(educatorProfile);

        // Récupérer l'abonnement
        const { data: sub } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('educator_id', educatorProfile.id)
          .single();

        setSubscription(sub);
      }
    } catch (error) {
      console.error('Erreur chargement navbar:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    window.location.href = '/';
  };

  const isPremium = subscription && ['active', 'trialing'].includes(subscription.status);

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo Pro - visible sur mobile et desktop, redirige vers le dashboard */}
          <LogoPro href="/dashboard/educator" iconSize="md" />

          {/* Menu mobile (hamburger) */}
          <div className="md:hidden flex items-center gap-2">
            {profile?.id && userId && (
              <NotificationBell educatorId={profile.id} userId={userId} />
            )}
            <EducatorMobileMenu profile={profile} isPremium={isPremium} onLogout={handleLogout} />
          </div>

          {/* Menu desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {profile?.id && userId && (
              <NotificationBell educatorId={profile.id} userId={userId} />
            )}
            {isPremium && (
              <Link href="/dashboard/educator/subscription" className="text-gray-700 hover:text-teal-600 px-3 py-2 font-medium transition flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Mon abonnement
              </Link>
            )}
            <button onClick={handleLogout} className="text-gray-700 hover:text-teal-600 px-3 py-2 font-medium transition">
              Déconnexion
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
