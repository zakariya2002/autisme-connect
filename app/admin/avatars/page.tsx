'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface AvatarModeration {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  avatar_url: string;
  avatar_moderation_status: string;
  avatar_moderation_reason: string | null;
  created_at: string;
  profile_type: 'educator' | 'family';
}

export default function AdminAvatarsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [avatars, setAvatars] = useState<AvatarModeration[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarModeration | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    checkAdmin();
  }, []);

  useEffect(() => {
    if (loading === false) {
      fetchAvatars();
    }
  }, [filter, loading]);

  const checkAdmin = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        router.push('/auth/login');
        return;
      }
      setLoading(false);
    } catch (error) {
      console.error('Erreur vérification admin:', error);
      router.push('/');
    }
  };

  const fetchAvatars = async () => {
    try {
      const avatarsList: AvatarModeration[] = [];

      // Récupérer les avatars des éducateurs
      let educatorQuery = supabase
        .from('educator_profiles')
        .select('id, user_id, first_name, last_name, avatar_url, avatar_moderation_status, avatar_moderation_reason, created_at')
        .not('avatar_url', 'is', null);

      if (filter !== 'all') {
        educatorQuery = educatorQuery.eq('avatar_moderation_status', filter);
      }

      const { data: educators } = await educatorQuery;

      if (educators) {
        avatarsList.push(
          ...educators.map((edu) => ({
            ...edu,
            profile_type: 'educator' as const
          }))
        );
      }

      // Récupérer les avatars des familles
      let familyQuery = supabase
        .from('family_profiles')
        .select('id, user_id, first_name, last_name, avatar_url, avatar_moderation_status, avatar_moderation_reason, created_at')
        .not('avatar_url', 'is', null);

      if (filter !== 'all') {
        familyQuery = familyQuery.eq('avatar_moderation_status', filter);
      }

      const { data: families } = await familyQuery;

      if (families) {
        avatarsList.push(
          ...families.map((fam) => ({
            ...fam,
            profile_type: 'family' as const
          }))
        );
      }

      // Trier par date de création (plus récent en premier)
      avatarsList.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setAvatars(avatarsList);
    } catch (error) {
      console.error('Erreur récupération avatars:', error);
    }
  };

  const openModal = (avatar: AvatarModeration) => {
    setSelectedAvatar(avatar);
    setReason(avatar.avatar_moderation_reason || '');
    setModalOpen(true);
  };

  const closeModal = () => {
    setSelectedAvatar(null);
    setReason('');
    setModalOpen(false);
  };

  const handleApprove = async () => {
    if (!selectedAvatar) return;

    setProcessing(true);
    try {
      const table = selectedAvatar.profile_type === 'educator' ? 'educator_profiles' : 'family_profiles';

      const { error } = await supabase
        .from(table)
        .update({
          avatar_moderation_status: 'approved',
          avatar_moderation_reason: null
        })
        .eq('id', selectedAvatar.id);

      if (error) throw error;

      alert('✅ Photo approuvée !');
      closeModal();
      fetchAvatars();
    } catch (error: any) {
      alert('Erreur: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedAvatar) return;
    if (!reason.trim()) {
      alert('⚠️ Veuillez indiquer la raison du rejet');
      return;
    }

    setProcessing(true);
    try {
      const table = selectedAvatar.profile_type === 'educator' ? 'educator_profiles' : 'family_profiles';

      const { error } = await supabase
        .from(table)
        .update({
          avatar_moderation_status: 'rejected',
          avatar_moderation_reason: reason,
          avatar_url: null // Supprimer l'URL de la photo rejetée
        })
        .eq('id', selectedAvatar.id);

      if (error) throw error;

      alert('❌ Photo rejetée.');
      closeModal();
      fetchAvatars();
    } catch (error: any) {
      alert('Erreur: ' + error.message);
    } finally {
      setProcessing(false);
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
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Link href="/dashboard/educator" className="text-2xl font-bold text-primary-600">
                Autisme Connect
              </Link>
              <span className="ml-4 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
                ADMIN
              </span>
            </div>
            <div className="flex gap-4">
              <Link
                href="/admin/certifications"
                className="text-gray-700 hover:text-primary-600 px-3 py-2"
              >
                Certifications
              </Link>
              <Link
                href="/dashboard/educator"
                className="text-gray-700 hover:text-primary-600 px-3 py-2"
              >
                Dashboard
              </Link>
              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  router.push('/');
                }}
                className="text-gray-700 hover:text-red-600 px-3 py-2"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Modération des Photos de Profil</h1>
          <p className="text-gray-600 mt-1">Vérifiez et validez les photos de profil des utilisateurs</p>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Toutes ({avatars.length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'pending'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
              }`}
            >
              ⏳ En attente
            </button>
            <button
              onClick={() => setFilter('approved')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'approved'
                  ? 'bg-green-600 text-white'
                  : 'bg-green-50 text-green-700 hover:bg-green-100'
              }`}
            >
              ✅ Approuvées
            </button>
            <button
              onClick={() => setFilter('rejected')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'rejected'
                  ? 'bg-red-600 text-white'
                  : 'bg-red-50 text-red-700 hover:bg-red-100'
              }`}
            >
              ❌ Rejetées
            </button>
          </div>
        </div>

        {/* Grille des avatars */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {avatars.length === 0 ? (
            <div className="col-span-full bg-white rounded-lg shadow-sm p-12 text-center">
              <p className="text-gray-500">Aucune photo à afficher</p>
            </div>
          ) : (
            avatars.map((avatar) => (
              <div
                key={`${avatar.profile_type}-${avatar.id}`}
                className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => openModal(avatar)}
              >
                {/* Photo */}
                <div className="aspect-square relative bg-gray-100">
                  {avatar.avatar_url ? (
                    <img
                      src={avatar.avatar_url}
                      alt={`${avatar.first_name} ${avatar.last_name}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <svg className="h-24 w-24" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}

                  {/* Badge de statut */}
                  <div className="absolute top-2 right-2">
                    {avatar.avatar_moderation_status === 'pending' && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full">
                        ⏳ En attente
                      </span>
                    )}
                    {avatar.avatar_moderation_status === 'approved' && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                        ✅ Approuvée
                      </span>
                    )}
                    {avatar.avatar_moderation_status === 'rejected' && (
                      <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                        ❌ Rejetée
                      </span>
                    )}
                  </div>
                </div>

                {/* Informations */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900">
                    {avatar.first_name} {avatar.last_name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {avatar.profile_type === 'educator' ? '👨‍🏫 Éducateur' : '👨‍👩‍👧 Famille'}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(avatar.created_at).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal de modération */}
      {modalOpen && selectedAvatar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Modération de photo</h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Photo en grand */}
              <div className="mb-6">
                <div className="aspect-square relative bg-gray-100 rounded-lg overflow-hidden">
                  {selectedAvatar.avatar_url ? (
                    <img
                      src={selectedAvatar.avatar_url}
                      alt={`${selectedAvatar.first_name} ${selectedAvatar.last_name}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <svg className="h-32 w-32" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>

              {/* Informations */}
              <div className="space-y-3 mb-6">
                <div>
                  <span className="text-sm text-gray-600">Utilisateur :</span>
                  <p className="font-semibold">{selectedAvatar.first_name} {selectedAvatar.last_name}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Type :</span>
                  <p className="font-semibold">
                    {selectedAvatar.profile_type === 'educator' ? '👨‍🏫 Éducateur' : '👨‍👩‍👧 Famille'}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Statut actuel :</span>
                  <p className="font-semibold">
                    {selectedAvatar.avatar_moderation_status === 'pending' && '⏳ En attente'}
                    {selectedAvatar.avatar_moderation_status === 'approved' && '✅ Approuvée'}
                    {selectedAvatar.avatar_moderation_status === 'rejected' && '❌ Rejetée'}
                  </p>
                </div>
                {selectedAvatar.avatar_moderation_reason && (
                  <div>
                    <span className="text-sm text-gray-600">Raison du rejet :</span>
                    <p className="text-red-600 font-medium">{selectedAvatar.avatar_moderation_reason}</p>
                  </div>
                )}
              </div>

              {/* Champ de raison pour le rejet */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Raison du rejet (si applicable)
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Photo inappropriée, de mauvaise qualité, etc."
                />
              </div>

              {/* Boutons d'action */}
              <div className="flex gap-3">
                <button
                  onClick={handleApprove}
                  disabled={processing}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-semibold"
                >
                  {processing ? 'Traitement...' : '✅ Approuver'}
                </button>
                <button
                  onClick={handleReject}
                  disabled={processing}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 font-semibold"
                >
                  {processing ? 'Traitement...' : '❌ Rejeter'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
