'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface Document {
  id: string;
  document_type: string;
  file_url: string;
  status: 'pending' | 'approved' | 'rejected';
  uploaded_at: string;
  verified_at: string | null;
  rejection_reason: string | null;
}

interface EducatorProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  verification_status: string;
  verification_badge: boolean;
  profile_visible: boolean;
  created_at: string;
  admin_notes: string | null;
  interview_scheduled_date: string | null;
}


export default function EducatorVerificationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const educatorId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [educator, setEducator] = useState<EducatorProfile | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [processing, setProcessing] = useState(false);
  const [rejectionReason, setRejectionReason] = useState<{ [key: string]: string }>({});
  const [adminNotes, setAdminNotes] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  useEffect(() => {
    loadData();
  }, [educatorId]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Récupérer le profil éducateur
      const { data: profile, error: profileError } = await supabase
        .from('educator_profiles')
        .select('*')
        .eq('id', educatorId)
        .single();

      if (profileError) throw profileError;

      // Récupérer l'email via auth
      const { data: userData } = await supabase.auth.admin.getUserById(profile.user_id);

      const educatorData = {
        ...profile,
        email: userData?.user?.email || 'N/A'
      };

      setEducator(educatorData);
      setAdminNotes(educatorData.admin_notes || '');
      setScheduledDate(educatorData.interview_scheduled_date ? new Date(educatorData.interview_scheduled_date).toISOString().slice(0, 16) : '');

      // Récupérer les documents
      const { data: docs, error: docsError } = await supabase
        .from('verification_documents')
        .select('*')
        .eq('educator_id', educatorId)
        .order('uploaded_at', { ascending: false });

      if (docsError) throw docsError;
      setDocuments(docs || []);
    } catch (error) {
      console.error('Erreur chargement données:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDocumentInfo = (type: string) => {
    const infos: Record<string, { label: string; icon: string }> = {
      diploma: { label: 'Diplôme d\'État (DEES/DEME)', icon: '🎓' },
      criminal_record: { label: 'Casier judiciaire B3', icon: '📄' },
      id_card: { label: 'Pièce d\'identité', icon: '🪪' },
      insurance: { label: 'Assurance RC Pro', icon: '🛡️' }
    };
    return infos[type] || { label: type, icon: '📎' };
  };

  const handleApproveDocument = async (documentId: string, documentType: string) => {
    if (!confirm('Approuver ce document ?')) return;

    setProcessing(true);
    try {
      // Mettre à jour le document
      const { error } = await supabase
        .from('verification_documents')
        .update({
          status: 'approved',
          verified_at: new Date().toISOString()
        })
        .eq('id', documentId);

      if (error) throw error;

      // Si c'est le casier judiciaire, créer une entrée dans criminal_record_verifications
      if (documentType === 'criminal_record') {
        await supabase
          .from('criminal_record_verifications')
          .insert({
            educator_id: educatorId,
            verified_at: new Date().toISOString(),
            is_clean: true,
            notes: 'Casier vierge - Approuvé'
          });
      }

      // Vérifier si tous les documents sont approuvés
      const { data: allDocs } = await supabase
        .from('verification_documents')
        .select('status, document_type')
        .eq('educator_id', educatorId);

      const requiredTypes = ['diploma', 'criminal_record', 'id_card', 'insurance'];
      const approvedTypes = allDocs?.filter(d => d.status === 'approved').map(d => d.document_type) || [];
      const allApproved = requiredTypes.every(type => approvedTypes.includes(type));

      // Si tous approuvés, passer au statut documents_verified
      if (allApproved) {
        await supabase
          .from('educator_profiles')
          .update({ verification_status: 'documents_verified' })
          .eq('id', educatorId);
      }

      await loadData();
      alert('Document approuvé avec succès !');
    } catch (error) {
      console.error('Erreur approbation:', error);
      alert('Erreur lors de l\'approbation');
    } finally {
      setProcessing(false);
    }
  };

  const handleRejectDocument = async (documentId: string, documentType: string) => {
    const reason = rejectionReason[documentId];
    if (!reason || reason.trim() === '') {
      alert('Veuillez indiquer une raison de refus');
      return;
    }

    if (!confirm('Refuser ce document ? L\'éducateur devra en uploader un nouveau.')) return;

    setProcessing(true);
    try {
      // Mettre à jour le document
      const { error } = await supabase
        .from('verification_documents')
        .update({
          status: 'rejected',
          verified_at: new Date().toISOString(),
          rejection_reason: reason
        })
        .eq('id', documentId);

      if (error) throw error;

      // Si c'est le casier judiciaire refusé, créer l'entrée et rejeter l'éducateur
      if (documentType === 'criminal_record') {
        await supabase
          .from('criminal_record_verifications')
          .insert({
            educator_id: educatorId,
            verified_at: new Date().toISOString(),
            is_clean: false,
            notes: reason
          });

        // Rejeter l'éducateur définitivement
        await supabase
          .from('educator_profiles')
          .update({
            verification_status: 'rejected_criminal_record',
            verification_badge: false,
            profile_visible: false
          })
          .eq('id', educatorId);
      }

      await loadData();
      setRejectionReason({ ...rejectionReason, [documentId]: '' });
      alert('Document refusé');
    } catch (error) {
      console.error('Erreur rejet:', error);
      alert('Erreur lors du rejet');
    } finally {
      setProcessing(false);
    }
  };

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    try {
      const { error } = await supabase
        .from('educator_profiles')
        .update({
          admin_notes: adminNotes,
          interview_scheduled_date: scheduledDate ? new Date(scheduledDate).toISOString() : null
        })
        .eq('id', educatorId);

      if (error) throw error;

      await loadData();
      alert('✅ Notes sauvegardées avec succès !');
    } catch (error) {
      console.error('Erreur sauvegarde notes:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setSavingNotes(false);
    }
  };

  const handleMarkInterviewScheduled = async () => {
    if (!scheduledDate) {
      alert('Veuillez d\'abord renseigner la date du RDV');
      return;
    }

    if (!confirm('Confirmer que le RDV a été planifié avec l\'éducateur ?')) return;

    setProcessing(true);
    try {
      // Sauvegarder les notes et passer au statut interview_scheduled
      const { error } = await supabase
        .from('educator_profiles')
        .update({
          verification_status: 'interview_scheduled',
          admin_notes: adminNotes,
          interview_scheduled_date: new Date(scheduledDate).toISOString()
        })
        .eq('id', educatorId);

      if (error) throw error;

      await loadData();
      alert('✅ RDV marqué comme planifié !');
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la mise à jour');
    } finally {
      setProcessing(false);
    }
  };

  const handleApproveEducator = async () => {
    if (!confirm('APPROUVER DÉFINITIVEMENT cet éducateur ? Il recevra le badge vérifié et sera visible des familles.')) return;

    setProcessing(true);
    try {
      // Mettre à jour le profil avec le badge
      await supabase
        .from('educator_profiles')
        .update({
          verification_status: 'verified',
          verification_badge: true,
          profile_visible: true
        })
        .eq('id', educatorId);

      // Marquer l'entretien comme réussi
      await supabase
        .from('video_interviews')
        .update({
          status: 'passed',
          overall_result: 'passed',
          completed_at: new Date().toISOString()
        })
        .eq('educator_id', educatorId)
        .eq('status', 'pending');

      await loadData();
      alert('✅ Éducateur vérifié avec succès ! Badge activé.');
    } catch (error) {
      console.error('Erreur approbation finale:', error);
      alert('Erreur lors de l\'approbation finale');
    } finally {
      setProcessing(false);
    }
  };

  const handleRejectInterview = async () => {
    const reason = prompt('Raison du refus de l\'entretien :');
    if (!reason) return;

    if (!confirm('REFUSER DÉFINITIVEMENT cet éducateur suite à l\'entretien ?')) return;

    setProcessing(true);
    try {
      // Marquer l'entretien comme échoué
      await supabase
        .from('video_interviews')
        .update({
          status: 'failed',
          overall_result: 'failed',
          failure_reason: reason,
          completed_at: new Date().toISOString()
        })
        .eq('educator_id', educatorId)
        .eq('status', 'pending');

      // Rejeter l'éducateur
      await supabase
        .from('educator_profiles')
        .update({
          verification_status: 'rejected_interview',
          verification_badge: false,
          profile_visible: false
        })
        .eq('id', educatorId);

      await loadData();
      alert('Éducateur refusé suite à l\'entretien');
    } catch (error) {
      console.error('Erreur rejet entretien:', error);
      alert('Erreur lors du rejet');
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

  if (!educator) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Éducateur non trouvé</p>
          <Link href="/admin/verifications" className="text-primary-600 hover:underline mt-4 inline-block">
            Retour à la liste
          </Link>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; color: string }> = {
      pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
      approved: { label: 'Approuvé ✓', color: 'bg-green-100 text-green-800' },
      rejected: { label: 'Refusé ✗', color: 'bg-red-100 text-red-800' }
    };
    return badges[status] || badges.pending;
  };

  const allDocumentsApproved = documents.length === 4 && documents.every(d => d.status === 'approved');

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-4">
              <Link href="/admin/verifications" className="text-gray-600 hover:text-primary-600">
                ← Retour à la liste
              </Link>
              <h1 className="text-lg md:text-xl font-bold text-gray-900">Vérification de l'éducateur</h1>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Informations éducateur */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                {educator.first_name} {educator.last_name}
              </h2>
              <div className="space-y-1 text-sm text-gray-600">
                <p>📧 {educator.email}</p>
                {educator.phone && <p>📞 {educator.phone}</p>}
                <p>📅 Inscrit le {new Date(educator.created_at).toLocaleDateString('fr-FR')}</p>
              </div>
            </div>
            <div className="text-right">
              <div className={`inline-block px-4 py-2 rounded-lg font-bold ${
                educator.verification_status === 'verified' ? 'bg-green-100 text-green-800' :
                educator.verification_status.startsWith('rejected') ? 'bg-red-100 text-red-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {educator.verification_status.replace(/_/g, ' ').toUpperCase()}
              </div>
              {educator.verification_badge && (
                <div className="mt-2 text-green-600 font-semibold">
                  🏅 Badge vérifié
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Documents */}
        <div className="mb-8">
          <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4">📄 Documents soumis ({documents.length}/4)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {['diploma', 'criminal_record', 'id_card', 'insurance'].map((type) => {
              const doc = documents.find(d => d.document_type === type);
              const info = getDocumentInfo(type);
              const statusBadge = doc ? getStatusBadge(doc.status) : null;

              return (
                <div key={type} className={`bg-white rounded-lg shadow-lg border-2 p-6 ${
                  doc?.status === 'approved' ? 'border-green-300' :
                  doc?.status === 'rejected' ? 'border-red-300' :
                  doc ? 'border-yellow-300' :
                  'border-gray-200'
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{info.icon}</span>
                      <div>
                        <h4 className="font-bold text-gray-900">{info.label}</h4>
                        {doc && (
                          <p className="text-xs text-gray-500">
                            Uploadé le {new Date(doc.uploaded_at).toLocaleDateString('fr-FR')}
                          </p>
                        )}
                      </div>
                    </div>
                    {statusBadge && (
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusBadge.color}`}>
                        {statusBadge.label}
                      </span>
                    )}
                  </div>

                  {!doc ? (
                    <div className="text-center py-4 text-gray-500">
                      ❌ Document non uploadé
                    </div>
                  ) : (
                    <>
                      {/* Bouton voir le document */}
                      <a
                        href={`/api/verification-documents/${encodeURIComponent(doc.file_url)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full mb-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-center transition"
                      >
                        👁️ Voir le document
                      </a>

                      {/* Actions si en attente */}
                      {doc.status === 'pending' && (
                        <div className="space-y-3">
                          <button
                            onClick={() => handleApproveDocument(doc.id, type)}
                            disabled={processing}
                            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition disabled:opacity-50"
                          >
                            ✅ Approuver
                          </button>

                          <div>
                            <input
                              type="text"
                              placeholder="Raison du refus..."
                              value={rejectionReason[doc.id] || ''}
                              onChange={(e) => setRejectionReason({ ...rejectionReason, [doc.id]: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 text-sm"
                            />
                            <button
                              onClick={() => handleRejectDocument(doc.id, type)}
                              disabled={processing}
                              className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition disabled:opacity-50"
                            >
                              ❌ Refuser
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Message si refusé */}
                      {doc.status === 'rejected' && doc.rejection_reason && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-sm text-red-800">
                            <strong>Raison :</strong> {doc.rejection_reason}
                          </p>
                        </div>
                      )}

                      {/* Message si approuvé */}
                      {doc.status === 'approved' && (
                        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <p className="text-sm text-green-800">
                            ✓ Approuvé le {doc.verified_at && new Date(doc.verified_at).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions globales */}
        {educator.verification_status === 'documents_verified' && (
          <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-3">
              📞 Prochaine étape : Contacter l'éducateur pour l'entretien
            </h3>
            <p className="text-gray-700 mb-4">
              Tous les documents sont approuvés. Contactez l'éducateur pour planifier manuellement un entretien vidéo de 30 minutes.
            </p>

            <div className="bg-white rounded-lg p-4 shadow space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📧</span>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <a href={`mailto:${educator.email}`} className="text-lg font-bold text-blue-600 hover:underline">
                    {educator.email}
                  </a>
                </div>
              </div>

              {educator.phone && (
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📱</span>
                  <div>
                    <p className="text-sm text-gray-600">Téléphone</p>
                    <a href={`tel:${educator.phone}`} className="text-lg font-bold text-blue-600 hover:underline">
                      {educator.phone}
                    </a>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Rappel :</strong> Après l'entretien, revenez ici pour approuver ou refuser définitivement l'éducateur.
              </p>
            </div>

            {/* Section notes admin */}
            <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <h4 className="font-bold text-gray-900 mb-3">📝 Notes administrateur</h4>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    📅 Date & heure du RDV planifié
                  </label>
                  <input
                    type="datetime-local"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    📄 Notes (contexte, remarques, etc.)
                  </label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Ex: RDV téléphonique prévu le 15/12 à 14h, a mentionné une expérience de 5 ans..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={handleSaveNotes}
                    disabled={savingNotes}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium transition disabled:opacity-50"
                  >
                    {savingNotes ? 'Sauvegarde...' : '💾 Sauvegarder'}
                  </button>
                  <button
                    onClick={handleMarkInterviewScheduled}
                    disabled={processing || !scheduledDate}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ✅ RDV planifié
                  </button>
                </div>
                <p className="text-xs text-gray-500 text-center mt-2">
                  💡 Cliquez sur "RDV planifié" une fois que vous avez confirmé le rendez-vous avec l'éducateur
                </p>
              </div>
            </div>
          </div>
        )}

        {educator.verification_status === 'interview_scheduled' && (
          <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-3">
              📞 Entretien en cours
            </h3>

            <div className="bg-white rounded-lg p-4 shadow space-y-3 mb-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📧</span>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <a href={`mailto:${educator.email}`} className="text-lg font-bold text-blue-600 hover:underline">
                    {educator.email}
                  </a>
                </div>
              </div>

              {educator.phone && (
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📱</span>
                  <div>
                    <p className="text-sm text-gray-600">Téléphone</p>
                    <a href={`tel:${educator.phone}`} className="text-lg font-bold text-blue-600 hover:underline">
                      {educator.phone}
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Section notes admin */}
            {educator.admin_notes || educator.interview_scheduled_date ? (
              <div className="mb-4 p-4 bg-white border border-blue-200 rounded-lg">
                <h4 className="font-bold text-blue-900 mb-2">📝 Notes administrateur</h4>
                {educator.interview_scheduled_date && (
                  <p className="text-sm text-gray-700 mb-1">
                    <strong>📅 RDV prévu :</strong>{' '}
                    {new Date(educator.interview_scheduled_date).toLocaleString('fr-FR', {
                      dateStyle: 'full',
                      timeStyle: 'short'
                    })}
                  </p>
                )}
                {educator.admin_notes && (
                  <p className="text-sm text-gray-700">
                    <strong>📄 Notes :</strong> {educator.admin_notes}
                  </p>
                )}
              </div>
            ) : null}

            <p className="text-gray-700 mb-4">
              Après l'entretien, validez ou refusez définitivement cet éducateur.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleApproveEducator}
                disabled={processing}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold transition disabled:opacity-50"
              >
                ✅ APPROUVER (Badge vérifié)
              </button>
              <button
                onClick={handleRejectInterview}
                disabled={processing}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-bold transition disabled:opacity-50"
              >
                ❌ REFUSER (Définitif)
              </button>
            </div>
          </div>
        )}

        {allDocumentsApproved && educator.verification_status === 'documents_submitted' && (
          <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6">
            <h3 className="text-lg font-bold text-green-800 mb-3">
              ✅ Tous les documents sont approuvés !
            </h3>
            <p className="text-gray-700 mb-4">
              Contactez l'éducateur pour planifier l'entretien vidéo.
            </p>

            <div className="bg-white rounded-lg p-4 shadow space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📧</span>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <a href={`mailto:${educator.email}`} className="text-lg font-bold text-blue-600 hover:underline">
                    {educator.email}
                  </a>
                </div>
              </div>

              {educator.phone && (
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📱</span>
                  <div>
                    <p className="text-sm text-gray-600">Téléphone</p>
                    <a href={`tel:${educator.phone}`} className="text-lg font-bold text-blue-600 hover:underline">
                      {educator.phone}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
