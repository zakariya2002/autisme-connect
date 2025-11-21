'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { getCurrentPosition, reverseGeocode } from '@/lib/geolocation';
import AvatarUpload from '@/components/AvatarUpload';
import Logo from '@/components/Logo';

export default function FamilyProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [geolocating, setGeolocating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userId, setUserId] = useState<string>('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarModerationStatus, setAvatarModerationStatus] = useState<'pending' | 'approved' | 'rejected' | null>(null);
  const [avatarModerationReason, setAvatarModerationReason] = useState<string | null>(null);

  const [profileData, setProfileData] = useState({
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
    show_email: false,
    show_phone: false,
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        router.push('/auth/login');
        return;
      }

      setUserId(session.user.id);

      // Récupérer le profil famille
      const { data: profile } = await supabase
        .from('family_profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (profile) {
        setProfileData({
          first_name: profile.first_name || '',
          last_name: profile.last_name || '',
          phone: profile.phone || '',
          location: profile.location || '',
          relationship: profile.relationship || 'parent',
          person_with_autism_age: profile.person_with_autism_age?.toString() || '',
          support_level_needed: profile.support_level_needed || 'level_1',
          specific_needs: (profile.specific_needs || []).join(', '),
          preferred_certifications: profile.preferred_certifications || [],
          budget_min: profile.budget_min?.toString() || '',
          budget_max: profile.budget_max?.toString() || '',
          show_email: profile.show_email || false,
          show_phone: profile.show_phone || false,
        });

        // Charger les données d'avatar
        setAvatarUrl(profile.avatar_url || null);
        setAvatarModerationStatus(profile.avatar_moderation_status || null);
        setAvatarModerationReason(profile.avatar_moderation_reason || null);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error('Utilisateur non connecté');
      }

      // Mettre à jour le profil
      const { error: updateError } = await supabase
        .from('family_profiles')
        .update({
          first_name: profileData.first_name,
          last_name: profileData.last_name,
          phone: profileData.phone || null,
          location: profileData.location,
          relationship: profileData.relationship,
          person_with_autism_age: profileData.person_with_autism_age ? parseInt(profileData.person_with_autism_age) : null,
          support_level_needed: profileData.support_level_needed,
          specific_needs: profileData.specific_needs.split(',').map(s => s.trim()).filter(Boolean),
          preferred_certifications: profileData.preferred_certifications,
          budget_min: profileData.budget_min ? parseFloat(profileData.budget_min) : null,
          budget_max: profileData.budget_max ? parseFloat(profileData.budget_max) : null,
          show_email: profileData.show_email,
          show_phone: profileData.show_phone,
        })
        .eq('user_id', session.user.id);

      if (updateError) {
        throw updateError;
      }

      setSuccess('Profil mis à jour avec succès !');

      // Rediriger vers le dashboard après 1 seconde
      setTimeout(() => {
        router.push('/dashboard/family');
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la mise à jour');
      setSaving(false);
    }
  };

  const handleUseCurrentLocation = async () => {
    setGeolocating(true);
    try {
      const position = await getCurrentPosition();
      const address = await reverseGeocode(position.latitude, position.longitude);

      if (address) {
        setProfileData({ ...profileData, location: address });
        setSuccess('Localisation mise à jour !');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Impossible de déterminer votre adresse. Veuillez la saisir manuellement.');
        setTimeout(() => setError(''), 3000);
      }
    } catch (error: any) {
      setError(error.message || 'Erreur lors de la géolocalisation');
      setTimeout(() => setError(''), 3000);
    } finally {
      setGeolocating(false);
    }
  };

  const handleCertificationToggle = (cert: string) => {
    const current = profileData.preferred_certifications;
    if (current.includes(cert)) {
      setProfileData({
        ...profileData,
        preferred_certifications: current.filter(c => c !== cert),
      });
    } else {
      setProfileData({
        ...profileData,
        preferred_certifications: [...current, cert],
      });
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
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Logo href="/dashboard/family" />
            </div>
            <div>
              <Link href="/dashboard/family" className="text-gray-700 hover:text-primary-600 px-3 py-2">
                Retour au dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mon profil</h1>
          <p className="text-gray-600 mt-1">Gérez vos informations et préférences</p>
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

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Informations personnelles</h2>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Photo de profil */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Photo de profil</label>
              <AvatarUpload
                currentAvatarUrl={avatarUrl}
                userId={userId}
                profileType="family"
                moderationStatus={avatarModerationStatus}
                moderationReason={avatarModerationReason}
                onAvatarChange={(newUrl) => setAvatarUrl(newUrl)}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Prénom *</label>
                <input
                  type="text"
                  required
                  value={profileData.first_name}
                  onChange={(e) => setProfileData({ ...profileData, first_name: e.target.value })}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom *</label>
                <input
                  type="text"
                  required
                  value={profileData.last_name}
                  onChange={(e) => setProfileData({ ...profileData, last_name: e.target.value })}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
              <input
                type="tel"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            {/* Paramètres de confidentialité */}
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Paramètres de confidentialité</h3>
              <p className="text-sm text-gray-600 mb-4">
                Choisissez les informations de contact que vous souhaitez partager avec les éducateurs
              </p>
              <div className="space-y-3">
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    checked={profileData.show_phone}
                    onChange={(e) => setProfileData({ ...profileData, show_phone: e.target.checked })}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mt-0.5"
                  />
                  <span className="ml-3 text-sm text-gray-700">
                    <span className="font-medium">Afficher mon numéro de téléphone</span>
                    <span className="block text-gray-500 mt-1">Les éducateurs pourront voir votre téléphone</span>
                  </span>
                </label>
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    checked={profileData.show_email}
                    onChange={(e) => setProfileData({ ...profileData, show_email: e.target.checked })}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mt-0.5"
                  />
                  <span className="ml-3 text-sm text-gray-700">
                    <span className="font-medium">Afficher mon adresse e-mail</span>
                    <span className="block text-gray-500 mt-1">Les éducateurs pourront voir votre e-mail</span>
                  </span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Localisation *</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="Ex: Paris, France"
                  value={profileData.location}
                  onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                  className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500"
                />
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  disabled={geolocating}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {geolocating ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      <span className="hidden sm:inline">Localisation...</span>
                    </>
                  ) : (
                    <>
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="hidden sm:inline">Ma position</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Vous êtes *</label>
              <select
                value={profileData.relationship}
                onChange={(e) => setProfileData({ ...profileData, relationship: e.target.value })}
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="parent">Parent</option>
                <option value="guardian">Tuteur</option>
                <option value="self">Personne avec TSA</option>
                <option value="other">Autre</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Âge de la personne avec TSA</label>
              <input
                type="number"
                min="0"
                max="150"
                value={profileData.person_with_autism_age}
                onChange={(e) => setProfileData({ ...profileData, person_with_autism_age: e.target.value })}
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Niveau de soutien requis *</label>
              <select
                value={profileData.support_level_needed}
                onChange={(e) => setProfileData({ ...profileData, support_level_needed: e.target.value })}
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="level_1">Niveau 1 - Nécessite un soutien</option>
                <option value="level_2">Niveau 2 - Nécessite un soutien important</option>
                <option value="level_3">Niveau 3 - Nécessite un soutien très important</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Besoins spécifiques</label>
              <textarea
                rows={3}
                placeholder="Ex: Communication non verbale, Gestion des comportements, Compétences sociales"
                value={profileData.specific_needs}
                onChange={(e) => setProfileData({ ...profileData, specific_needs: e.target.value })}
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500"
              />
              <p className="mt-1 text-sm text-gray-500">Séparez les besoins par des virgules</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Certifications préférées</label>
              <div className="space-y-2">
                {['ABA', 'TEACCH', 'PECS', 'Makaton'].map(cert => (
                  <label key={cert} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={profileData.preferred_certifications.includes(cert)}
                      onChange={() => handleCertificationToggle(cert)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">{cert}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Budget minimum (€/h)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={profileData.budget_min}
                  onChange={(e) => setProfileData({ ...profileData, budget_min: e.target.value })}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Budget maximum (€/h)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={profileData.budget_max}
                  onChange={(e) => setProfileData({ ...profileData, budget_max: e.target.value })}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
              >
                {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
