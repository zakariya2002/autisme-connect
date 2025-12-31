'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function ChooseRolePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'family' | 'educator' | null>(null);

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté et a déjà un rôle
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login');
        return;
      }

      const role = user.user_metadata?.role;
      if (role) {
        // Rediriger si le rôle existe déjà
        if (role === 'educator') {
          router.push('/dashboard/educator');
        } else if (role === 'family') {
          router.push('/dashboard/family');
        }
      }
    };

    checkUser();
  }, [router]);

  const handleRoleSelection = async () => {
    if (!selectedRole) return;

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { role: selectedRole }
      });

      if (error) throw error;

      // Rediriger vers le tableau de bord approprié
      if (selectedRole === 'educator') {
        router.push('/dashboard/educator');
      } else {
        router.push('/dashboard/family');
      }
    } catch (err: any) {
      console.error('Erreur lors de la mise à jour du rôle:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ backgroundColor: '#fdf9f4' }}>
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Bienvenue sur NeuroCare !
          </h1>
          <p className="text-gray-600">
            Pour finaliser votre inscription, veuillez choisir votre profil
          </p>
        </div>

        <div className="space-y-4 mb-8">
          {/* Option Aidant */}
          <button
            type="button"
            onClick={() => setSelectedRole('family')}
            className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
              selectedRole === 'family'
                ? 'border-[#027e7e] bg-[#027e7e]/5'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                selectedRole === 'family' ? 'bg-[#027e7e]' : 'bg-gray-100'
              }`}>
                <svg className={`w-6 h-6 ${selectedRole === 'family' ? 'text-white' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Je suis un aidant</h3>
                <p className="text-sm text-gray-500">Parent, proche ou personne avec TND</p>
              </div>
            </div>
          </button>

          {/* Option Professionnel */}
          <button
            type="button"
            onClick={() => setSelectedRole('educator')}
            className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
              selectedRole === 'educator'
                ? 'border-[#41005c] bg-[#41005c]/5'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                selectedRole === 'educator' ? 'bg-[#41005c]' : 'bg-gray-100'
              }`}>
                <svg className={`w-6 h-6 ${selectedRole === 'educator' ? 'text-white' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Je suis un professionnel</h3>
                <p className="text-sm text-gray-500">Éducateur, thérapeute, intervenant</p>
              </div>
            </div>
          </button>
        </div>

        <button
          onClick={handleRoleSelection}
          disabled={!selectedRole || loading}
          className="w-full py-3 px-4 rounded-xl text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: selectedRole === 'educator' ? '#41005c' : '#027e7e' }}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Chargement...
            </span>
          ) : (
            'Continuer'
          )}
        </button>
      </div>
    </div>
  );
}
