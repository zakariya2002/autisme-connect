'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function DebugPage() {
  const [user, setUser] = useState<any>(null);
  const [educatorProfile, setEducatorProfile] = useState<any>(null);
  const [familyProfile, setFamilyProfile] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    debugData();
  }, []);

  const debugData = async () => {
    try {
      // 1. Vérifier l'utilisateur connecté
      const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();

      if (userError) {
        setError(`Erreur utilisateur: ${userError.message}`);
        setLoading(false);
        return;
      }

      setUser(currentUser);

      if (!currentUser) {
        setError('Aucun utilisateur connecté');
        setLoading(false);
        return;
      }

      // 2. Chercher le profil éducateur
      const { data: educatorData, error: educatorError } = await supabase
        .from('educator_profiles')
        .select('*')
        .eq('user_id', currentUser.id);

      if (educatorError) {
        console.error('Erreur profil éducateur:', educatorError);
      } else {
        setEducatorProfile(educatorData);
      }

      // 3. Chercher le profil famille
      const { data: familyData, error: familyError } = await supabase
        .from('family_profiles')
        .select('*')
        .eq('user_id', currentUser.id);

      if (familyError) {
        console.error('Erreur profil famille:', familyError);
      } else {
        setFamilyProfile(familyData);
      }

      setLoading(false);
    } catch (err: any) {
      setError(`Erreur générale: ${err.message}`);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <h1 className="text-2xl font-bold mb-4">Chargement...</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-6">🔍 Page de Debug</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Utilisateur connecté */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">👤 Utilisateur connecté</h2>
        {user ? (
          <div className="space-y-2">
            <p><strong>ID:</strong> {user.id}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Créé le:</strong> {new Date(user.created_at).toLocaleString()}</p>
            <details className="mt-4">
              <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                Voir JSON complet
              </summary>
              <pre className="mt-2 bg-gray-100 p-4 rounded overflow-auto text-xs">
                {JSON.stringify(user, null, 2)}
              </pre>
            </details>
          </div>
        ) : (
          <p className="text-red-600">❌ Aucun utilisateur connecté</p>
        )}
      </div>

      {/* Profil Éducateur */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">🎓 Profil Éducateur</h2>
        {educatorProfile && educatorProfile.length > 0 ? (
          <div className="space-y-2">
            <p className="text-green-600 font-bold">✅ Profil trouvé ({educatorProfile.length} résultat(s))</p>
            {educatorProfile.map((profile: any, index: number) => (
              <div key={index} className="border-t pt-4 mt-4">
                <p><strong>Nom:</strong> {profile.first_name} {profile.last_name}</p>
                <p><strong>Localisation:</strong> {profile.location || 'Non renseigné'}</p>
                <p><strong>Téléphone:</strong> {profile.phone || 'Non renseigné'}</p>
                <p><strong>Expérience:</strong> {profile.years_of_experience} ans</p>
                <p><strong>Tarif:</strong> {profile.hourly_rate ? `${profile.hourly_rate}€/h` : 'Non renseigné'}</p>
                <details className="mt-4">
                  <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                    Voir JSON complet
                  </summary>
                  <pre className="mt-2 bg-gray-100 p-4 rounded overflow-auto text-xs">
                    {JSON.stringify(profile, null, 2)}
                  </pre>
                </details>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-orange-600">⚠️ Aucun profil éducateur trouvé</p>
        )}
      </div>

      {/* Profil Famille */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">👨‍👩‍👧‍👦 Profil Famille</h2>
        {familyProfile && familyProfile.length > 0 ? (
          <div className="space-y-2">
            <p className="text-green-600 font-bold">✅ Profil trouvé ({familyProfile.length} résultat(s))</p>
            {familyProfile.map((profile: any, index: number) => (
              <div key={index} className="border-t pt-4 mt-4">
                <p><strong>Nom:</strong> {profile.first_name} {profile.last_name}</p>
                <p><strong>Localisation:</strong> {profile.location || 'Non renseigné'}</p>
                <p><strong>Téléphone:</strong> {profile.phone || 'Non renseigné'}</p>
                <p><strong>Relation:</strong> {profile.relationship}</p>
                <p><strong>Niveau de soutien:</strong> {profile.support_level_needed}</p>
                <details className="mt-4">
                  <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                    Voir JSON complet
                  </summary>
                  <pre className="mt-2 bg-gray-100 p-4 rounded overflow-auto text-xs">
                    {JSON.stringify(profile, null, 2)}
                  </pre>
                </details>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-orange-600">⚠️ Aucun profil famille trouvé</p>
        )}
      </div>

      <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
        <p className="font-bold">💡 Instructions:</p>
        <p>Si aucun profil n'est trouvé, cela signifie que le profil n'a jamais été créé lors de l'inscription.</p>
        <p className="mt-2">Vous devrez vous réinscrire ou créer le profil manuellement.</p>
      </div>
    </div>
  );
}
