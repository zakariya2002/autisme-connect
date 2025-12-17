'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { signOut } from '@/lib/auth';
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
    <nav className="sticky top-0 z-40" style={{ backgroundColor: '#027e7e' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 sm:h-20 items-center relative">
          {/* Menu mobile (hamburger) à gauche */}
          <div className="flex items-center gap-2">
            <EducatorMobileMenu profile={profile} isPremium={isPremium} onLogout={handleLogout} />
          </div>

          {/* Logo centré */}
          <Link href="/dashboard/educator" className="absolute left-1/2 transform -translate-x-1/2" aria-label="Retour au tableau de bord éducateur">
            <img
              src="/images/logo-neurocare.svg"
              alt="NeuroCare - Retour au tableau de bord"
              className="h-20"
            />
          </Link>

          {/* Menu desktop - Notifications et déconnexion à droite */}
          <div className="flex items-center gap-4">
            {profile?.id && userId && (
              <NotificationBell educatorId={profile.id} userId={userId} />
            )}
            {isPremium && (
              <Link href="/dashboard/educator/subscription" className="hidden md:flex text-white hover:text-teal-100 px-3 py-2 font-medium transition items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Mon abonnement
              </Link>
            )}
            <button onClick={handleLogout} className="hidden md:block text-white hover:text-teal-100 px-3 py-2 font-medium transition">
              Déconnexion
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
