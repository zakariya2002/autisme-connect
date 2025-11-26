'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { signOut } from '@/lib/auth';
import EducatorMobileMenu from '@/components/EducatorMobileMenu';
import Logo from '@/components/Logo';
import { ocrService, OCRResult } from '@/lib/ocr-service';

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
    router.push('/');
  };

  const isPremium = !!(subscription && ['active', 'trialing'].includes(subscription.status));

  const getStatusBadge = (status: DiplomaStatus) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            Vérification DREETS en cours
          </span>
        );
      case 'verified':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Diplôme vérifié par la DREETS ✓
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-blue-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3">
              <div className="md:hidden">
                <EducatorMobileMenu profile={profile} isPremium={isPremium} onLogout={handleLogout} />
              </div>
              <div className="hidden md:block">
                <Logo />
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              <Link
                href="/dashboard/educator"
                className="bg-gradient-to-r from-primary-500 to-green-500 text-white hover:from-primary-600 hover:to-green-600 px-6 py-2.5 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Tableau de bord
              </Link>
              <Link href="/dashboard/educator/profile" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md font-medium transition">
                Profil
              </Link>
              <button
                onClick={handleLogout}
                className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md font-medium transition"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Contenu principal */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Mon Diplôme ME/ES</h1>
          <p className="text-gray-600">
            Votre diplôme sera vérifié automatiquement par la DREETS pour garantir son authenticité.
          </p>
        </div>

        {/* Message d'information pour les nouveaux comptes */}
        {!profile.diploma_url && (
          <div className="mb-6 bg-gradient-to-r from-blue-50 to-primary-50 border-l-4 border-primary-500 rounded-r-lg p-6 shadow-sm">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  📋 Bienvenue sur Autisme Connect !
                </h3>
                <p className="text-gray-700 mb-3">
                  <strong>Important :</strong> Vous apparaîtrez sur le site et serez visible des familles uniquement après validation de votre diplôme.
                </p>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-start">
                    <span className="text-primary-600 font-bold mr-2">1.</span>
                    <span>Uploadez votre diplôme ME ou ES (format PDF, JPG ou PNG)</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-primary-600 font-bold mr-2">2.</span>
                    <span>Notre système analyse automatiquement votre diplôme (OCR)</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-primary-600 font-bold mr-2">3.</span>
                    <span>Un email est envoyé à la DREETS pour vérification officielle</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-primary-600 font-bold mr-2">4.</span>
                    <span>Notre équipe valide votre diplôme (délai: 24-48h)</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-green-600 font-bold mr-2">✓</span>
                    <span className="font-medium text-green-700">Vous apparaissez dans les résultats de recherche !</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Statut actuel */}
        {profile.diploma_verification_status && (
          <div className="mb-6">
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
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm font-medium text-red-800 mb-1">Raison du refus :</p>
                <p className="text-sm text-red-700">{profile.diploma_rejected_reason}</p>
              </div>
            )}
          </div>
        )}

        {/* Alerte si pas de diplôme */}
        {!profile.diploma_url && (
          <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg">
            <div className="flex">
              <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>Attention :</strong> Votre profil n'est pas visible dans les recherches tant que votre diplôme n'est pas vérifié par la DREETS.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Formulaire d'upload */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {profile.diploma_url ? 'Remplacer mon diplôme' : 'Uploader mon diplôme'}
          </h2>

          {/* Aperçu du diplôme actuel */}
          {profile.diploma_url && !diplomaFile && previewUrl && (
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-2">Diplôme actuel :</p>
              {profile.diploma_url.endsWith('.pdf') ? (
                <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center">
                    <svg className="w-12 h-12 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                    </svg>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">Document PDF</p>
                      <a
                        href={previewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary-600 hover:text-primary-700"
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
                  className="max-w-full h-auto rounded-lg border border-gray-300"
                />
              )}
            </div>
          )}

          {/* Zone d'upload */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sélectionner un fichier (JPG, PNG ou PDF - max 5MB)
            </label>
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={handleFileChange}
              disabled={analyzing || uploading}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 disabled:opacity-50"
            />
          </div>

          {/* Champs supplémentaires */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Numéro de diplôme {ocrResult && diplomaNumber && '(extrait automatiquement)'}
              </label>
              <input
                type="text"
                value={diplomaNumber}
                onChange={(e) => setDiplomaNumber(e.target.value)}
                placeholder="Ex: 123456"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de délivrance {ocrResult && deliveryDate && '(extraite automatiquement)'}
              </label>
              <input
                type="text"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                placeholder="Ex: 15/06/2020"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Région de délivrance <span className="text-red-500">*</span>
              </label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Sélectionnez une région</option>
                {FRENCH_REGIONS.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Cette information permet de contacter la bonne DREETS pour la vérification
              </p>
            </div>
          </div>

          {/* Analyse OCR */}
          {analyzing && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center">
                <svg className="animate-spin h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span className="text-sm text-blue-800">Analyse OCR en cours...</span>
              </div>
            </div>
          )}

          {/* Résultat OCR */}
          {ocrResult && ocrResult.success && (
            <div className="mb-4">
              <details className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <summary className="cursor-pointer font-medium text-gray-900">
                  📊 Analyse automatique du diplôme (Confiance: {ocrResult.confidence.toFixed(0)}%)
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
                className="max-w-full h-auto rounded-lg border border-gray-300"
              />
            </div>
          )}

          {/* Messages */}
          {message && (
            <div className={`mb-4 p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-800'
                : message.type === 'info'
                ? 'bg-blue-50 border border-blue-200 text-blue-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              {message.text}
            </div>
          )}

          {/* Bouton d'upload */}
          <button
            onClick={uploadDiploma}
            disabled={!diplomaFile || uploading || analyzing || !region}
            className={`w-full py-3 px-4 rounded-lg font-medium transition ${
              !diplomaFile || uploading || analyzing || !region
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-primary-600 text-white hover:bg-primary-700 shadow-sm hover:shadow'
            }`}
          >
            {uploading || sendingToDREETS ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                {sendingToDREETS ? 'Envoi à la DREETS...' : 'Upload en cours...'}
              </span>
            ) : (
              '📤 Envoyer le diplôme et demander la vérification DREETS'
            )}
          </button>
        </div>

        {/* Informations */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">ℹ️ Comment fonctionne la vérification ?</h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li className="flex items-start">
              <span className="mr-2">1️⃣</span>
              <span><strong>Analyse automatique :</strong> Le diplôme est analysé par OCR pour détecter les informations clés</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">2️⃣</span>
              <span><strong>Envoi à la DREETS :</strong> Une demande officielle est envoyée automatiquement à la DREETS de votre région</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">3️⃣</span>
              <span><strong>Vérification officielle :</strong> La DREETS vérifie l'authenticité du diplôme (délai: 5-10 jours ouvrés)</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">4️⃣</span>
              <span><strong>Notification :</strong> Vous recevez un email dès que la vérification est terminée</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">5️⃣</span>
              <span><strong>Activation :</strong> Votre profil devient visible dans les recherches une fois le diplôme vérifié</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
