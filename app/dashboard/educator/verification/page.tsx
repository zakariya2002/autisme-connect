'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type DocumentType = 'diploma' | 'criminal_record' | 'id_card' | 'insurance';

interface VerificationDocument {
  id: string;
  document_type: DocumentType;
  file_url: string | null;
  status: 'pending' | 'approved' | 'rejected';
  uploaded_at: string;
  verified_at: string | null;
  rejection_reason: string | null;
}

interface EducatorProfile {
  id: string;
  verification_status: string;
  verification_badge: boolean;
}

export default function VerificationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<DocumentType | null>(null);
  const [educatorProfile, setEducatorProfile] = useState<EducatorProfile | null>(null);
  const [documents, setDocuments] = useState<VerificationDocument[]>([]);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchVerificationData();
  }, []);

  const fetchVerificationData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth/login');
        return;
      }

      // Récupérer le profil éducateur
      const { data: profile, error: profileError } = await supabase
        .from('educator_profiles')
        .select('id, verification_status, verification_badge')
        .eq('user_id', session.user.id)
        .single();

      if (profileError) throw profileError;
      setEducatorProfile(profile);

      // Récupérer les documents
      const { data: docs, error: docsError } = await supabase
        .from('verification_documents')
        .select('*')
        .eq('educator_id', profile.id)
        .order('uploaded_at', { ascending: false });

      if (docsError) throw docsError;
      setDocuments(docs || []);
    } catch (err: any) {
      console.error('Error fetching verification data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (documentType: DocumentType, file: File) => {
    if (!educatorProfile) return;

    setUploading(documentType);
    setError('');
    setSuccessMessage('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Non authentifié');

      // Upload vers Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${session.user.id}/${documentType}-${Date.now()}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('verification-documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Stocker juste le chemin du fichier (pas l'URL complète)
      // On générera l'URL signée à la lecture
      const fileUrl = fileName;

      // Vérifier si un document de ce type existe déjà
      const existingDoc = documents.find(d => d.document_type === documentType);

      if (existingDoc) {
        // Mettre à jour le document existant
        const { error: updateError } = await supabase
          .from('verification_documents')
          .update({
            file_url: fileUrl,
            status: 'pending',
            uploaded_at: new Date().toISOString(),
            verified_at: null,
            rejection_reason: null
          })
          .eq('id', existingDoc.id);

        if (updateError) throw updateError;
      } else {
        // Créer une nouvelle entrée dans verification_documents
        const { error: insertError } = await supabase
          .from('verification_documents')
          .insert({
            educator_id: educatorProfile.id,
            document_type: documentType,
            file_url: fileUrl,
            status: 'pending'
          });

        if (insertError) throw insertError;
      }

      // Recharger les données
      await fetchVerificationData();

      // Vérifier si tous les 4 documents sont uploadés
      // TEMPORAIREMENT COMMENTÉ POUR DÉBOGUER
      /*
      const { data: allDocs } = await supabase
        .from('verification_documents')
        .select('document_type')
        .eq('educator_id', educatorProfile.id);

      const uploadedTypes = new Set(allDocs?.map(d => d.document_type) || []);
      const requiredTypes = ['diploma', 'criminal_record', 'id_card', 'insurance'];
      const allUploaded = requiredTypes.every(type => uploadedTypes.has(type));

      // Si tous les documents sont uploadés, passer au statut documents_submitted
      if (allUploaded && educatorProfile.verification_status === 'pending_documents') {
        await supabase
          .from('educator_profiles')
          .update({ verification_status: 'documents_submitted' })
          .eq('id', educatorProfile.id);

        // Recharger encore pour avoir le nouveau statut
        await fetchVerificationData();
      }
      */

      // Afficher message de succès
      const docInfo = getDocumentInfo(documentType);
      setSuccessMessage(`✅ ${docInfo.label} ${existingDoc ? 'remplacé' : 'uploadé'} avec succès !`);

      // Masquer le message après 5 secondes
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err: any) {
      console.error('Error uploading file:', err);
      console.error('Full error details:', JSON.stringify(err, null, 2));
      setError(`Erreur: ${err.message || 'Erreur inconnue'}`);
    } finally {
      setUploading(null);
    }
  };

  const handleDeleteDocument = async (documentId: string, documentType: DocumentType) => {
    const docInfo = getDocumentInfo(documentType);
    if (!confirm(`Êtes-vous sûr de vouloir supprimer "${docInfo.label}" ?`)) return;

    setError('');
    setSuccessMessage('');

    try {
      const { error: deleteError } = await supabase
        .from('verification_documents')
        .delete()
        .eq('id', documentId);

      if (deleteError) throw deleteError;

      await fetchVerificationData();
      setSuccessMessage(`✅ ${docInfo.label} supprimé avec succès`);
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err: any) {
      console.error('Error deleting document:', err);
      setError(err.message);
    }
  };

  const getDocumentInfo = (type: DocumentType) => {
    const infos = {
      diploma: {
        label: 'Diplôme d\'État',
        description: 'DEES, DEME ou équivalent',
        icon: '🎓',
        help: 'Diplôme d\'Éducateur Spécialisé (DEES) ou Moniteur Éducateur (DEME)'
      },
      criminal_record: {
        label: 'Casier judiciaire B3',
        description: 'Datant de moins de 3 mois',
        icon: '📄',
        help: 'Demandez-le sur www.cjn.justice.gouv.fr (gratuit, reçu sous 48h)'
      },
      id_card: {
        label: 'Pièce d\'identité',
        description: 'CNI ou passeport en cours de validité',
        icon: '🪪',
        help: 'Carte Nationale d\'Identité ou Passeport'
      },
      insurance: {
        label: 'Assurance RC Professionnelle',
        description: 'Attestation en cours de validité',
        icon: '🛡️',
        help: 'Obligatoire pour exercer en libéral'
      }
    };
    return infos[type];
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800', icon: '⏳' },
      approved: { label: 'Validé', color: 'bg-green-100 text-green-800', icon: '✅' },
      rejected: { label: 'Refusé', color: 'bg-red-100 text-red-800', icon: '❌' }
    };
    return badges[status as keyof typeof badges] || badges.pending;
  };

  const getVerificationStatusInfo = (status: string) => {
    const statuses = {
      pending_documents: {
        title: 'Documents requis',
        description: 'Uploadez vos documents pour commencer la vérification',
        color: 'text-gray-600',
        icon: '📋'
      },
      documents_submitted: {
        title: 'Documents en cours de vérification',
        description: 'Vos documents sont en cours de vérification (24-48h)',
        color: 'text-blue-600',
        icon: '🔍'
      },
      documents_verified: {
        title: 'Documents validés',
        description: 'Un email vous a été envoyé pour planifier votre entretien',
        color: 'text-green-600',
        icon: '✅'
      },
      interview_scheduled: {
        title: 'Entretien planifié',
        description: 'Votre entretien vidéo est confirmé',
        color: 'text-purple-600',
        icon: '📅'
      },
      verified: {
        title: 'Profil vérifié',
        description: 'Votre profil est actif et visible des familles',
        color: 'text-green-600',
        icon: '🏅'
      },
      rejected_criminal_record: {
        title: 'Candidature refusée',
        description: 'Casier judiciaire non conforme',
        color: 'text-red-600',
        icon: '❌'
      },
      rejected_interview: {
        title: 'Candidature refusée',
        description: 'Suite à l\'entretien',
        color: 'text-red-600',
        icon: '❌'
      }
    };
    return statuses[status as keyof typeof statuses] || statuses.pending_documents;
  };

  const getDocumentByType = (type: DocumentType) => {
    return documents.find(doc => doc.document_type === type);
  };

  const handleViewDocument = async (filePath: string) => {
    try {
      // Utiliser notre route API qui bypass les politiques RLS
      const url = `/api/verification-documents/${encodeURIComponent(filePath)}`;
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error viewing document:', error);
      setError('Impossible de charger le document');
    }
  };

  const renderDocumentCard = (type: DocumentType) => {
    const info = getDocumentInfo(type);
    const doc = getDocumentByType(type);
    const status = doc ? getStatusBadge(doc.status) : null;

    return (
      <div key={type} className={`bg-white rounded-2xl shadow-lg border-2 p-6 transition-all hover:shadow-2xl hover:-translate-y-1 ${
        doc?.status === 'approved' ? 'border-green-300' :
        doc?.status === 'rejected' ? 'border-red-300' :
        doc ? 'border-yellow-300' :
        'border-gray-200 hover:border-primary-300'
      }`}>
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-3xl shadow-md ${
              doc?.status === 'approved' ? 'bg-green-100' :
              doc?.status === 'rejected' ? 'bg-red-100' :
              doc ? 'bg-yellow-100' :
              'bg-gray-100'
            }`}>
              {info.icon}
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">{info.label}</h3>
              <p className="text-sm text-gray-600">{info.description}</p>
            </div>
          </div>
          {status && (
            <span className={`px-4 py-2 rounded-xl text-sm font-bold shadow-md ${status.color}`}>
              {status.icon} {status.label}
            </span>
          )}
        </div>

        {doc?.rejection_reason && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">
              <strong>Raison du refus :</strong> {doc.rejection_reason}
            </p>
          </div>
        )}

        {!doc ? (
          <div>
            <p className="text-sm text-gray-600 mb-4 flex items-start gap-2">
              <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span>{info.help}</span>
            </p>
            <label className="block">
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(type, file);
                }}
                disabled={uploading !== null}
                className="hidden"
              />
              <div className={`group w-full px-6 py-4 border-2 border-dashed rounded-xl text-center cursor-pointer transition-all ${
                uploading === type
                  ? 'border-primary-400 bg-primary-50 cursor-wait'
                  : 'border-gray-300 hover:border-primary-500 hover:bg-gradient-to-br hover:from-primary-50 hover:to-blue-50 hover:shadow-lg'
              }`}>
                {uploading === type ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
                    <span className="text-primary-700 font-semibold">
                      Upload en cours...
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-3">
                    <svg className="w-6 h-6 text-gray-500 group-hover:text-primary-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span className="text-gray-700 font-semibold group-hover:text-primary-700 transition-colors">
                      Cliquez pour télécharger
                    </span>
                  </div>
                )}
              </div>
            </label>
          </div>
        ) : (
          <div>
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200 mb-3">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm text-gray-700 font-medium">
                      Uploadé le {new Date(doc.uploaded_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  {doc.verified_at && (
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <p className="text-sm text-green-700 font-semibold">
                        Vérifié le {new Date(doc.verified_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                      </p>
                    </div>
                  )}
                </div>
                {doc.file_url && (
                  <button
                    onClick={() => doc.file_url && handleViewDocument(doc.file_url)}
                    className="ml-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium text-sm transition-colors shadow-md hover:shadow-lg flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Voir
                  </button>
                )}
              </div>
            </div>

            {/* Boutons remplacer et supprimer (seulement si statut pending ou rejected) */}
            {(doc.status === 'pending' || doc.status === 'rejected') && (
              <div className="space-y-2">
                <label className="block">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(type, file);
                    }}
                    disabled={uploading !== null}
                    className="hidden"
                  />
                  <div className="w-full px-4 py-3 border-2 border-dashed border-blue-300 bg-blue-50 rounded-xl text-center cursor-pointer transition-all hover:border-blue-500 hover:bg-blue-100 flex items-center justify-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    <span className="text-blue-700 font-semibold text-sm">
                      Remplacer ce document
                    </span>
                  </div>
                </label>

                <button
                  onClick={() => handleDeleteDocument(doc.id, type)}
                  className="w-full px-4 py-3 border-2 border-red-300 bg-red-50 rounded-xl text-center cursor-pointer transition-all hover:border-red-500 hover:bg-red-100 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span className="text-red-700 font-semibold text-sm">
                    Supprimer ce document
                  </span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!educatorProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl p-8 shadow-lg max-w-md">
          <p className="text-red-600 font-semibold mb-4">❌ Erreur</p>
          <p className="text-gray-700">Profil éducateur non trouvé.</p>
        </div>
      </div>
    );
  }

  const statusInfo = getVerificationStatusInfo(educatorProfile.verification_status);
  const isVerified = educatorProfile.verification_status === 'verified';
  const isRejected = educatorProfile.verification_status.startsWith('rejected');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard/educator"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-500 to-green-500 text-white hover:from-primary-600 hover:to-green-600 px-6 py-2.5 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg mb-6"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Tableau de bord
          </Link>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 mb-8">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Vérification de votre profil
                </h1>
                <p className="text-lg text-gray-600">
                  Pour garantir la sécurité des enfants, tous les professionnels passent par une vérification complète en 4 étapes.
                </p>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">❌ {error}</p>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border-2 border-green-300 rounded-lg animate-pulse">
            <p className="text-green-800 font-semibold">{successMessage}</p>
          </div>
        )}

        {/* Statut actuel */}
        <div className={`mb-8 rounded-2xl shadow-xl border-2 overflow-hidden ${
          isVerified ? 'border-green-400 bg-gradient-to-br from-green-50 to-emerald-50' :
          isRejected ? 'border-red-400 bg-gradient-to-br from-red-50 to-pink-50' :
          'border-blue-400 bg-gradient-to-br from-blue-50 to-indigo-50'
        }`}>
          <div className="p-8">
            <div className="flex items-start gap-6">
              <div className={`flex-shrink-0 w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg ${
                isVerified ? 'bg-gradient-to-br from-green-500 to-emerald-600' :
                isRejected ? 'bg-gradient-to-br from-red-500 to-pink-600' :
                'bg-gradient-to-br from-blue-500 to-indigo-600'
              }`}>
                <span className="text-5xl">{statusInfo.icon}</span>
              </div>
              <div className="flex-1">
                <h2 className={`text-2xl font-bold mb-2 ${statusInfo.color}`}>
                  {statusInfo.title}
                </h2>
                <p className="text-gray-700 text-lg leading-relaxed">{statusInfo.description}</p>
                {isVerified && (
                  <div className="mt-6 inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold shadow-lg text-lg">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Badge "Vérifié Autisme Connect" actif
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Timeline de vérification */}
        <div className="mb-8 bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900">Progression de la vérification</h3>
          </div>

          <div className="space-y-4">
            {[
              { step: 1, label: 'Documents uploadés', status: ['documents_submitted', 'documents_verified', 'interview_scheduled', 'verified'] },
              { step: 2, label: 'Documents vérifiés (24-48h)', status: ['documents_verified', 'interview_scheduled', 'verified'] },
              { step: 3, label: 'Entretien vidéo planifié', status: ['interview_scheduled', 'verified'] },
              { step: 4, label: 'Profil vérifié et visible', status: ['verified'] }
            ].map((item, index, array) => {
              const isComplete = item.status.includes(educatorProfile.verification_status);
              const isLast = index === array.length - 1;
              return (
                <div key={item.step} className="relative">
                  <div className="flex items-center gap-4">
                    <div className={`relative z-10 w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg shadow-lg transition-all ${
                      isComplete
                        ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white scale-110'
                        : 'bg-gray-100 text-gray-400 border-2 border-gray-300'
                    }`}>
                      {isComplete ? (
                        <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : item.step}
                    </div>
                    <div className="flex-1">
                      <span className={`text-lg font-semibold ${isComplete ? 'text-green-700' : 'text-gray-500'}`}>
                        {item.label}
                      </span>
                    </div>
                  </div>
                  {!isLast && (
                    <div className={`absolute left-6 top-12 w-0.5 h-8 ${isComplete ? 'bg-green-400' : 'bg-gray-200'}`}></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Documents requis */}
        {!isRejected && (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              📄 Documents requis
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {renderDocumentCard('diploma')}
              {renderDocumentCard('criminal_record')}
              {renderDocumentCard('id_card')}
              {renderDocumentCard('insurance')}
            </div>
          </>
        )}

        {/* Informations importantes */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
          <h3 className="font-bold text-gray-900 mb-3">💡 Pourquoi ces vérifications ?</h3>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span>Sécurité et protection des enfants</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span>Confiance totale des familles</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span>Badge "Vérifié Autisme Connect" 🏅</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span>Meilleure visibilité dans les recherches</span>
            </li>
          </ul>
          <div className="mt-4 pt-4 border-t border-blue-300">
            <p className="text-sm text-gray-600">
              ❓ Questions ? Contactez-nous à <a href="mailto:admin@autismeconnect.fr" className="text-primary-600 hover:underline">admin@autismeconnect.fr</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
