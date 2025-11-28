'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { signOut } from '@/lib/auth';
import { CertificationType } from '@/types';
import { getCurrentPosition, reverseGeocode } from '@/lib/geolocation';
import AvatarUpload from '@/components/AvatarUpload';
import CVUpload from '@/components/CVUpload';
import CertificationDocumentUpload from '@/components/CertificationDocumentUpload';
import Logo from '@/components/Logo';
import EducatorMobileMenu from '@/components/EducatorMobileMenu';

const specializationOptions = [
  { value: 'comportement', label: 'Gestion du comportement' },
  { value: 'communication', label: 'Communication' },
  { value: 'autonomie', label: 'Autonomie' },
  { value: 'socialisation', label: 'Socialisation' },
  { value: 'scolaire', label: 'Soutien scolaire' },
  { value: 'motricite', label: 'Motricité' },
  { value: 'sensoriel', label: 'Sensoriel' },
  { value: 'loisirs', label: 'Loisirs adaptés' },
  { value: 'inclusion', label: 'Inclusion sociale' },
  { value: 'petite_enfance', label: 'Petite enfance (0-6 ans)' },
  { value: 'enfance', label: 'Enfance (6-12 ans)' },
  { value: 'adolescence', label: 'Adolescence (12-18 ans)' },
  { value: 'adultes', label: 'Adultes' },
];

