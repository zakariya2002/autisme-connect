'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { signOut } from '@/lib/auth';
import { getCurrentPosition, reverseGeocode } from '@/lib/geolocation';
import AvatarUpload from '@/components/AvatarUpload';
import FamilyNavbar from '@/components/FamilyNavbar';

export default function FamilyProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [geolocating, setGeolocating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [familyId, setFamilyId] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarModerationStatus, setAvatarModerationStatus] = useState<'pending' | 'approved' | 'rejected' | null>(null);
  const [avatarModerationReason, setAvatarModerationReason] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    location: '',
    relationship: 'parent',
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
        setProfile(profile);
        setFamilyId(profile.id);
        setProfileData({
          first_name: profile.first_name || '',
          last_name: profile.last_name || '',
          phone: profile.phone || '',
          location: profile.location || '',
          relationship: profile.relationship || 'parent',
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

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'SUPPRIMER') {
      setError('Veuillez taper exactement "SUPPRIMER" pour confirmer');
      return;
    }

    if (!userId) {
      setError('Erreur: utilisateur non identifié');
      return;
    }

    setDeleting(true);
    setError('');

    try {
      // 1. Supprimer le profil famille (cascade supprimera les données liées)
      const { error: profileError } = await supabase
        .from('family_profiles')
        .delete()
        .eq('id', profile.id);

      if (profileError) throw profileError;

      // 2. Supprimer le compte utilisateur
      const { error: authError } = await supabase.auth.admin.deleteUser(userId);

      if (authError) throw authError;

      // 3. Se déconnecter et rediriger
      await signOut();
      router.push('/?deleted=true');
    } catch (err: any) {
      console.error('Erreur suppression:', err);
      setError(err.message || 'Erreur lors de la suppression du compte');
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <FamilyNavbar profile={profile} familyId={familyId} userId={userId} />

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
                userId={userId || ''}
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
                <option value="self">Personne avec TND</option>
                <option value="other">Autre</option>
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

        {/* Export des données RGPD */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-8 border-2 border-blue-200">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Exporter mes données (RGPD)
            </h3>
            <p className="text-sm text-blue-700 mb-4">
              Conformément au RGPD, vous pouvez télécharger une copie de toutes vos données personnelles au format JSON.
            </p>
            <a
              href="/api/export-data"
              download
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Télécharger mes données
            </a>
          </div>
        </div>

        {/* Suppression du compte */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-8 border-2 border-red-200">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-red-800 mb-2">⚠️ Supprimer mon compte</h3>
            <p className="text-sm text-red-700 mb-3">
              Cette action est <strong>irréversible</strong>. Toutes vos données seront définitivement supprimées :
            </p>
            <ul className="text-sm text-red-700 space-y-1 mb-4 ml-4">
              <li>• Votre profil et vos informations personnelles</li>
              <li>• Vos préférences de recherche</li>
              <li>• Votre historique de messages</li>
              <li>• Vos favoris et éducateurs sauvegardés</li>
              <li>• Vos réservations et rendez-vous</li>
            </ul>

            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium transition"
              >
                Je veux supprimer mon compte
              </button>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-red-800 mb-2">
                    Pour confirmer, tapez exactement <span className="font-bold">SUPPRIMER</span>
                  </label>
                  <input
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder="Tapez SUPPRIMER"
                    className="w-full border-2 border-red-300 rounded-md shadow-sm py-2 px-3 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleting || deleteConfirmText !== 'SUPPRIMER'}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deleting ? 'Suppression en cours...' : 'Supprimer définitivement mon compte'}
                  </button>
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setDeleteConfirmText('');
                    }}
                    disabled={deleting}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 font-medium transition disabled:opacity-50"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
