'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { signOut } from '@/lib/auth';

type DiplomaStatus = 'pending' | 'verified' | 'rejected';

interface PendingEducator {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  specialization: string;
  diploma_url: string;
  diploma_submitted_at: string;
  diploma_verification_status: DiplomaStatus;
  diploma_rejected_reason?: string;
}

export default function VerifyDiplomasPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [educators, setEducators] = useState<PendingEducator[]>([]);
  const [filter, setFilter] = useState<'all' | DiplomaStatus>('pending');
  const [selectedEducator, setSelectedEducator] = useState<PendingEducator | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [markingDREETS, setMarkingDREETS] = useState(false);
  const [stats, setStats] = useState({
    pending: 0,
    verified: 0,
    rejected: 0,
    noDiploma: 0
  });

  useEffect(() => {
    checkAdminAuth();
  }, []);

  useEffect(() => {
    if (loading === false) {
      fetchEducators();
      fetchStats();
    }
  }, [loading, filter]);

  const checkAdminAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        router.push('/auth/login');
        return;
      }

      // Vérifier si l'utilisateur est admin
      const { data: userData } = await supabase.auth.getUser();
      const isAdmin = userData?.user?.user_metadata?.role === 'admin';

      if (!isAdmin) {
        alert('Accès non autorisé. Vous devez être administrateur.');
        router.push('/');
        return;
      }

      setLoading(false);
    } catch (error) {
      console.error('Erreur:', error);
      router.push('/');
    }
  };

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase
        .from('educator_profiles')
        .select('diploma_verification_status, diploma_url');

      if (error) {
        console.error('Erreur stats:', error);
        return;
      }

      const stats = {
        pending: (data || []).filter(e => e.diploma_verification_status === 'pending' && e.diploma_url).length,
        verified: (data || []).filter(e => e.diploma_verification_status === 'verified').length,
        rejected: (data || []).filter(e => e.diploma_verification_status === 'rejected').length,
        noDiploma: (data || []).filter(e => !e.diploma_url).length
      };

      setStats(stats);
    } catch (error) {
      console.error('Erreur stats:', error);
    }
  };

  const fetchEducators = async () => {
    try {
      // Récupérer le token d'authentification
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Appeler l'API route côté serveur
      const response = await fetch(`/api/admin/get-diplomas?filter=${filter}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      const result = await response.json();

      if (result.success) {
        setEducators(result.data || []);
      } else {
        console.error('Erreur API:', result.error);
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleVerify = async (educatorId: string, status: 'verified' | 'rejected') => {
    if (status === 'rejected' && !rejectReason.trim()) {
      alert('Veuillez indiquer une raison pour le rejet.');
      return;
    }

    setProcessing(true);

    try {
      // Récupérer le token d'authentification
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert('Session expirée. Reconnectez-vous.');
        return;
      }

      // Appeler l'API route pour gérer la vérification
      const response = await fetch('/api/admin/verify-diploma', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          educatorId,
          status,
          rejectReason: status === 'rejected' ? rejectReason : null
        })
      });

      const result = await response.json();

      if (result.success) {
        alert(`✅ ${result.message}\n\nUn email de notification a été envoyé à l'éducateur.`);

        // Rafraîchir la liste
        await fetchEducators();
        await fetchStats();

        // Fermer le modal
        setSelectedEducator(null);
        setRejectReason('');
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      console.error('Erreur:', error);
      alert('Erreur: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleMarkDREETSResponse = async (educatorId: string) => {
    if (!confirm('Confirmer que DREETS a répondu pour ce dossier ?')) {
      return;
    }

    setMarkingDREETS(true);

    try {
      const { error } = await supabase
        .from('educator_profiles')
        .update({
          dreets_response_date: new Date().toISOString(),
          dreets_verified: true
        })
        .eq('id', educatorId);

      if (error) throw error;

      alert('✅ Réponse DREETS enregistrée !');

      // Rafraîchir
      await fetchEducators();
      setSelectedEducator(null);
    } catch (error: any) {
      console.error('Erreur:', error);
      alert('Erreur: ' + error.message);
    } finally {
      setMarkingDREETS(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Navigation Admin */}
      <nav className="bg-gray-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold flex items-center">
                <span className="bg-yellow-500 text-gray-900 px-2 py-1 rounded mr-2">ADMIN</span>
                Autisme Connect
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-gray-300 hover:text-white px-3 py-2">
                Retour au site
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md font-medium transition"
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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Vérification des Diplômes</h1>
          <p className="text-gray-600">
            Validez ou refusez les diplômes des éducateurs pour contrôler leur visibilité sur la plateforme.
          </p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">En attente</p>
                <p className="text-3xl font-bold text-gray-900">{stats.pending}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <svg className="w-8 h-8 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Vérifiés</p>
                <p className="text-3xl font-bold text-gray-900">{stats.verified}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Refusés</p>
                <p className="text-3xl font-bold text-gray-900">{stats.rejected}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-gray-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Sans diplôme</p>
                <p className="text-3xl font-bold text-gray-900">{stats.noDiploma}</p>
              </div>
              <div className="p-3 bg-gray-100 rounded-full">
                <svg className="w-8 h-8 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-md font-medium transition ${
                filter === 'pending'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
              }`}
            >
              En attente ({stats.pending})
            </button>
            <button
              onClick={() => setFilter('verified')}
              className={`px-4 py-2 rounded-md font-medium transition ${
                filter === 'verified'
                  ? 'bg-green-600 text-white'
                  : 'bg-green-100 text-green-800 hover:bg-green-200'
              }`}
            >
              Vérifiés ({stats.verified})
            </button>
            <button
              onClick={() => setFilter('rejected')}
              className={`px-4 py-2 rounded-md font-medium transition ${
                filter === 'rejected'
                  ? 'bg-red-600 text-white'
                  : 'bg-red-100 text-red-800 hover:bg-red-200'
              }`}
            >
              Refusés ({stats.rejected})
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-md font-medium transition ${
                filter === 'all'
                  ? 'bg-gray-600 text-white'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              Tous
            </button>
          </div>
        </div>

        {/* Liste des éducateurs */}
        <div className="space-y-4">
          {educators.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Aucun diplôme</h3>
              <p className="text-gray-500 mt-2">
                {filter === 'pending' && 'Aucun diplôme en attente de vérification.'}
                {filter === 'verified' && 'Aucun diplôme vérifié pour le moment.'}
                {filter === 'rejected' && 'Aucun diplôme refusé.'}
                {filter === 'all' && 'Aucun éducateur trouvé.'}
              </p>
            </div>
          ) : (
            educators.map((educator) => (
              <div key={educator.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {educator.first_name} {educator.last_name}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        educator.diploma_verification_status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : educator.diploma_verification_status === 'verified'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {educator.diploma_verification_status === 'pending' && 'En attente'}
                        {educator.diploma_verification_status === 'verified' && 'Vérifié'}
                        {educator.diploma_verification_status === 'rejected' && 'Refusé'}
                      </span>
                    </div>

                    <div className="space-y-1 text-sm text-gray-600">
                      <p><strong>Email:</strong> {educator.email}</p>
                      <p><strong>Téléphone:</strong> {educator.phone || 'Non renseigné'}</p>
                      <p><strong>Spécialisation:</strong> {educator.specialization || 'Non renseignée'}</p>

                      {/* Dates importantes */}
                      {educator.diploma_submitted_at && (
                        <p><strong>📤 Soumis le:</strong> {new Date(educator.diploma_submitted_at).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</p>
                      )}

                      {/* Raison du refus */}
                      {educator.diploma_rejected_reason && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                          <p className="text-red-800">
                            <strong>❌ Raison du refus:</strong><br/>
                            {educator.diploma_rejected_reason}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    {educator.diploma_url ? (
                      <>
                        <button
                          onClick={() => setSelectedEducator(educator)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium transition shadow-sm hover:shadow whitespace-nowrap"
                        >
                          📄 Voir le diplôme
                        </button>

                        {educator.diploma_verification_status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleVerify(educator.id, 'verified')}
                              disabled={processing}
                              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium transition shadow-sm hover:shadow whitespace-nowrap disabled:opacity-50"
                            >
                              ✓ Accepter
                            </button>
                            <button
                              onClick={() => {
                                setSelectedEducator(educator);
                                // Le modal permettra de saisir la raison
                              }}
                              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium transition shadow-sm hover:shadow whitespace-nowrap"
                            >
                              ✗ Refuser
                            </button>
                          </>
                        )}
                      </>
                    ) : (
                      <span className="text-sm text-gray-500 italic">Pas de diplôme uploadé</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal pour voir le diplôme et actions */}
      {selectedEducator && selectedEducator.diploma_url && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedEducator(null)}>
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  Diplôme de {selectedEducator.first_name} {selectedEducator.last_name}
                </h2>
                <button
                  onClick={() => setSelectedEducator(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Informations de suivi */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">📋 Informations du diplôme</h3>
                  <div className="space-y-1 text-sm">
                    <p><strong>Soumis le:</strong> {selectedEducator.diploma_submitted_at
                      ? new Date(selectedEducator.diploma_submitted_at).toLocaleString('fr-FR')
                      : 'N/A'}</p>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-blue-900 mb-2">📧 Statut DREETS</h3>
                  <div className="space-y-2 text-sm">
                    {selectedEducator.dreets_verification_sent_at ? (
                      <>
                        <p className="text-green-700">
                          <strong>✅ Email envoyé le:</strong><br/>
                          {new Date(selectedEducator.dreets_verification_sent_at).toLocaleString('fr-FR')}
                        </p>
                        {selectedEducator.dreets_verified && selectedEducator.dreets_response_date ? (
                          <p className="text-green-700 font-semibold">
                            ✓ DREETS a répondu le:<br/>
                            {new Date(selectedEducator.dreets_response_date).toLocaleString('fr-FR')}
                          </p>
                        ) : selectedEducator.dreets_verified ? (
                          <p className="text-green-700 font-semibold">✓ DREETS a validé le diplôme</p>
                        ) : (
                          <>
                            <p className="text-orange-700">⏳ En attente de réponse DREETS</p>
                            <button
                              onClick={() => handleMarkDREETSResponse(selectedEducator.id)}
                              disabled={markingDREETS}
                              className="mt-2 px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 disabled:opacity-50"
                            >
                              {markingDREETS ? 'Enregistrement...' : '✓ Marquer comme répondu'}
                            </button>
                          </>
                        )}
                      </>
                    ) : (
                      <p className="text-orange-700">⚠️ Email DREETS non envoyé</p>
                    )}
                  </div>
                </div>

                {selectedEducator.diploma_ocr_text && (
                  <div className="md:col-span-2 bg-green-50 p-4 rounded-lg border border-green-200">
                    <h3 className="font-semibold text-green-900 mb-2">🔍 Analyse OCR</h3>
                    <p className="text-sm text-green-800 mb-2">
                      <strong>Confiance:</strong> {selectedEducator.diploma_ocr_confidence?.toFixed(0) || 'N/A'}%
                    </p>
                    <details className="text-sm">
                      <summary className="cursor-pointer font-medium text-green-900 hover:text-green-700">
                        Voir le texte extrait
                      </summary>
                      <div className="mt-2 p-3 bg-white rounded border border-green-200">
                        <pre className="whitespace-pre-wrap text-xs text-gray-700">
                          {selectedEducator.diploma_ocr_analysis || selectedEducator.diploma_ocr_text}
                        </pre>
                      </div>
                    </details>
                  </div>
                )}
              </div>

              {/* Affichage du diplôme */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">📄 Document</h3>
                {selectedEducator.diploma_url.endsWith('.pdf') ? (
                  <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                    <iframe
                      src={selectedEducator.diploma_url}
                      className="w-full h-96 rounded"
                      title="Diplôme PDF"
                    />
                    <a
                      href={selectedEducator.diploma_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-block text-primary-600 hover:text-primary-700"
                    >
                      Ouvrir dans un nouvel onglet →
                    </a>
                  </div>
                ) : (
                  <img
                    src={selectedEducator.diploma_url}
                    alt="Diplôme"
                    className="max-w-full h-auto rounded-lg border border-gray-300"
                  />
                )}
              </div>

              {/* Actions */}
              {selectedEducator.diploma_verification_status === 'pending' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Raison du refus (si vous refusez)
                    </label>
                    <textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Ex: Document illisible, diplôme non reconnu, etc."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleVerify(selectedEducator.id, 'verified')}
                      disabled={processing}
                      className="flex-1 px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium transition shadow-sm hover:shadow disabled:opacity-50"
                    >
                      {processing ? 'Traitement...' : '✓ Accepter le diplôme'}
                    </button>
                    <button
                      onClick={() => handleVerify(selectedEducator.id, 'rejected')}
                      disabled={processing || !rejectReason.trim()}
                      className="flex-1 px-4 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium transition shadow-sm hover:shadow disabled:opacity-50"
                    >
                      {processing ? 'Traitement...' : '✗ Refuser le diplôme'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
