'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { signOut } from '@/lib/auth';
import EducatorNavbar from '@/components/EducatorNavbar';
import { ocrService, OCRResult } from '@/lib/ocr-service';
import { getProfessionByValue, getDiplomaLabel, ProfessionConfig } from '@/lib/professions-config';

type DiplomaStatus = 'pending' | 'verified' | 'rejected';

// Liste des régions françaises
const FRENCH_REGIONS = [
  'Île-de-France',
  'Auvergne-Rhône-Alpes',
  'Provence-Alpes-Côte d\'Azur',
  'Nouvelle-Aquitaine',
  'Occitanie',
  'Hauts-de-France',
  'Grand Est',
  'Bretagne',
  'Pays de la Loire',
  'Normandie',
  'Bourgogne-Franche-Comté',
  'Centre-Val de Loire',
];

export default function DiplomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [sendingToDREETS, setSendingToDREETS] = useState(false);

  const [profile, setProfile] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [professionConfig, setProfessionConfig] = useState<ProfessionConfig | null>(null);
  const [diplomaFile, setDiplomaFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Données OCR et DREETS
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);
  const [diplomaNumber, setDiplomaNumber] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [region, setRegion] = useState('');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        router.push('/auth/login');
        return;
      }

      const { data: educatorProfile } = await supabase
        .from('educator_profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (!educatorProfile) {
        router.push('/dashboard/family');
        return;
      }

      setProfile(educatorProfile);

      // Charger la configuration de la profession
      const profConfig = getProfessionByValue(educatorProfile.profession_type || 'educator');
      setProfessionConfig(profConfig || null);

      // Pré-remplir les champs si déjà saisis
      if (educatorProfile.diploma_number) setDiplomaNumber(educatorProfile.diploma_number);
      if (educatorProfile.diploma_delivery_date) setDeliveryDate(educatorProfile.diploma_delivery_date);
      if (educatorProfile.region) setRegion(educatorProfile.region);

      // Récupérer l'abonnement
      const { data: subscriptionData } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('educator_id', educatorProfile.id)
        .in('status', ['active', 'trialing'])
        .limit(1)
        .maybeSingle();

      setSubscription(subscriptionData);

      // Si le diplôme existe déjà, générer une signed URL
      if (educatorProfile.diploma_url) {
        const { data: signedUrlData } = await supabase.storage
          .from('diplomas')
          .createSignedUrl(educatorProfile.diploma_url, 3600); // 1 heure

        if (signedUrlData?.signedUrl) {
          setPreviewUrl(signedUrlData.signedUrl);
        }
      }

      setLoading(false);
    } catch (error) {
      console.error('Erreur:', error);
      setLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérifier le type de fichier
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      setMessage({
        type: 'error',
        text: 'Format non supporté. Utilisez JPG, PNG ou PDF.'
      });
      return;
    }

    // Vérifier la taille (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({
        type: 'error',
        text: 'Le fichier est trop volumineux. Maximum 5MB.'
      });
      return;
    }

    setDiplomaFile(file);
    setMessage(null);

    // Créer un aperçu pour les images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Lancer l'analyse OCR automatiquement pour les images
      await runOCRAnalysis(file);
    } else {
      setPreviewUrl(null);
      setMessage({
        type: 'info',
        text: 'PDF sélectionné. L\'analyse OCR sera effectuée après l\'upload.'
      });
    }
  };

  const runOCRAnalysis = async (file: File) => {
    setAnalyzing(true);
    setMessage({
      type: 'info',
      text: 'Analyse OCR en cours... Cela peut prendre quelques secondes.'
    });

    try {
      const result = await ocrService.analyzeDiploma(file);
      setOcrResult(result);

      if (result.success) {
        // Extraire automatiquement le numéro et la date si trouvés
        const extractedNumber = ocrService.extractDiplomaNumber(result.text);
        const extractedDate = ocrService.extractDeliveryDate(result.text);

        if (extractedNumber && !diplomaNumber) setDiplomaNumber(extractedNumber);
        if (extractedDate && !deliveryDate) setDeliveryDate(extractedDate);

        if (result.validation.isValid) {
          setMessage({
            type: 'success',
            text: `✅ Document analysé avec succès (confiance: ${result.confidence.toFixed(0)}%). Diplôme ME/ES détecté.`
          });
        } else {
          setMessage({
            type: 'info',
            text: `⚠️ Document analysé. Vérification manuelle recommandée. Confiance: ${result.confidence.toFixed(0)}%`
          });
        }
      } else {
        setMessage({
          type: 'error',
          text: 'Erreur lors de l\'analyse OCR. Le document sera vérifié manuellement.'
        });
      }
    } catch (error) {
      console.error('Erreur OCR:', error);
      setMessage({
        type: 'error',
        text: 'Erreur lors de l\'analyse. Le diplôme sera vérifié manuellement.'
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const uploadDiploma = async () => {
    if (!diplomaFile || !profile) return;

    if (!region) {
      setMessage({
        type: 'error',
        text: 'Veuillez sélectionner la région de délivrance du diplôme.'
      });
      return;
    }

    setUploading(true);
    setMessage(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('Non authentifié');

      // Créer un nom de fichier unique
      const fileExt = diplomaFile.name.split('.').pop();
      const fileName = `${session.user.id}/${Date.now()}.${fileExt}`;

      // Supprimer l'ancien diplôme s'il existe
      if (profile.diploma_url) {
        const oldPath = profile.diploma_url.split('/diplomas/')[1];
        if (oldPath) {
          await supabase.storage
            .from('diplomas')
            .remove([oldPath]);
        }
      }

      // Uploader le nouveau fichier
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('diplomas')
        .upload(fileName, diplomaFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Obtenir l'URL publique (fonctionne même avec bucket privé grâce aux RLS)
      const { data: { publicUrl } } = supabase.storage
        .from('diplomas')
        .getPublicUrl(fileName);

      // Mettre à jour le profil éducateur
      const updateData: any = {
        diploma_url: fileName,  // Stocker le path au lieu de l'URL complète
        diploma_verification_status: 'pending',
        diploma_submitted_at: new Date().toISOString(),
        diploma_rejected_reason: null,
        diploma_number: diplomaNumber || null,
        diploma_delivery_date: deliveryDate || null,
        region: region,
      };

      // Ajouter les données OCR si disponibles
      if (ocrResult && ocrResult.success) {
        updateData.diploma_ocr_text = ocrResult.text;
        updateData.diploma_ocr_confidence = ocrResult.confidence;
        updateData.diploma_ocr_analysis = ocrService.generateAnalysisReport(ocrResult);
      }

      const { error: updateError } = await supabase
        .from('educator_profiles')
        .update(updateData)
        .eq('id', profile.id);

      if (updateError) throw updateError;

      setMessage({
        type: 'success',
        text: '✅ Diplôme envoyé ! Vérification DREETS en cours...'
      });

      // Générer une signed URL pour la DREETS (valide 7 jours)
      const { data: signedUrlData } = await supabase.storage
        .from('diplomas')
        .createSignedUrl(fileName, 604800); // 7 jours

      const diplomaUrl = signedUrlData?.signedUrl || publicUrl;

      // Envoyer automatiquement à la DREETS
      await sendToDREETS(diplomaUrl);

      // Recharger le profil
      await checkAuth();
      setDiplomaFile(null);
      setOcrResult(null);

    } catch (error: any) {
      console.error('Erreur upload:', error);
      setMessage({
        type: 'error',
        text: error.message || 'Erreur lors de l\'upload. Réessayez.'
      });
    } finally {
      setUploading(false);
    }
  };

  const sendToDREETS = async (diplomaUrl: string) => {
    setSendingToDREETS(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      // Préparer les données pour la DREETS
      const dreetsRequest = {
        educatorId: profile.id,
        educatorFirstName: profile.first_name,
        educatorLastName: profile.last_name,
        educatorEmail: session.user.email || profile.email || '',
        educatorPhone: profile.phone || '',
        diplomaUrl: diplomaUrl,
        diplomaNumber: diplomaNumber,
        deliveryDate: deliveryDate,
        region: region,
        ocrAnalysis: ocrResult ? ocrService.generateAnalysisReport(ocrResult) : undefined
      };

      // Appeler l'API route côté serveur pour envoyer l'email DREETS
      const response = await fetch('/api/send-dreets-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dreetsRequest)
      });

      const result = await response.json();

      if (result.success) {
        setMessage({
          type: 'success',
          text: '🎉 Diplôme uploadé et demande envoyée à la DREETS ! Réponse sous 5-10 jours ouvrés.'
        });
      } else {
        setMessage({
          type: 'info',
          text: 'Diplôme uploadé. Vérification DREETS en attente.'
        });
      }

    } catch (error) {
      console.error('Erreur DREETS:', error);
      // Ne pas faire échouer l'upload si l'envoi DREETS échoue
      setMessage({
        type: 'info',
        text: 'Diplôme uploadé. L\'envoi à la DREETS sera réessayé.'
      });
    } finally {
      setSendingToDREETS(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    window.location.href = '/';
  };

  const isPremium = !!(subscription && ['active', 'trialing'].includes(subscription.status));

  const getStatusBadge = (status: DiplomaStatus) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-amber-100 text-amber-800">
            <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            Vérification en cours
          </span>
        );
      case 'verified':
        return (
          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
            <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Diplôme vérifié ✓
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium text-white" style={{ backgroundColor: '#f0879f' }}>
            <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            Diplôme non reconnu
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#fdf9f4' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#41005c' }}></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col" style={{ backgroundColor: '#fdf9f4' }}>
      {/* Navigation */}
      <div className="sticky top-0 z-40">
        <EducatorNavbar profile={profile} subscription={subscription} />
      </div>

      {/* Contenu principal */}
      <div className="flex-1 max-w-3xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 pb-24 sm:pb-8 w-full">
        {/* En-tête centré avec icône */}
        <div className="mb-5 sm:mb-8 text-center">
          <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full flex items-center justify-center p-1" style={{ backgroundColor: '#41005c' }}>
            <img src="/images/icons/diploma.svg" alt="" className="w-full h-full" />
          </div>
          <h1 className="text-lg sm:text-2xl font-bold text-gray-900">
            Mon Diplôme {professionConfig ? `- ${professionConfig.label}` : ''}
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-1 px-2">
            {professionConfig?.verificationMethod === 'dreets'
              ? 'Vérification automatique par la DREETS'
              : professionConfig?.verificationMethod === 'rpps'
              ? 'Vérification via votre numéro RPPS'
              : 'Vérification manuelle (24-48h)'}
          </p>
          {professionConfig && (
            <p className="text-[10px] sm:text-xs mt-2 px-2" style={{ color: '#5a1a75' }}>
              Diplôme attendu : {professionConfig.diplomaDescription}
            </p>
          )}
        </div>

        {/* Message d'information pour les nouveaux comptes */}
        {!profile.diploma_url && (
          <div className="mb-4 sm:mb-6 rounded-xl p-3 sm:p-5 shadow-sm" style={{ backgroundColor: '#f3e8ff', border: '1px solid #d8b4fe' }}>
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#41005c' }}>
                <svg className="h-4 w-4 sm:h-5 sm:w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm sm:text-base font-semibold mb-1.5 sm:mb-2" style={{ color: '#41005c' }}>
                  Bienvenue sur NeuroCare !
                </h3>
                <p className="text-xs sm:text-sm mb-2 sm:mb-3" style={{ color: '#5a1a75' }}>
                  <strong>Important :</strong> Vous serez visible des familles uniquement après validation de votre diplôme.
                </p>
                <div className="space-y-1 sm:space-y-1.5 text-xs sm:text-sm" style={{ color: '#5a1a75' }}>
                  <div className="flex items-start gap-2">
                    <span className="font-bold" style={{ color: '#41005c' }}>1.</span>
                    <span>Uploadez votre diplôme (PDF, JPG ou PNG)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-bold" style={{ color: '#41005c' }}>2.</span>
                    <span>Analyse automatique par OCR</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-bold" style={{ color: '#41005c' }}>3.</span>
                    <span>
                      {professionConfig?.verificationMethod === 'dreets'
                        ? 'Vérification officielle par la DREETS'
                        : professionConfig?.verificationMethod === 'rpps'
                        ? 'Vérification via votre numéro RPPS'
                        : 'Vérification manuelle par notre équipe'}
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-bold" style={{ color: '#41005c' }}>4.</span>
                    <span>Validation (délai: 24-48h)</span>
                  </div>
                  <div className="flex items-start gap-2 mt-2 pt-2 border-t" style={{ borderColor: '#d8b4fe' }}>
                    <span className="font-bold text-green-600">✓</span>
                    <span className="font-medium text-green-700">Vous apparaissez dans les recherches !</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Statut actuel */}
        {profile.diploma_verification_status && (
          <div className="mb-4 sm:mb-6">
            {getStatusBadge(profile.diploma_verification_status)}

            {profile.dreets_verified && profile.dreets_response_date && (
              <p className="text-sm text-gray-600 mt-2">
                ✅ Vérifié par la DREETS le {new Date(profile.dreets_response_date).toLocaleDateString('fr-FR')}
              </p>
            )}

            {profile.dreets_verification_sent_at && !profile.dreets_verified && (
              <p className="text-sm text-gray-600 mt-2">
                📤 Demande envoyée à la DREETS le {new Date(profile.dreets_verification_sent_at).toLocaleDateString('fr-FR')}
                <br />
                Réponse attendue sous 5-10 jours ouvrés
              </p>
            )}

            {profile.diploma_verification_status === 'rejected' && profile.diploma_rejected_reason && (
              <div className="mt-4 p-4 rounded-xl" role="alert" style={{ backgroundColor: '#fff1f2', border: '1px solid #f0879f' }}>
                <p className="text-sm font-medium mb-1" style={{ color: '#9f1239' }}>Raison du refus :</p>
                <p className="text-sm" style={{ color: '#be123c' }}>{profile.diploma_rejected_reason}</p>
              </div>
            )}
          </div>
        )}

        {/* Alerte si pas de diplôme */}
        {!profile.diploma_url && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-xl bg-amber-50 border border-amber-200" role="alert">
            <div className="flex items-start gap-2 sm:gap-3">
              <svg className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="text-xs sm:text-sm text-amber-800">
                <strong>Attention :</strong> Votre profil n'est pas visible tant que votre diplôme n'est pas vérifié.
              </p>
            </div>
          </div>
        )}

        {/* Formulaire d'upload */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 sm:p-5">
          <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4" style={{ color: '#41005c' }}>
            {profile.diploma_url ? 'Remplacer mon diplôme' : 'Uploader mon diplôme'}
          </h2>

          {/* Aperçu du diplôme actuel */}
          {profile.diploma_url && !diplomaFile && previewUrl && (
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-2">Diplôme actuel :</p>
              {profile.diploma_url.endsWith('.pdf') ? (
                <div className="rounded-xl p-4" style={{ backgroundColor: '#faf5ff', border: '1px solid #e9d5ff' }}>
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#41005c' }}>
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">Document PDF</p>
                      <a
                        href={previewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium hover:underline"
                        style={{ color: '#41005c' }}
                      >
                        Voir le document →
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                <img
                  src={previewUrl}
                  alt="Diplôme"
                  className="max-w-full h-auto rounded-xl border border-gray-200"
                />
              )}
            </div>
          )}

          {/* Zone d'upload */}
          <div className="mb-3 sm:mb-4">
            <label htmlFor="diploma-upload" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
              Sélectionner un fichier (JPG, PNG ou PDF - max 5MB)
            </label>
            <input
              id="diploma-upload"
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={handleFileChange}
              disabled={analyzing || uploading}
              aria-label="Sélectionner un fichier de diplôme à uploader (formats acceptés : JPG, PNG ou PDF, taille maximale : 5 MB)"
              className="block w-full text-xs sm:text-sm text-gray-500 file:mr-2 sm:file:mr-4 file:py-2 sm:file:py-2.5 file:px-3 sm:file:px-4 file:rounded-xl file:border-0 file:text-xs sm:file:text-sm file:font-semibold file:text-white hover:file:opacity-90 disabled:opacity-50"
              style={{ '--file-bg': '#41005c', fontSize: '16px' } as any}
            />
            <style jsx>{`
              input[type="file"]::file-selector-button {
                background-color: #41005c;
              }
            `}</style>
          </div>

          {/* Champs supplémentaires */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-1.5">
                Numéro de diplôme {ocrResult && diplomaNumber && <span className="text-[10px] sm:text-xs" style={{ color: '#5a1a75' }}>(extrait)</span>}
              </label>
              <input
                type="text"
                value={diplomaNumber}
                onChange={(e) => setDiplomaNumber(e.target.value)}
                placeholder="Ex: 123456"
                className="w-full px-3 py-2.5 sm:py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 text-sm"
                style={{ '--tw-ring-color': '#41005c', fontSize: '16px' } as any}
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-1.5">
                Date de délivrance {ocrResult && deliveryDate && <span className="text-[10px] sm:text-xs" style={{ color: '#5a1a75' }}>(extraite)</span>}
              </label>
              <input
                type="text"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                placeholder="Ex: 15/06/2020"
                className="w-full px-3 py-2.5 sm:py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 text-sm"
                style={{ '--tw-ring-color': '#41005c', fontSize: '16px' } as any}
              />
            </div>

            {/* Région - uniquement pour vérification DREETS */}
            {professionConfig?.verificationMethod === 'dreets' && (
              <div className="sm:col-span-2">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-1.5">
                  Région de délivrance <span style={{ color: '#f0879f' }}>*</span>
                </label>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full px-3 py-2.5 sm:py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 text-sm"
                  style={{ '--tw-ring-color': '#41005c', fontSize: '16px' } as any}
                >
                  <option value="">Sélectionnez une région</option>
                  {FRENCH_REGIONS.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
                <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                  Permet de contacter la bonne DREETS pour la vérification
                </p>
              </div>
            )}
          </div>

          {/* Analyse OCR */}
          {analyzing && (
            <div className="mb-4 p-4 rounded-xl" role="status" aria-live="polite" style={{ backgroundColor: '#f3e8ff', border: '1px solid #d8b4fe' }}>
              <div className="flex items-center">
                <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" aria-hidden="true" style={{ color: '#41005c' }}>
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span className="text-sm" style={{ color: '#41005c' }}>Analyse OCR en cours...</span>
              </div>
            </div>
          )}

          {/* Résultat OCR */}
          {ocrResult && ocrResult.success && (
            <div className="mb-4">
              <details className="rounded-xl p-4" style={{ backgroundColor: '#faf5ff', border: '1px solid #e9d5ff' }}>
                <summary className="cursor-pointer font-medium text-sm" style={{ color: '#41005c' }}>
                  Analyse automatique (Confiance: {ocrResult.confidence.toFixed(0)}%)
                </summary>
                <div className="mt-3 text-sm text-gray-700 whitespace-pre-wrap">
                  {ocrService.generateAnalysisReport(ocrResult)}
                </div>
              </details>
            </div>
          )}

          {/* Aperçu du nouveau fichier */}
          {diplomaFile && previewUrl && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Aperçu :</p>
              <img
                src={previewUrl}
                alt="Aperçu"
                className="max-w-full h-auto rounded-xl border border-gray-200"
              />
            </div>
          )}

          {/* Messages */}
          {message && (
            <div
              role="alert"
              aria-live="polite"
              className={`mb-4 p-4 rounded-xl ${
                message.type === 'success'
                  ? 'bg-green-50 border border-green-200 text-green-800'
                  : message.type === 'info'
                  ? 'border text-sm'
                  : 'border text-sm'
              }`}
              style={
                message.type === 'info'
                  ? { backgroundColor: '#f3e8ff', borderColor: '#d8b4fe', color: '#5a1a75' }
                  : message.type === 'error'
                  ? { backgroundColor: '#fff1f2', borderColor: '#f0879f', color: '#9f1239' }
                  : {}
              }
            >
              {message.text}
            </div>
          )}

          {/* Bouton d'upload */}
          <button
            onClick={uploadDiploma}
            disabled={!diplomaFile || uploading || analyzing || (professionConfig?.verificationMethod === 'dreets' && !region)}
            aria-label={
              uploading || sendingToDREETS
                ? sendingToDREETS ? 'Envoi du diplôme à la DREETS en cours' : 'Upload du diplôme en cours'
                : professionConfig?.verificationMethod === 'dreets'
                ? 'Envoyer le diplôme et demander la vérification DREETS'
                : 'Envoyer le diplôme pour vérification'
            }
            className={`w-full py-3 px-4 rounded-xl font-medium transition ${
              !diplomaFile || uploading || analyzing || (professionConfig?.verificationMethod === 'dreets' && !region)
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'text-white hover:opacity-90 shadow-sm hover:shadow'
            }`}
            style={
              !diplomaFile || uploading || analyzing || (professionConfig?.verificationMethod === 'dreets' && !region)
                ? {}
                : { backgroundColor: '#41005c' }
            }
          >
            {uploading || sendingToDREETS ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                {sendingToDREETS ? 'Envoi à la DREETS...' : 'Upload en cours...'}
              </span>
            ) : professionConfig?.verificationMethod === 'dreets' ? (
              '📤 Envoyer le diplôme et demander la vérification DREETS'
            ) : (
              '📤 Envoyer le diplôme pour vérification'
            )}
          </button>
        </div>

        {/* Informations */}
        <div className="mt-4 sm:mt-6 rounded-xl p-3 sm:p-5" style={{ backgroundColor: '#f3e8ff', border: '1px solid #d8b4fe' }}>
          <div className="flex items-start gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#41005c' }}>
              <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-xs sm:text-sm font-semibold pt-1" style={{ color: '#41005c' }}>Comment fonctionne la vérification ?</h3>
          </div>
          <ul className="text-xs sm:text-sm space-y-2 sm:space-y-2.5" style={{ color: '#5a1a75' }}>
            <li className="flex items-start">
              <span className="mr-2 font-bold" style={{ color: '#41005c' }}>1.</span>
              <span><strong>Analyse automatique :</strong> Le diplôme est analysé par OCR pour détecter les informations clés</span>
            </li>
            {professionConfig?.verificationMethod === 'dreets' ? (
              <>
                <li className="flex items-start">
                  <span className="mr-2 font-bold" style={{ color: '#41005c' }}>2.</span>
                  <span><strong>Envoi à la DREETS :</strong> Une demande officielle est envoyée automatiquement à la DREETS de votre région</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 font-bold" style={{ color: '#41005c' }}>3.</span>
                  <span><strong>Vérification officielle :</strong> La DREETS vérifie l'authenticité du diplôme (délai: 5-10 jours ouvrés)</span>
                </li>
              </>
            ) : professionConfig?.verificationMethod === 'rpps' ? (
              <>
                <li className="flex items-start">
                  <span className="mr-2 font-bold" style={{ color: '#41005c' }}>2.</span>
                  <span><strong>Vérification RPPS :</strong> Nous vérifions la cohérence entre votre diplôme et votre numéro RPPS</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 font-bold" style={{ color: '#41005c' }}>3.</span>
                  <span><strong>Validation manuelle :</strong> Notre équipe valide votre profil (délai: 24-48h)</span>
                </li>
              </>
            ) : (
              <>
                <li className="flex items-start">
                  <span className="mr-2 font-bold" style={{ color: '#41005c' }}>2.</span>
                  <span><strong>Vérification manuelle :</strong> Notre équipe examine votre diplôme et vos certifications</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 font-bold" style={{ color: '#41005c' }}>3.</span>
                  <span><strong>Validation :</strong> Délai de traitement : 24-48h ouvrés</span>
                </li>
              </>
            )}
            <li className="flex items-start">
              <span className="mr-2 font-bold" style={{ color: '#41005c' }}>4.</span>
              <span><strong>Notification :</strong> Vous recevez un email dès que la vérification est terminée</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 font-bold" style={{ color: '#41005c' }}>5.</span>
              <span><strong>Activation :</strong> Votre profil devient visible dans les recherches une fois le diplôme vérifié</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
