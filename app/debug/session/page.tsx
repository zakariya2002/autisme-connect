'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function DebugSessionPage() {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setSession(session);

    if (session) {
      // Chercher le profil éducateur
      const { data: educatorProfile } = await supabase
        .from('educator_profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (educatorProfile) {
        setProfile({ type: 'educator', ...educatorProfile });
        return;
      }

      // Chercher le profil famille
      const { data: familyProfile } = await supabase
        .from('family_profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (familyProfile) {
        setProfile({ type: 'family', ...familyProfile });
      }
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🔍 Debug Session</h1>

        {!session ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <p className="text-yellow-800 font-semibold">❌ Aucune session active</p>
            <p className="text-yellow-700 mt-2">Vous n'êtes pas connecté.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Informations de session */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">📧 Session utilisateur</h2>
              <div className="space-y-2">
                <div>
                  <span className="font-semibold">User ID:</span>
                  <code className="ml-2 bg-gray-100 px-2 py-1 rounded text-sm">{session.user.id}</code>
                </div>
                <div>
                  <span className="font-semibold">Email:</span>
                  <span className="ml-2">{session.user.email}</span>
                </div>
                <div>
                  <span className="font-semibold">Role:</span>
                  <span className="ml-2">{session.user.user_metadata?.role || 'Non défini'}</span>
                </div>
              </div>
            </div>

            {/* Informations de profil */}
            {profile ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4">✅ Profil trouvé</h2>
                <div className="space-y-2">
                  <div>
                    <span className="font-semibold">Type:</span>
                    <span className="ml-2 capitalize">{profile.type}</span>
                  </div>
                  <div>
                    <span className="font-semibold">Profile ID:</span>
                    <code className="ml-2 bg-white px-2 py-1 rounded text-sm">{profile.id}</code>
                  </div>
                  <div>
                    <span className="font-semibold">Nom:</span>
                    <span className="ml-2">{profile.first_name} {profile.last_name}</span>
                  </div>
                  <div>
                    <span className="font-semibold">Email:</span>
                    <span className="ml-2">{profile.email || 'N/A'}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4">❌ Aucun profil trouvé</h2>
                <p className="text-red-700">
                  Aucun profil éducateur ou famille n'est associé à cet utilisateur.
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">🔧 Actions</h2>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700"
              >
                Se déconnecter
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
