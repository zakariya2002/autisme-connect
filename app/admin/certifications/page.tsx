'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/Toast';
import { Card, Badge, Button } from '@/components/admin/ui';

interface Certification {
  id: string;
  name: string;
  type: string;
  issuing_organization: string;
  issue_date: string;
  diploma_number: string | null;
  issuing_region: string | null;
  document_url: string | null;
  verification_status: string;
  verification_date: string | null;
  verification_notes: string | null;
  created_at: string;
  educator_id: string;
  educator?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

interface DiplomaDuplicate {
  diploma_number: string;
  diploma_type: string;
  usage_count: number;
  certifications_using_this_number: any[];
}

const filters: { value: 'all' | 'pending' | 'document_verified' | 'officially_confirmed' | 'rejected'; label: string }[] = [
  { value: 'all', label: 'Toutes' },
  { value: 'pending', label: 'En attente' },
  { value: 'document_verified', label: 'Vérifiées' },
  { value: 'officially_confirmed', label: 'Confirmées' },
  { value: 'rejected', label: 'Rejetées' },
];

export default function AdminCertificationsPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [duplicates, setDuplicates] = useState<DiplomaDuplicate[]>([]);
  const [showDuplicates, setShowDuplicates] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'document_verified' | 'officially_confirmed' | 'rejected'>('pending');
  const [selectedCert, setSelectedCert] = useState<Certification | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    checkAdmin();
  }, []);

  useEffect(() => {
    if (loading === false) {
      fetchCertifications();
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

  const fetchCertifications = async () => {
    try {
      const params = new URLSearchParams({ filter });
      const res = await fetch(`/api/admin/certifications?${params}`);
      if (!res.ok) throw new Error('Erreur chargement');
      const data = await res.json();
      setCertifications(data.certifications || []);
      setDuplicates(data.duplicates || []);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const openModal = (cert: Certification) => {
    setSelectedCert(cert);
    setNotes(cert.verification_notes || '');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedCert(null);
    setNotes('');
  };

  const handleApprove = async (status: 'document_verified' | 'officially_confirmed') => {
    if (!selectedCert) return;
    setProcessing(true);
    try {
      const res = await fetch('/api/admin/certifications/moderate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          certId: selectedCert.id,
          action: 'approve',
          status,
          notes: notes || null,
          certName: selectedCert.name,
          educatorUserId: (selectedCert as any).educator?.user_id,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      showToast('Certification approuvée ! L\'éducateur a été notifié.');
      closeModal();
      fetchCertifications();
    } catch (error: any) {
      showToast('Erreur: ' + error.message, 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedCert) return;
    if (!notes.trim()) {
      showToast('Veuillez indiquer la raison du rejet dans les notes', 'info');
      return;
    }
    setProcessing(true);
    try {
      const res = await fetch('/api/admin/certifications/moderate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          certId: selectedCert.id,
          action: 'reject',
          notes,
          certName: selectedCert.name,
          educatorUserId: (selectedCert as any).educator?.user_id,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      showToast('Certification rejetée. L\'éducateur a été notifié.');
      closeModal();
      fetchCertifications();
    } catch (error: any) {
      showToast('Erreur: ' + error.message, 'error');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'document_verified') return <Badge variant="success">Vérifié</Badge>;
    if (status === 'officially_confirmed') return <Badge variant="info">Confirmé</Badge>;
    if (status === 'rejected') return <Badge variant="danger">Rejeté</Badge>;
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
          Certifications
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-admin-muted-dark">
          Vérifiez et validez les diplômes
        </p>
      </div>

      {/* Duplicates alert */}
      {duplicates.length > 0 && (
        <Card padding="md" className="border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-900/10">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <h3 className="font-semibold text-amber-900 dark:text-amber-300">
                {duplicates.length} numéro(s) de diplôme en doublon
              </h3>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowDuplicates(!showDuplicates)}
            >
              {showDuplicates ? 'Masquer' : 'Afficher'}
            </Button>
          </div>

          {showDuplicates && (
            <div className="mt-4 space-y-3">
              {duplicates.map((dup) => (
                <div key={dup.diploma_number} className="bg-white dark:bg-admin-surface-dark border border-gray-200 dark:border-admin-border-dark rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-gray-900 dark:text-admin-text-dark">
                        {dup.diploma_number}
                      </span>
                      <Badge variant="neutral">{dup.diploma_type}</Badge>
                    </div>
                    <Badge variant="danger">Utilisé {dup.usage_count} fois</Badge>
                  </div>
                  <ul className="space-y-2 mt-3">
                    {dup.certifications_using_this_number.map((cert: any, idx: number) => (
                      <li key={idx} className="text-sm bg-gray-50 dark:bg-admin-surface-dark-2 p-2 rounded border border-gray-200 dark:border-admin-border-dark">
                        <div className="flex justify-between items-start gap-2 flex-wrap">
                          <div>
                            <span className="font-medium text-gray-900 dark:text-admin-text-dark">{cert.educator_name}</span>
                            <span className="mx-2 text-gray-400 dark:text-admin-muted-dark">•</span>
                            <span className="text-gray-600 dark:text-admin-muted-dark">{new Date(cert.created_at).toLocaleDateString('fr-FR')}</span>
                          </div>
                          {getStatusBadge(cert.verification_status)}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

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

      {/* Cert list */}
      <div className="space-y-3">
        {certifications.length === 0 ? (
          <Card padding="lg">
            <div className="text-center py-8">
              <p className="text-sm text-gray-500 dark:text-admin-muted-dark">
                Aucune certification à afficher
              </p>
            </div>
          </Card>
        ) : (
          certifications.map((cert) => (
            <Card key={cert.id} padding="md">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <h3 className="text-base font-bold text-gray-900 dark:text-admin-text-dark">
                      {cert.name}
                    </h3>
                    {getStatusBadge(cert.verification_status)}
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-admin-muted-dark uppercase">Éducateur</p>
                      <p className="font-medium text-gray-900 dark:text-admin-text-dark">
                        {cert.educator?.first_name} {cert.educator?.last_name}
                      </p>
                      <p className="text-gray-600 dark:text-admin-muted-dark text-xs truncate">{cert.educator?.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-admin-muted-dark uppercase">Type</p>
                      <p className="font-medium text-gray-900 dark:text-admin-text-dark">{cert.type}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-admin-muted-dark uppercase">Organisme</p>
                      <p className="font-medium text-gray-900 dark:text-admin-text-dark truncate">{cert.issuing_organization}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-admin-muted-dark uppercase">Date d&apos;obtention</p>
                      <p className="font-medium text-gray-900 dark:text-admin-text-dark">
                        {new Date(cert.issue_date).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    {cert.diploma_number && (
                      <div>
                        <p className="text-xs text-gray-500 dark:text-admin-muted-dark uppercase">N° diplôme</p>
                        <p className="font-medium font-mono text-xs text-gray-900 dark:text-admin-text-dark">{cert.diploma_number}</p>
                      </div>
                    )}
                    {cert.issuing_region && (
                      <div>
                        <p className="text-xs text-gray-500 dark:text-admin-muted-dark uppercase">Région</p>
                        <p className="font-medium text-gray-900 dark:text-admin-text-dark">{cert.issuing_region}</p>
                      </div>
                    )}
                  </div>

                  {cert.verification_notes && (
                    <div className="mt-3 p-3 bg-gray-50 dark:bg-admin-surface-dark-2 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-admin-muted-dark">
                        <strong className="text-gray-900 dark:text-admin-text-dark">Notes :</strong> {cert.verification_notes}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex sm:flex-col gap-2 sm:ml-4">
                  {cert.document_url && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => window.open(cert.document_url!, '_blank')}
                    >
                      Voir
                    </Button>
                  )}
                  <Button
                    variant={cert.verification_status === 'pending' ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => openModal(cert)}
                  >
                    {cert.verification_status === 'pending' ? 'Modérer' : 'Détails'}
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Moderation modal */}
      {modalOpen && selectedCert && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-admin-surface-dark border border-gray-200 dark:border-admin-border-dark rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-5 py-4 border-b border-gray-200 dark:border-admin-border-dark">
              <h2 className="text-lg font-bold text-gray-900 dark:text-admin-text-dark">
                Modération de la certification
              </h2>
              <p className="text-gray-600 dark:text-admin-muted-dark mt-1 text-sm">{selectedCert.name}</p>
            </div>

            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-gray-500 dark:text-admin-muted-dark uppercase">Éducateur</p>
                  <p className="text-gray-900 dark:text-admin-text-dark">
                    {selectedCert.educator?.first_name} {selectedCert.educator?.last_name}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-admin-muted-dark uppercase">Email</p>
                  <p className="text-gray-900 dark:text-admin-text-dark truncate">{selectedCert.educator?.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-admin-muted-dark uppercase">Type</p>
                  <p className="text-gray-900 dark:text-admin-text-dark">{selectedCert.type}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-admin-muted-dark uppercase">Organisme</p>
                  <p className="text-gray-900 dark:text-admin-text-dark truncate">{selectedCert.issuing_organization}</p>
                </div>
                {selectedCert.diploma_number && (
                  <div>
                    <p className="text-xs text-gray-500 dark:text-admin-muted-dark uppercase">N° diplôme</p>
                    <p className="text-gray-900 dark:text-admin-text-dark font-mono text-xs">{selectedCert.diploma_number}</p>
                  </div>
                )}
                {selectedCert.issuing_region && (
                  <div>
                    <p className="text-xs text-gray-500 dark:text-admin-muted-dark uppercase">Région</p>
                    <p className="text-gray-900 dark:text-admin-text-dark">{selectedCert.issuing_region}</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-admin-text-dark mb-2">
                  Notes de vérification
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Ajoutez des notes sur la vérification (obligatoire en cas de rejet)"
                  className="w-full px-3 py-2 text-sm rounded-lg border bg-white dark:bg-admin-surface-dark text-gray-900 dark:text-admin-text-dark border-gray-300 dark:border-admin-border-dark focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                />
              </div>

              {selectedCert.document_url && (
                <div className="bg-gray-50 dark:bg-admin-surface-dark-2 border border-gray-200 dark:border-admin-border-dark rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-900 dark:text-admin-text-dark mb-2">Document à vérifier</p>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => window.open(selectedCert.document_url!, '_blank')}
                  >
                    Ouvrir le document
                  </Button>
                </div>
              )}
            </div>

            <div className="p-5 border-t border-gray-200 dark:border-admin-border-dark flex flex-col sm:flex-row flex-wrap gap-3">
              {selectedCert.verification_status === 'pending' && (
                <>
                  <Button
                    variant="success"
                    fullWidth
                    loading={processing}
                    onClick={() => handleApprove('document_verified')}
                  >
                    Approuver
                  </Button>
                  <Button
                    variant="primary"
                    fullWidth
                    loading={processing}
                    onClick={() => handleApprove('officially_confirmed')}
                  >
                    Confirmer
                  </Button>
                  <Button
                    variant="danger"
                    fullWidth
                    loading={processing}
                    onClick={handleReject}
                  >
                    Rejeter
                  </Button>
                </>
              )}
              <Button
                variant="secondary"
                fullWidth
                disabled={processing}
                onClick={closeModal}
              >
                Fermer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
