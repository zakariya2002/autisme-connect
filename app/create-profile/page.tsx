'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getCurrentPosition, reverseGeocode } from '@/lib/geolocation';

export default function CreateProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [geolocating, setGeolocating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [role, setRole] = useState<'educator' | 'family'>('educator');

  const [educatorData, setEducatorData] = useState({
    first_name: '',
    last_name: '',
    bio: '',
    phone: '',
    location: '',
    years_of_experience: 0,
    hourly_rate: '',
    specializations: '',
    languages: '',
  });

  const [familyData, setFamilyData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    location: '',
    relationship: 'parent',
    person_with_autism_age: '',
    support_level_needed: 'level_1',
    specific_needs: '',
    preferred_certifications: [] as string[],
    budget_min: '',
    budget_max: '',
  });

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user: currentUser } } = await supabase.auth.getUser();

    if (!currentUser) {
      router.push('/auth/login');
      return;
    }

    setUser(currentUser);
    setLoading(false);
  };

  const handleUseCurrentLocation = async (type: 'educator' | 'family') => {
    setGeolocating(true);
    try {
      const position = await getCurrentPosition();
      const address = await reverseGeocode(position.latitude, position.longitude);

      if (address) {
        if (type === 'educator') {
          setEducatorData({ ...educatorData, location: address });
        } else {
          setFamilyData({ ...familyData, location: address });
        }
        setSuccess('Localisation mise à jour !');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error: any) {
      setError(error.message);
      setTimeout(() => setError(''), 3000);
    } finally {
      setGeolocating(false);
    }
  };

  const handleCertificationToggle = (cert: string) => {
    const current = familyData.preferred_certifications;
    if (current.includes(cert)) {
      setFamilyData({
        ...familyData,
        preferred_certifications: current.filter(c => c !== cert),
      });
    } else {
      setFamilyData({
        ...familyData,
        preferred_certifications: [...current, cert],
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      if (role === 'educator') {
        const { error: insertError } = await supabase
          .from('educator_profiles')
          .insert({
            user_id: user.id,
            first_name: educatorData.first_name,
            last_name: educatorData.last_name,
            bio: educatorData.bio || '',
            phone: educatorData.phone || null,
            location: educatorData.location,
            years_of_experience: educatorData.years_of_experience,
            hourly_rate: educatorData.hourly_rate ? parseFloat(educatorData.hourly_rate) : null,
            specializations: educatorData.specializations.split(',').map(s => s.trim()).filter(Boolean),
            languages: educatorData.languages.split(',').map(l => l.trim()).filter(Boolean),
          });

        if (insertError) throw insertError;

        setSuccess('Profil éducateur créé avec succès !');
        setTimeout(() => {
          router.push('/dashboard/educator');
        }, 1500);
      } else {
        const { error: insertError } = await supabase
          .from('family_profiles')
          .insert({
            user_id: user.id,
            first_name: familyData.first_name,
            last_name: familyData.last_name,
            phone: familyData.phone || null,
            location: familyData.location,
            relationship: familyData.relationship,
            person_with_autism_age: familyData.person_with_autism_age ? parseInt(familyData.person_with_autism_age) : null,
            support_level_needed: familyData.support_level_needed,
            specific_needs: familyData.specific_needs.split(',').map(s => s.trim()).filter(Boolean),
            preferred_certifications: familyData.preferred_certifications,
            budget_min: familyData.budget_min ? parseFloat(familyData.budget_min) : null,
            budget_max: familyData.budget_max ? parseFloat(familyData.budget_max) : null,
          });

        if (insertError) throw insertError;

        setSuccess('Profil famille créé avec succès !');
        setTimeout(() => {
          router.push('/dashboard/family');
        }, 1500);
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création du profil');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Créer votre profil</h1>
          <p className="mt-2 text-gray-600">Complétez vos informations pour commencer</p>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded">
            {success}
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6">
          {/* Sélection du rôle */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Je suis :</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setRole('educator')}
                className={`p-4 border-2 rounded-lg ${
                  role === 'educator'
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="font-semibold">Éducateur</div>
                <div className="text-sm text-gray-600">ABA, TEACCH, PECS</div>
              </button>
              <button
                type="button"
                onClick={() => setRole('family')}
                className={`p-4 border-2 rounded-lg ${
                  role === 'family'
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="font-semibold">Famille</div>
                <div className="text-sm text-gray-600">Parent, tuteur, proche</div>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {role === 'educator' ? (
              <>
                {/* Formulaire Éducateur */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
                    <input
                      type="text"
                      required
                      value={educatorData.first_name}
                      onChange={(e) => setEducatorData({ ...educatorData, first_name: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                    <input
                      type="text"
                      required
                      value={educatorData.last_name}
                      onChange={(e) => setEducatorData({ ...educatorData, last_name: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                  <input
                    type="tel"
                    value={educatorData.phone}
                    onChange={(e) => setEducatorData({ ...educatorData, phone: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Localisation *</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Ex: Paris, France"
                      value={educatorData.location}
                      onChange={(e) => setEducatorData({ ...educatorData, location: e.target.value })}
                      className="flex-1 border border-gray-300 rounded-md px-3 py-2"
                    />
                    <button
                      type="button"
                      onClick={() => handleUseCurrentLocation('educator')}
                      disabled={geolocating}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                    >
                      {geolocating ? '...' : 'Ma position'}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                  <textarea
                    rows={3}
                    value={educatorData.bio}
                    onChange={(e) => setEducatorData({ ...educatorData, bio: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Années d'expérience *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={educatorData.years_of_experience}
                      onChange={(e) => setEducatorData({ ...educatorData, years_of_experience: parseInt(e.target.value) })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tarif horaire (€)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={educatorData.hourly_rate}
                      onChange={(e) => setEducatorData({ ...educatorData, hourly_rate: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Spécialisations</label>
                  <input
                    type="text"
                    placeholder="Ex: ABA, TEACCH, PECS"
                    value={educatorData.specializations}
                    onChange={(e) => setEducatorData({ ...educatorData, specializations: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                  <p className="text-sm text-gray-500 mt-1">Séparez par des virgules</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Langues parlées</label>
                  <input
                    type="text"
                    placeholder="Ex: Français, Anglais"
                    value={educatorData.languages}
                    onChange={(e) => setEducatorData({ ...educatorData, languages: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                  <p className="text-sm text-gray-500 mt-1">Séparez par des virgules</p>
                </div>
              </>
            ) : (
              <>
                {/* Formulaire Famille */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
                    <input
                      type="text"
                      required
                      value={familyData.first_name}
                      onChange={(e) => setFamilyData({ ...familyData, first_name: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                    <input
                      type="text"
                      required
                      value={familyData.last_name}
                      onChange={(e) => setFamilyData({ ...familyData, last_name: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                  <input
                    type="tel"
                    value={familyData.phone}
                    onChange={(e) => setFamilyData({ ...familyData, phone: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Localisation *</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Ex: Paris, France"
                      value={familyData.location}
                      onChange={(e) => setFamilyData({ ...familyData, location: e.target.value })}
                      className="flex-1 border border-gray-300 rounded-md px-3 py-2"
                    />
                    <button
                      type="button"
                      onClick={() => handleUseCurrentLocation('family')}
                      disabled={geolocating}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                    >
                      {geolocating ? '...' : 'Ma position'}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vous êtes *</label>
                  <select
                    value={familyData.relationship}
                    onChange={(e) => setFamilyData({ ...familyData, relationship: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="parent">Parent</option>
                    <option value="guardian">Tuteur</option>
                    <option value="self">Personne avec TSA</option>
                    <option value="other">Autre</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Âge de la personne avec TSA</label>
                  <input
                    type="number"
                    min="0"
                    max="150"
                    value={familyData.person_with_autism_age}
                    onChange={(e) => setFamilyData({ ...familyData, person_with_autism_age: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Niveau de soutien requis *</label>
                  <select
                    value={familyData.support_level_needed}
                    onChange={(e) => setFamilyData({ ...familyData, support_level_needed: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="level_1">Niveau 1 - Nécessite un soutien</option>
                    <option value="level_2">Niveau 2 - Nécessite un soutien important</option>
                    <option value="level_3">Niveau 3 - Nécessite un soutien très important</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Besoins spécifiques</label>
                  <textarea
                    rows={2}
                    placeholder="Ex: Communication non verbale, Gestion des comportements"
                    value={familyData.specific_needs}
                    onChange={(e) => setFamilyData({ ...familyData, specific_needs: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                  <p className="text-sm text-gray-500 mt-1">Séparez par des virgules</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Certifications préférées</label>
                  <div className="space-y-2">
                    {['ABA', 'TEACCH', 'PECS', 'Makaton'].map(cert => (
                      <label key={cert} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={familyData.preferred_certifications.includes(cert)}
                          onChange={() => handleCertificationToggle(cert)}
                          className="h-4 w-4 text-primary-600 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">{cert}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Budget min (€/h)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={familyData.budget_min}
                      onChange={(e) => setFamilyData({ ...familyData, budget_min: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Budget max (€/h)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={familyData.budget_max}
                      onChange={(e) => setFamilyData({ ...familyData, budget_max: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 font-semibold"
            >
              {saving ? 'Création en cours...' : 'Créer mon profil'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