export default function EducatorProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [geolocating, setGeolocating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userId, setUserId] = useState<string>('');
  const [currentEmail, setCurrentEmail] = useState<string>('');
  const [newEmail, setNewEmail] = useState<string>('');
  const [updatingEmail, setUpdatingEmail] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarModerationStatus, setAvatarModerationStatus] = useState<'pending' | 'approved' | 'rejected' | null>(null);
  const [avatarModerationReason, setAvatarModerationReason] = useState<string | null>(null);
  const [cvUrl, setCvUrl] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    bio: '',
    phone: '',
    location: '',
    years_of_experience: 0,
    hourly_rate: '',
    specializations: [] as string[],
    languages: '',
    show_email: false,
    show_phone: false,
    siret: '',
    sap_number: '',
  });

  const [certifications, setCertifications] = useState<Array<{
    id?: string;
    type: CertificationType;
    name: string;
    issuing_organization: string;
    issue_date: string;
    diploma_number?: string;
    issuing_region?: string;
    document_url?: string;
    verification_status?: string;
  }>>([]);

  useEffect(() => {
    fetchProfile();
  }, []);

  // Fermeture automatique des messages après 5 secondes
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        router.push('/auth/login');
        return;
      }

      setUserId(session.user.id);
      console.log('📧 Email utilisateur:', session.user.email);
      setCurrentEmail(session.user.email || '');

      // Récupérer le profil éducateur
      const { data: profile } = await supabase
        .from('educator_profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (profile) {
        setProfile(profile);
        setProfileData({
          first_name: profile.first_name || '',
          last_name: profile.last_name || '',
          bio: profile.bio || '',
          phone: profile.phone || '',
          location: profile.location || '',
          years_of_experience: profile.years_of_experience || 0,
          hourly_rate: profile.hourly_rate?.toString() || '',
          specializations: profile.specializations || [],
          languages: (profile.languages || []).join(', '),
          show_email: profile.show_email || false,
          show_phone: profile.show_phone || false,
          siret: profile.siret || '',
          sap_number: profile.sap_number || '',
        });

        // Charger les données d'avatar
        setAvatarUrl(profile.avatar_url || null);
        setAvatarModerationStatus(profile.avatar_moderation_status || null);
        setAvatarModerationReason(profile.avatar_moderation_reason || null);

        // Charger les données de CV
        setCvUrl(profile.cv_url || null);

        // Récupérer l'abonnement
        const { data: subscriptionData } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('educator_id', profile.id)
          .in('status', ['active', 'trialing'])
          .limit(1)
          .maybeSingle();

        setSubscription(subscriptionData);
      }

      // Récupérer les certifications
      const { data: certs } = await supabase
        .from('certifications')
        .select('*')
        .eq('educator_id', profile?.id);

      if (certs) {
        setCertifications(certs);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Validation du SIRET avec algorithme de Luhn
  const validateSIRET = (siret: string): { valid: boolean; message?: string } => {
    // Vérifier que c'est exactement 14 chiffres
    if (siret.length !== 14) {
      return { valid: false, message: 'Le SIRET doit contenir exactement 14 chiffres' };
    }

    if (!/^\d{14}$/.test(siret)) {
      return { valid: false, message: 'Le SIRET ne doit contenir que des chiffres' };
    }

    // Valider le SIREN (9 premiers chiffres) avec l'algorithme de Luhn
    const siren = siret.substring(0, 9);
    let sum = 0;

    for (let i = 0; i < siren.length; i++) {
      let digit = parseInt(siren[i]);

      // Doubler chaque deuxième chiffre en partant de la droite
      if ((siren.length - i) % 2 === 0) {
        digit *= 2;
        // Si le résultat est > 9, soustraire 9
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
    }

    // Le SIREN est valide si la somme est divisible par 10
    if (sum % 10 !== 0) {
      return { valid: false, message: 'Le numéro SIRET est invalide (le SIREN ne passe pas la validation)' };
    }

    return { valid: true };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      // Valider le SIRET
      if (profileData.siret) {
        const siretValidation = validateSIRET(profileData.siret);
        if (!siretValidation.valid) {
          throw new Error(siretValidation.message);
        }
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error('Utilisateur non connecté');
      }

      // Mettre à jour le profil
      const { error: updateError } = await supabase
        .from('educator_profiles')
        .update({
          first_name: profileData.first_name,
          last_name: profileData.last_name,
          bio: profileData.bio,
          phone: profileData.phone || null,
          location: profileData.location,
          years_of_experience: profileData.years_of_experience,
          hourly_rate: profileData.hourly_rate ? parseFloat(profileData.hourly_rate) : null,
          specializations: profileData.specializations,
          languages: profileData.languages.split(',').map(l => l.trim()).filter(Boolean),
          show_email: profileData.show_email,
          show_phone: profileData.show_phone,
          siret: profileData.siret || null,
          sap_number: profileData.sap_number || null,
        })
        .eq('user_id', session.user.id);

      if (updateError) {
        throw updateError;
      }

      setSuccess('Profil mis à jour avec succès !');

      // Rediriger vers le dashboard après 2 secondes
      setTimeout(() => {
        router.push('/dashboard/educator');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la mise à jour');
      setSaving(false);
    }
  };

  const addCertification = () => {
    setCertifications([...certifications, {
      type: 'ABA',
      name: '',
      issuing_organization: '',
      issue_date: '',
      diploma_number: '',
      issuing_region: '',
      verification_status: 'pending',
    }]);
  };

  const updateCertification = (index: number, field: string, value: any) => {
    const updated = [...certifications];
    updated[index] = { ...updated[index], [field]: value };
    setCertifications(updated);
  };

  const removeCertification = async (index: number) => {
    const cert = certifications[index];

    // Si la certification a un ID, la supprimer de la base de données
    if (cert.id) {
      try {
        await supabase
          .from('certifications')
          .delete()
          .eq('id', cert.id);
      } catch (err) {
        console.error('Erreur suppression certification:', err);
      }
    }

    // Retirer de la liste
    setCertifications(certifications.filter((_, i) => i !== index));
  };

  const validateDiplomaNumber = (type: CertificationType, diplomaNumber?: string): { valid: boolean; message?: string } => {
    // Si c'est un diplôme d'État (DEES ou DEME), le numéro est obligatoire
    if (type === 'DEES' || type === 'DEME') {
      if (!diplomaNumber || diplomaNumber.trim() === '') {
        return { valid: false, message: 'Le numéro de diplôme est obligatoire pour les diplômes d\'État' };
      }

      // Valider le format : ANNÉE-RÉGION-NUMÉRO (ex: 2023-IDF-12345)
      const formatRegex = /^[0-9]{4}-[A-Z]{2,4}-[0-9]{4,6}$/;
      if (!formatRegex.test(diplomaNumber)) {
        return {
          valid: false,
          message: `Format invalide pour ${type}. Utilisez le format: ANNÉE-RÉGION-NUMÉRO (ex: 2023-IDF-12345)`
        };
      }

      // Vérifier que l'année est cohérente
      const year = parseInt(diplomaNumber.split('-')[0]);
      const currentYear = new Date().getFullYear();
      if (year < 1950 || year > currentYear) {
        return {
          valid: false,
          message: `L'année dans le numéro de diplôme (${year}) semble incorrecte`
        };
      }
    }

    return { valid: true };
  };

  const saveCertifications = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      // Valider tous les numéros de diplômes avant de sauvegarder
      for (let i = 0; i < certifications.length; i++) {
        const cert = certifications[i];
        const validation = validateDiplomaNumber(cert.type, cert.diploma_number);
        if (!validation.valid) {
          throw new Error(`Certification ${i + 1}: ${validation.message}`);
        }
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error('Utilisateur non connecté');
      }

      // Récupérer l'ID du profil éducateur
      const { data: profile, error: profileError } = await supabase
        .from('educator_profiles')
        .select('id')
        .eq('user_id', session.user.id)
        .single();

      if (profileError) {
        throw new Error(`Erreur profil: ${profileError.message}`);
      }

      if (!profile) {
        throw new Error('Profil non trouvé');
      }

      // Sauvegarder chaque certification
      for (let i = 0; i < certifications.length; i++) {
        const cert = certifications[i];

        if (cert.id) {
          // Mise à jour
          const { error: updateError } = await supabase
            .from('certifications')
            .update({
              type: cert.type,
              name: cert.name,
              issuing_organization: cert.issuing_organization,
              issue_date: cert.issue_date,
              diploma_number: cert.diploma_number || null,
              issuing_region: cert.issuing_region || null,
            })
            .eq('id', cert.id);

          if (updateError) {
            throw new Error(`Erreur mise à jour: ${updateError.message}`);
          }
        } else {
          // Création
          const { data: newCert, error: insertError } = await supabase
            .from('certifications')
            .insert({
              educator_id: profile.id,
              type: cert.type,
              name: cert.name,
              issuing_organization: cert.issuing_organization,
              issue_date: cert.issue_date,
              diploma_number: cert.diploma_number || null,
              issuing_region: cert.issuing_region || null,
              verification_status: 'pending',
            })
            .select()
            .single();

          if (insertError) {
            throw new Error(`Erreur création: ${insertError.message}`);
          }

          // Mettre à jour l'ID dans le state local
          const updated = [...certifications];
          updated[i] = { ...updated[i], id: newCert?.id };
          setCertifications(updated);
        }
      }

      // Vérifier les doublons pour les diplômes d'État
      let duplicateWarning = '';
      for (const cert of certifications) {
        if ((cert.type === 'DEES' || cert.type === 'DEME') && cert.diploma_number && cert.id) {
          const { data: duplicateCheck } = await supabase.rpc('check_diploma_number_duplicate', {
            diploma_number: cert.diploma_number,
            current_certification_id: cert.id
          }).single() as { data: { is_duplicate: boolean; duplicate_count: number } | null };

          if (duplicateCheck?.is_duplicate) {
            duplicateWarning += `\n⚠️ ALERTE: Le numéro ${cert.diploma_number} est utilisé par ${duplicateCheck.duplicate_count} autre(s) personne(s).`;
          }
        }
      }

      if (duplicateWarning) {
        setSuccess('Certifications sauvegardées avec succès !' + duplicateWarning + '\n\nCette alerte a été transmise à l\'équipe de modération.');
      } else {
        setSuccess('Certifications mises à jour avec succès !');
      }
    } catch (err: any) {
      console.error('❌ Erreur générale lors de la sauvegarde:', err);
      setError(err.message || 'Erreur lors de la mise à jour des certifications');
    } finally {
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
      } else {
        setError('Impossible de déterminer votre adresse. Veuillez la saisir manuellement.');
      }
    } catch (error: any) {
      setError(error.message || 'Erreur lors de la géolocalisation');
    } finally {
      setGeolocating(false);
    }
  };

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newEmail || newEmail === currentEmail) {
      setError('Veuillez entrer une nouvelle adresse email différente');
      return;
    }

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      setError('Adresse email invalide');
      return;
    }

    setUpdatingEmail(true);
    setError('');
    setSuccess('');

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        email: newEmail
      });

      if (updateError) throw updateError;

      setSuccess('Un email de confirmation a été envoyé à votre nouvelle adresse. Veuillez cliquer sur le lien de confirmation pour finaliser le changement.');
      setNewEmail('');
    } catch (err: any) {
      console.error('Erreur changement email:', err);
      setError(err.message || 'Erreur lors du changement d\'email');
    } finally {
      setUpdatingEmail(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'SUPPRIMER') {
      setError('Veuillez taper exactement "SUPPRIMER" pour confirmer');
      return;
    }

    setDeleting(true);
    setError('');

    try {
      // 1. Supprimer le profil éducateur (cascade supprimera les données liées)
      const { error: profileError } = await supabase
        .from('educator_profiles')
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

  const isPremium = subscription && ['active', 'trialing'].includes(subscription.status);

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
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3">
              {/* Menu mobile (hamburger) */}
              <div className="md:hidden">
                <EducatorMobileMenu profile={profile} isPremium={isPremium} onLogout={handleLogout} />
              </div>
              {/* Logo */}
              <div className="hidden md:block">
                <Logo />
              </div>
            </div>
            {/* Menu desktop - caché sur mobile */}
            <div className="hidden md:flex items-center gap-4">
              <Link
                href="/dashboard/educator"
                className="bg-gradient-to-r from-primary-500 to-green-500 text-white hover:from-primary-600 hover:to-green-600 px-6 py-2.5 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Tableau de bord
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mon profil</h1>
          <p className="text-gray-600 mt-1">Gérez vos informations professionnelles</p>
        </div>


        {/* Informations personnelles */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Informations personnelles</h2>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Photo de profil */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Photo de profil</label>
              <AvatarUpload
                currentAvatarUrl={avatarUrl}
                userId={userId}
                profileType="educator"
                moderationStatus={avatarModerationStatus}
                moderationReason={avatarModerationReason}
                onAvatarChange={(newUrl) => setAvatarUrl(newUrl)}
              />
            </div>

            {/* CV Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                CV (Curriculum Vitae) *
              </label>
              <CVUpload
                currentCVUrl={cvUrl}
                userId={userId}
                educatorId={profile?.id || ''}
                onCVChange={(newUrl) => setCvUrl(newUrl)}
              />
              <p className="text-xs text-gray-500 mt-2">
                Votre CV sera visible sur votre profil public. Format PDF uniquement.
              </p>
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

            {/* Informations professionnelles */}
            <div className="border-t border-gray-200 pt-6 mt-6">
              <h3 className="text-sm font-medium text-gray-900 mb-4">Informations professionnelles</h3>

              <div className="space-y-4">
                {/* SIRET */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Numéro SIRET *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={14}
                    value={profileData.siret}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      setProfileData({ ...profileData, siret: value });
                    }}
                    placeholder="12345678901234"
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    14 chiffres - Obligatoire pour la facturation et les paiements
                  </p>
                </div>

                {/* SAP Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    Numéro d'agrément SAP
                    <span className="text-xs text-green-600 font-normal">(Facultatif)</span>
                  </label>
                  <input
                    type="text"
                    value={profileData.sap_number}
                    onChange={(e) => setProfileData({ ...profileData, sap_number: e.target.value.toUpperCase() })}
                    placeholder="SAP123456789"
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500"
                  />
                  <div className="mt-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-xs text-blue-800 mb-2">
                      <strong>💡 Pourquoi ajouter votre agrément SAP ?</strong>
                    </p>
                    <p className="text-xs text-blue-700 mb-2">
                      Avec l'agrément Services à la Personne, vos clients peuvent bénéficier du <strong>CESU préfinancé</strong> et du <strong>crédit d'impôt de 50%</strong> !
                    </p>
                    <a
                      href="/educators/sap-accreditation"
                      target="_blank"
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium underline"
                    >
                      → En savoir plus sur l'agrément SAP (100% gratuit)
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Paramètres de confidentialité */}
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Paramètres de confidentialité</h3>
              <p className="text-sm text-gray-600 mb-4">
                Choisissez les informations de contact que vous souhaitez afficher sur votre profil public
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
                    <span className="block text-gray-500 mt-1">Les familles pourront voir votre téléphone sur votre profil public</span>
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
                    <span className="block text-gray-500 mt-1">Les familles pourront voir votre e-mail sur votre profil public</span>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
              <textarea
                rows={4}
                value={profileData.bio}
                onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                placeholder="Parlez de vous, votre expérience, votre approche..."
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Années d'expérience *</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={profileData.years_of_experience}
                  onChange={(e) => setProfileData({ ...profileData, years_of_experience: parseInt(e.target.value) })}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tarif horaire (€)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={profileData.hourly_rate}
                  onChange={(e) => setProfileData({ ...profileData, hourly_rate: e.target.value })}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Spécialisations</label>
              <div className="flex flex-wrap gap-2">
                {specializationOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      const current = profileData.specializations;
                      if (current.includes(option.value)) {
                        setProfileData({
                          ...profileData,
                          specializations: current.filter(s => s !== option.value)
                        });
                      } else {
                        setProfileData({
                          ...profileData,
                          specializations: [...current, option.value]
                        });
                      }
                    }}
                    className={`px-3 py-1.5 text-sm rounded-full border transition-all ${
                      profileData.specializations.includes(option.value)
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-primary-400'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-sm text-gray-500">
                {profileData.specializations.length} spécialisation(s) sélectionnée(s)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Langues parlées</label>
              <input
                type="text"
                placeholder="Ex: Français, Anglais, Arabe"
                value={profileData.languages}
                onChange={(e) => setProfileData({ ...profileData, languages: e.target.value })}
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500"
              />
              <p className="mt-1 text-sm text-gray-500">Séparez les langues par des virgules</p>
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

        {/* Changement d'email */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Adresse email</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="font-medium">Email actuel :</span>
                <span>{currentEmail || 'Chargement...'}</span>
              </div>
            </div>

            <form onSubmit={handleUpdateEmail} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nouvelle adresse email
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="nouvelle@email.com"
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div className="flex gap-3 items-center">
                <button
                  type="submit"
                  disabled={updatingEmail || !newEmail}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition"
                >
                  {updatingEmail ? 'Envoi en cours...' : 'Changer mon email'}
                </button>
                <p className="text-xs text-gray-500">
                  Un email de confirmation sera envoyé à votre nouvelle adresse.
                </p>
              </div>
            </form>
          </div>
        </div>

        {/* Certifications */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Mes certifications</h2>
            <button
              type="button"
              onClick={addCertification}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 text-sm"
            >
              Ajouter une certification
            </button>
          </div>
          <div className="p-6 space-y-4">
            {certifications.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Aucune certification ajoutée. Cliquez sur &quot;Ajouter une certification&quot; pour commencer.
              </p>
            ) : (
              certifications.map((cert, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  {/* Statut de vérification */}
                  {cert.verification_status && cert.verification_status !== 'pending' && (
                    <div className="mb-4">
                      {cert.verification_status === 'document_verified' && (
                        <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-lg flex items-center">
                          <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm font-medium">🟢 Document vérifié</span>
                        </div>
                      )}
                      {cert.verification_status === 'officially_confirmed' && (
                        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-3 py-2 rounded-lg flex items-center">
                          <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="text-sm font-medium">⭐ Certification officielle confirmée</span>
                        </div>
                      )}
                      {cert.verification_status === 'rejected' && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg flex items-center">
                          <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm font-medium">❌ Document rejeté</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Type *</label>
                      <select
                        value={cert.type}
                        onChange={(e) => updateCertification(index, 'type', e.target.value)}
                        className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="ABA">ABA (Applied Behavior Analysis)</option>
                        <option value="TEACCH">TEACCH</option>
                        <option value="PECS">PECS (Picture Exchange Communication)</option>
                        <option value="Makaton">Makaton</option>
                        <option value="DEES">DEES (Diplôme d'État Éducateur Spécialisé)</option>
                        <option value="DEME">DEME (Diplôme d'État Moniteur Éducateur)</option>
                        <option value="OTHER">Autre</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nom de la certification *</label>
                      <input
                        type="text"
                        value={cert.name}
                        onChange={(e) => updateCertification(index, 'name', e.target.value)}
                        placeholder="Ex: Diplôme d'État d'Éducateur Spécialisé"
                        className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Organisme émetteur *</label>
                      <input
                        type="text"
                        value={cert.issuing_organization}
                        onChange={(e) => updateCertification(index, 'issuing_organization', e.target.value)}
                        placeholder="Ex: IRTS Paris Île-de-France"
                        className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Date d'obtention *</label>
                      <input
                        type="date"
                        value={cert.issue_date}
                        onChange={(e) => updateCertification(index, 'issue_date', e.target.value)}
                        className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Numéro du diplôme {(cert.type === 'DEES' || cert.type === 'DEME') && <span className="text-red-600">*</span>}
                      </label>
                      <input
                        type="text"
                        value={cert.diploma_number || ''}
                        onChange={(e) => updateCertification(index, 'diploma_number', e.target.value.toUpperCase())}
                        placeholder={
                          cert.type === 'DEES' ? 'Ex: 2023-IDF-12345' :
                          cert.type === 'DEME' ? 'Ex: 2022-ARA-56789' :
                          'Ex: 2023-12345'
                        }
                        required={cert.type === 'DEES' || cert.type === 'DEME'}
                        className={`w-full border rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500 ${
                          (cert.type === 'DEES' || cert.type === 'DEME') && (!cert.diploma_number || cert.diploma_number === '')
                            ? 'border-red-300'
                            : 'border-gray-300'
                        }`}
                      />
                      {cert.type === 'DEES' || cert.type === 'DEME' ? (
                        <p className="mt-1 text-xs text-red-600 font-medium">
                          ⚠️ Obligatoire - Format: ANNÉE-RÉGION-NUMÉRO (ex: 2023-IDF-12345)
                        </p>
                      ) : (
                        <p className="mt-1 text-xs text-gray-500">Optionnel pour ce type de certification</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Région d'obtention</label>
                      <select
                        value={cert.issuing_region || ''}
                        onChange={(e) => updateCertification(index, 'issuing_region', e.target.value)}
                        className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="">Sélectionnez une région</option>
                        <option value="Île-de-France">Île-de-France</option>
                        <option value="Auvergne-Rhône-Alpes">Auvergne-Rhône-Alpes</option>
                        <option value="PACA">Provence-Alpes-Côte d'Azur</option>
                        <option value="Occitanie">Occitanie</option>
                        <option value="Hauts-de-France">Hauts-de-France</option>
                        <option value="Nouvelle-Aquitaine">Nouvelle-Aquitaine</option>
                        <option value="Grand Est">Grand Est</option>
                        <option value="Pays de la Loire">Pays de la Loire</option>
                        <option value="Bretagne">Bretagne</option>
                        <option value="Normandie">Normandie</option>
                        <option value="Bourgogne-Franche-Comté">Bourgogne-Franche-Comté</option>
                        <option value="Centre-Val de Loire">Centre-Val de Loire</option>
                        <option value="Corse">Corse</option>
                        <option value="International">International</option>
                      </select>
                      <p className="mt-1 text-xs text-gray-500">Pour la vérification auprès de la DREETS</p>
                    </div>
                  </div>

                  {/* Upload du document */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Document justificatif *</label>
                    {cert.id ? (
                      <CertificationDocumentUpload
                        certificationId={cert.id}
                        currentDocumentUrl={cert.document_url || null}
                        onUploadComplete={(url) => updateCertification(index, 'document_url', url)}
                      />
                    ) : (
                      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-3 py-2 rounded text-sm">
                        ⚠️ Enregistrez d'abord cette certification pour pouvoir uploader un document
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={() => removeCertification(index)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Supprimer cette certification
                    </button>
                  </div>
                </div>
              ))
            )}

            {certifications.length > 0 && (
              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={saveCertifications}
                  disabled={saving}
                  className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
                >
                  {saving ? 'Enregistrement...' : 'Enregistrer ma certification'}
                </button>
              </div>
            )}
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
              <li>• Vos certifications et diplômes</li>
              <li>• Votre historique de messages</li>
              <li>• Vos réservations et rendez-vous</li>
              <li>• Votre abonnement (si actif)</li>
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

      {/* Notifications Toast en bas de la page */}
      {error && (
        <div className="fixed bottom-4 right-4 left-4 md:left-auto md:w-96 z-50 animate-slide-up">
          <div className="bg-red-600 text-white px-6 py-4 rounded-lg shadow-2xl border-2 border-red-700">
            <div className="flex items-start gap-3">
              <svg className="h-6 w-6 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">❌ Erreur</h3>
                <p className="text-sm whitespace-pre-line">{error}</p>
              </div>
              <button
                onClick={() => setError('')}
                className="flex-shrink-0 text-white hover:text-red-200 transition-colors"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="fixed bottom-4 right-4 left-4 md:left-auto md:w-96 z-50 animate-slide-up">
          <div className="bg-green-600 text-white px-6 py-4 rounded-lg shadow-2xl border-2 border-green-700">
            <div className="flex items-start gap-3">
              <svg className="h-6 w-6 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">✅ Succès</h3>
                <p className="text-sm whitespace-pre-line">{success}</p>
              </div>
              <button
                onClick={() => setSuccess('')}
                className="flex-shrink-0 text-white hover:text-green-200 transition-colors"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
