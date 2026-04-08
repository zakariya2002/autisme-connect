'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/Toast';
import { Card, Badge, Button } from '@/components/admin/ui';

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

const filters: { value: 'all' | 'pending' | 'approved' | 'rejected'; label: string }[] = [
  { value: 'all', label: 'Toutes' },
  { value: 'pending', label: 'En attente' },
  { value: 'approved', label: 'Approuvées' },
  { value: 'rejected', label: 'Rejetées' },
];

export default function AdminAvatarsPage() {
  const router = useRouter();
  const { showToast } = useToast();
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
      const params = new URLSearchParams({ filter });
      const res = await fetch(`/api/admin/avatars?${params}`);
      if (!res.ok) throw new Error('Erreur chargement');
      const data = await res.json();
      const avatarsList: AvatarModeration[] = data.avatars || [];
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
      const res = await fetch('/api/admin/avatars/moderate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedAvatar.id, profile_type: selectedAvatar.profile_type, action: 'approve' }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      showToast('Photo approuvée !');
      closeModal();
      fetchAvatars();
    } catch (error: any) {
      showToast('Erreur: ' + error.message, 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedAvatar) return;
    if (!reason.trim()) {
      showToast('Veuillez indiquer la raison du rejet', 'info');
      return;
    }
    setProcessing(true);
    try {
      const res = await fetch('/api/admin/avatars/moderate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedAvatar.id, profile_type: selectedAvatar.profile_type, action: 'reject', reason }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      showToast('Photo rejetée.');
      closeModal();
      fetchAvatars();
    } catch (error: any) {
      showToast('Erreur: ' + error.message, 'error');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'approved') return <Badge variant="success">Approuvée</Badge>;
    if (status === 'rejected') return <Badge variant="danger">Rejetée</Badge>;
    return <Badge variant="warning">En attente</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary-200 border-t-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-admin-muted-dark">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-admin-text-dark">
          Photos de profil
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-admin-muted-dark">
          Vérifiez et validez les photos de profil
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {filters.map((f) => {
          const active = filter === f.value;
          return (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-primary-600 text-white'
                  : 'bg-white dark:bg-admin-surface-dark text-gray-700 dark:text-admin-muted-dark border border-gray-200 dark:border-admin-border-dark hover:bg-gray-50 dark:hover:bg-admin-surface-dark-2'
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Avatar grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {avatars.length === 0 ? (
          <div className="col-span-full">
            <Card padding="lg">
              <div className="text-center py-8">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 dark:bg-admin-surface-dark-2 flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-400 dark:text-admin-muted-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <p className="text-sm text-gray-500 dark:text-admin-muted-dark">
                  Aucune photo à afficher
                </p>
              </div>
            </Card>
          </div>
        ) : (
          avatars.map((avatar) => (
            <button
              key={`${avatar.profile_type}-${avatar.id}`}
              type="button"
              onClick={() => openModal(avatar)}
              className="text-left bg-white dark:bg-admin-surface-dark border border-gray-200 dark:border-admin-border-dark rounded-xl overflow-hidden hover:border-primary-300 dark:hover:border-primary-700 transition-colors"
            >
              <div className="aspect-square relative bg-gray-100 dark:bg-admin-surface-dark-2">
                {avatar.avatar_url ? (
                  <img
                    src={avatar.avatar_url}
                    alt={`${avatar.first_name} ${avatar.last_name}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-admin-muted-dark">
                    <svg className="h-16 w-16" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  {getStatusBadge(avatar.avatar_moderation_status)}
                </div>
              </div>
              <div className="p-3">
                <h3 className="font-semibold text-gray-900 dark:text-admin-text-dark text-sm truncate">
                  {avatar.first_name} {avatar.last_name}
                </h3>
                <p className="text-xs text-gray-500 dark:text-admin-muted-dark mt-0.5">
                  {avatar.profile_type === 'educator' ? 'Pro' : 'Famille'}
                </p>
                <p className="text-[10px] text-gray-400 dark:text-admin-muted-dark mt-1">
                  {new Date(avatar.created_at).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </button>
          ))
        )}
      </div>

      {/* Moderation modal */}
      {modalOpen && selectedAvatar && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-admin-surface-dark border border-gray-200 dark:border-admin-border-dark rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="px-5 py-4 border-b border-gray-200 dark:border-admin-border-dark flex justify-between items-start">
              <h2 className="text-lg font-bold text-gray-900 dark:text-admin-text-dark">
                Modération de photo
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 dark:text-admin-muted-dark hover:text-gray-600 dark:hover:text-admin-text-dark p-1 hover:bg-gray-100 dark:hover:bg-admin-surface-dark-2 rounded-lg"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-5">
              <div className="mb-6">
                <div className="aspect-square max-w-xs mx-auto relative bg-gray-100 dark:bg-admin-surface-dark-2 rounded-lg overflow-hidden">
                  {selectedAvatar.avatar_url ? (
                    <img
                      src={selectedAvatar.avatar_url}
                      alt={`${selectedAvatar.first_name} ${selectedAvatar.last_name}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-admin-muted-dark">
                      <svg className="h-24 w-24" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6 text-sm">
                <div>
                  <span className="text-xs text-gray-500 dark:text-admin-muted-dark uppercase">Utilisateur</span>
                  <p className="font-semibold text-gray-900 dark:text-admin-text-dark">
                    {selectedAvatar.first_name} {selectedAvatar.last_name}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-gray-500 dark:text-admin-muted-dark uppercase">Type</span>
                  <p className="font-semibold text-gray-900 dark:text-admin-text-dark">
                    {selectedAvatar.profile_type === 'educator' ? 'Professionnel' : 'Famille'}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-gray-500 dark:text-admin-muted-dark uppercase">Statut</span>
                  <div className="mt-1">
                    {getStatusBadge(selectedAvatar.avatar_moderation_status)}
                  </div>
                </div>
                {selectedAvatar.avatar_moderation_reason && (
                  <div>
                    <span className="text-xs text-gray-500 dark:text-admin-muted-dark uppercase">Raison</span>
                    <p className="text-red-600 dark:text-red-400 font-medium text-sm">
                      {selectedAvatar.avatar_moderation_reason}
                    </p>
                  </div>
                )}
              </div>

              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 dark:text-admin-text-dark mb-1.5">
                  Raison du rejet (si applicable)
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 text-sm rounded-lg border bg-white dark:bg-admin-surface-dark text-gray-900 dark:text-admin-text-dark border-gray-300 dark:border-admin-border-dark focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  placeholder="Photo inappropriée, de mauvaise qualité, etc."
                />
              </div>

              <div className="flex gap-3">
                <Button
                  variant="success"
                  fullWidth
                  loading={processing}
                  onClick={handleApprove}
                >
                  Approuver
                </Button>
                <Button
                  variant="danger"
                  fullWidth
                  loading={processing}
                  onClick={handleReject}
                >
                  Rejeter
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
