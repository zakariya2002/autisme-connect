'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

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

export default function AdminCertificationsPage() {
  const router = useRouter();
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
      fetchDuplicates();
    }
  }, [filter, loading]);

  const fetchDuplicates = async () => {
    try {
      const { data, error } = await supabase
        .from('diploma_duplicates_alert')
        .select('*');

      if (error) {
        console.error('Erreur récupération doublons:', error);
        return;
      }

      setDuplicates(data || []);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const checkAdmin = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        router.push('/auth/login');
        return;
      }

      // TODO: Vérifier si l'utilisateur est admin
      // Pour l'instant, on permet l'accès à tous les utilisateurs connectés
      // Vous devrez ajouter une vérification de rôle admin ici

      setLoading(false);
    } catch (error) {
      console.error('Erreur vérification admin:', error);
      router.push('/');
    }
  };

  const fetchCertifications = async () => {
    try {
      let query = supabase
        .from('certifications')
        .select(`
          *,
          educator:educator_profiles!inner(
            id,
            first_name,
            last_name,
            user_id
          )
        `)
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('verification_status', filter);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erreur récupération certifications:', error);
        return;
      }

      // Ajouter un email par défaut (pas besoin d'accéder à auth.users pour l'instant)
      const certsWithEmails = data.map((cert: any) => ({
        ...cert,
        educator: {
          ...cert.educator,
          email: 'Non disponible' // On affichera juste "Non disponible" pour l'instant
        }
      }));

      setCertifications(certsWithEmails);
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
      const { error } = await supabase
        .from('certifications')
        .update({
          verification_status: status,
          verification_date: new Date().toISOString(),
          verification_notes: notes || null
        })
        .eq('id', selectedCert.id);

      if (error) throw error;

      alert('✅ Certification approuvée ! Un email a été envoyé à l\'éducateur.');
      closeModal();
      fetchCertifications();
    } catch (error: any) {
      alert('Erreur: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedCert) return;
    if (!notes.trim()) {
      alert('⚠️ Veuillez indiquer la raison du rejet dans les notes');
      return;
    }

    setProcessing(true);
    try {
      const { error } = await supabase
        .from('certifications')
        .update({
          verification_status: 'rejected',
          verification_date: new Date().toISOString(),
          verification_notes: notes
        })
        .eq('id', selectedCert.id);

      if (error) throw error;

      alert('❌ Certification rejetée. Un email a été envoyé à l\'éducateur.');
      closeModal();
      fetchCertifications();
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
          <h1 className="text-3xl font-bold text-gray-900">Modération des Certifications</h1>
          <p className="text-gray-600 mt-1">Vérifiez et validez les diplômes des éducateurs</p>
        </div>

        {/* Alertes de doublons */}
        {duplicates.length > 0 && (
          <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <svg className="h-6 w-6 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <h3 className="text-lg font-semibold text-orange-900">
                  ⚠️ {duplicates.length} numéro(s) de diplôme en doublon détecté(s)
                </h3>
              </div>
              <button
                onClick={() => setShowDuplicates(!showDuplicates)}
                className="px-3 py-1 bg-orange-600 text-white rounded-md hover:bg-orange-700 text-sm"
              >
                {showDuplicates ? 'Masquer' : 'Afficher'}
              </button>
            </div>

            {showDuplicates && (
              <div className="mt-4 space-y-3">
                {duplicates.map((dup) => (
                  <div key={dup.diploma_number} className="bg-white border border-orange-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="font-mono text-lg font-bold text-orange-900">{dup.diploma_number}</span>
                        <span className="ml-3 px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded">
                          {dup.diploma_type}
                        </span>
                      </div>
                      <span className="px-3 py-1 bg-red-100 text-red-700 font-semibold rounded-full">
                        Utilisé {dup.usage_count} fois
                      </span>
                    </div>
                    <div className="mt-3">
                      <p className="text-sm text-gray-600 font-medium mb-2">Certifications utilisant ce numéro :</p>
                      <ul className="space-y-2">
                        {dup.certifications_using_this_number.map((cert: any, idx: number) => (
                          <li key={idx} className="text-sm bg-gray-50 p-2 rounded border border-gray-200">
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="font-medium text-gray-900">{cert.educator_name}</span>
                                <span className="mx-2 text-gray-400">•</span>
                                <span className="text-gray-600">{new Date(cert.created_at).toLocaleDateString('fr-FR')}</span>
                              </div>
                              <span className={`px-2 py-1 text-xs rounded ${
                                cert.verification_status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                cert.verification_status === 'document_verified' ? 'bg-green-100 text-green-700' :
                                cert.verification_status === 'rejected' ? 'bg-red-100 text-red-700' :
                                'bg-blue-100 text-blue-700'
                              }`}>
                                {cert.verification_status}
                              </span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

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
              Toutes ({certifications.length})
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
              onClick={() => setFilter('document_verified')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'document_verified'
                  ? 'bg-green-600 text-white'
                  : 'bg-green-50 text-green-700 hover:bg-green-100'
              }`}
            >
              ✅ Vérifiées
            </button>
            <button
              onClick={() => setFilter('officially_confirmed')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'officially_confirmed'
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
              }`}
            >
              ⭐ Confirmées
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

        {/* Liste des certifications */}
        <div className="space-y-4">
          {certifications.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <p className="text-gray-500">Aucune certification à afficher</p>
            </div>
          ) : (
            certifications.map((cert) => (
              <div
                key={cert.id}
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">{cert.name}</h3>
                      {cert.verification_status === 'pending' && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full">
                          ⏳ En attente
                        </span>
                      )}
                      {cert.verification_status === 'document_verified' && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                          ✅ Vérifié
                        </span>
                      )}
                      {cert.verification_status === 'officially_confirmed' && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                          ⭐ Confirmé
                        </span>
                      )}
                      {cert.verification_status === 'rejected' && (
                        <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                          ❌ Rejeté
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Éducateur</p>
                        <p className="font-medium">
                          {cert.educator?.first_name} {cert.educator?.last_name}
                        </p>
                        <p className="text-gray-600 text-xs">{cert.educator?.email}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Type</p>
                        <p className="font-medium">{cert.type}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Organisme</p>
                        <p className="font-medium">{cert.issuing_organization}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Date d&apos;obtention</p>
                        <p className="font-medium">
                          {new Date(cert.issue_date).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      {cert.diploma_number && (
                        <div>
                          <p className="text-gray-500">Numéro du diplôme</p>
                          <p className="font-medium font-mono">{cert.diploma_number}</p>
                        </div>
                      )}
                      {cert.issuing_region && (
                        <div>
                          <p className="text-gray-500">Région</p>
                          <p className="font-medium">{cert.issuing_region}</p>
                        </div>
                      )}
                    </div>

                    {cert.verification_notes && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">
                          <strong>Notes :</strong> {cert.verification_notes}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="ml-6 flex flex-col gap-2">
                    {cert.document_url && (
                      <a
                        href={cert.document_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium text-center whitespace-nowrap"
                      >
                        📄 Voir le document
                      </a>
                    )}
                    {cert.verification_status === 'pending' && (
                      <button
                        onClick={() => openModal(cert)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium whitespace-nowrap"
                      >
                        ✅ Modérer
                      </button>
                    )}
                    {cert.verification_status !== 'pending' && (
                      <button
                        onClick={() => openModal(cert)}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-medium whitespace-nowrap"
                      >
                        👁️ Détails
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal de modération */}
      {modalOpen && selectedCert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Modération de la certification</h2>
              <p className="text-gray-600 mt-1">{selectedCert.name}</p>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 font-medium">Éducateur</p>
                  <p className="text-gray-900">
                    {selectedCert.educator?.first_name} {selectedCert.educator?.last_name}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">Email</p>
                  <p className="text-gray-900">{selectedCert.educator?.email}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">Type</p>
                  <p className="text-gray-900">{selectedCert.type}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">Organisme</p>
                  <p className="text-gray-900">{selectedCert.issuing_organization}</p>
                </div>
                {selectedCert.diploma_number && (
                  <div>
                    <p className="text-gray-500 font-medium">N° diplôme</p>
                    <p className="text-gray-900 font-mono">{selectedCert.diploma_number}</p>
                  </div>
                )}
                {selectedCert.issuing_region && (
                  <div>
                    <p className="text-gray-500 font-medium">Région</p>
                    <p className="text-gray-900">{selectedCert.issuing_region}</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes de vérification
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  placeholder="Ajoutez des notes sur la vérification (obligatoire en cas de rejet)"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              {selectedCert.document_url && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-blue-900 mb-2">Document à vérifier</p>
                  <a
                    href={selectedCert.document_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                  >
                    📄 Ouvrir le document dans un nouvel onglet
                  </a>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex flex-wrap gap-3">
              {selectedCert.verification_status === 'pending' && (
                <>
                  <button
                    onClick={() => handleApprove('document_verified')}
                    disabled={processing}
                    className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold disabled:opacity-50"
                  >
                    ✅ Approuver (Document vérifié)
                  </button>
                  <button
                    onClick={() => handleApprove('officially_confirmed')}
                    disabled={processing}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-50"
                  >
                    ⭐ Confirmer officiellement
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={processing}
                    className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold disabled:opacity-50"
                  >
                    ❌ Rejeter
                  </button>
                </>
              )}
              <button
                onClick={closeModal}
                disabled={processing}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold disabled:opacity-50"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
