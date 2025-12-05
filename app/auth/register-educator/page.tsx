'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { getCurrentPosition, reverseGeocode } from '@/lib/geolocation';
import LogoPro from '@/components/LogoPro';

interface PasswordCriteria {
  minLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

export default function RegisterEducatorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planParam = searchParams.get('plan');
  const [loading, setLoading] = useState(false);
  const [geolocating, setGeolocating] = useState(false);
  const [error, setError] = useState('');
  const [showPasswordStrength, setShowPasswordStrength] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Données d'authentification
  const [authData, setAuthData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });

  // Type de profession sélectionné
  const [professionType, setProfessionType] = useState<string>('');

  // Données de profil professionnel
  const [educatorData, setEducatorData] = useState({
    first_name: '',
    last_name: '',
    bio: '',
    phone: '',
    location: '',
    years_of_experience: 1,
    hourly_rate: '',
    siret: '',
    sap_number: '',
    rpps_number: '',
    diploma_type: '',
  });

  // Spécialisations et langues sélectionnées
  const [selectedSpecializations, setSelectedSpecializations] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['Français']);

  // Liste des spécialisations disponibles
  const availableSpecializations = [
    'Troubles du spectre autistique (TSA)',
    'Communication alternative (PECS, Makaton)',
    'Méthode ABA',
    'Méthode TEACCH',
    'Troubles du comportement',
    'Autonomie quotidienne',
    'Habiletés sociales',
    'Intégration sensorielle',
    'Accompagnement petite enfance (0-6 ans)',
    'Accompagnement scolaire',
    'Guidance parentale',
    'Accompagnement adolescents',
    'Accompagnement adultes autistes',
    'Transition vers l\'âge adulte',
    'Insertion professionnelle',
    'Vie en autonomie (logement, budget)',
    'Accompagnement vie affective',
  ];

  // Liste des langues disponibles
  const availableLanguages = [
    'Français',
    'Anglais',
    'Arabe',
    'Espagnol',
    'Portugais',
    'Allemand',
    'Italien',
    'Langue des signes (LSF)',
    'Chinois',
    'Russe',
  ];

  // Toggle spécialisation
  const toggleSpecialization = (spec: string) => {
    setSelectedSpecializations(prev =>
      prev.includes(spec)
        ? prev.filter(s => s !== spec)
        : [...prev, spec]
    );
  };

  // Toggle langue
  const toggleLanguage = (lang: string) => {
    setSelectedLanguages(prev =>
      prev.includes(lang)
        ? prev.filter(l => l !== lang)
        : [...prev, lang]
    );
  };

  // Liste des professions disponibles
  const professions = [
    { value: 'educator', label: 'Éducateur spécialisé', category: 'Éducatif', requiresRpps: false, diplomas: ['DEES', 'CAFERUIS', 'OTHER'], icon: '👨‍🏫' },
    { value: 'moniteur_educateur', label: 'Moniteur éducateur', category: 'Éducatif', requiresRpps: false, diplomas: ['DEME', 'OTHER'], icon: '👩‍🏫' },
    { value: 'psychologist', label: 'Psychologue', category: 'Psychologie', requiresRpps: true, diplomas: ['MASTER_PSY', 'OTHER'], icon: '🧠' },
    { value: 'psychomotricist', label: 'Psychomotricien', category: 'Thérapies', requiresRpps: true, diplomas: ['DE_PSYCHOMOT', 'OTHER'], icon: '🤸' },
    { value: 'occupational_therapist', label: 'Ergothérapeute', category: 'Thérapies', requiresRpps: true, diplomas: ['DE_ERGO', 'OTHER'], icon: '🎯' },
    { value: 'speech_therapist', label: 'Orthophoniste', category: 'Thérapies', requiresRpps: true, diplomas: ['CCO', 'OTHER'], icon: '🗣️' },
    { value: 'physiotherapist', label: 'Kinésithérapeute', category: 'Thérapies', requiresRpps: true, diplomas: ['DE_KINE', 'OTHER'], icon: '💪' },
    { value: 'apa_teacher', label: 'Enseignant APA', category: 'Autres', requiresRpps: false, diplomas: ['LICENCE_STAPS_APA', 'MASTER_STAPS_APA', 'OTHER'], icon: '🏃' },
    { value: 'music_therapist', label: 'Musicothérapeute', category: 'Autres', requiresRpps: false, diplomas: ['DU_MUSICOTHERAPIE', 'CERTIFICATION_MUSICOTHERAPIE', 'OTHER'], icon: '🎵' },
  ];

  // Obtenir la profession sélectionnée
  const selectedProfession = professions.find(p => p.value === professionType);

  // Labels des diplômes
  const diplomaLabels: { [key: string]: string } = {
    'DEES': 'Diplôme d\'État d\'Éducateur Spécialisé (DEES)',
    'DEME': 'Diplôme d\'État de Moniteur Éducateur (DEME)',
    'CAFERUIS': 'CAFERUIS',
    'MASTER_PSY': 'Master 2 Psychologie',
    'DES_PSYCHIATRIE': 'DES de Psychiatrie',
    'DE_PSYCHOMOT': 'Diplôme d\'État de Psychomotricien',
    'DE_ERGO': 'Diplôme d\'État d\'Ergothérapeute',
    'CCO': 'Certificat de Capacité d\'Orthophoniste (CCO)',
    'DE_KINE': 'Diplôme d\'État de Masseur-Kinésithérapeute',
    'LICENCE_STAPS_APA': 'Licence STAPS mention APA-S',
    'MASTER_STAPS_APA': 'Master STAPS APA-S',
    'DU_MUSICOTHERAPIE': 'DU Musicothérapie',
    'CERTIFICATION_MUSICOTHERAPIE': 'Certification Musicothérapeute',
    'OTHER': 'Autre diplôme / certification',
  };

  // CV File
  const [cvFile, setCvFile] = useState<File | null>(null);

  // État de validation SIRET
  const [siretValidationState, setSiretValidationState] = useState<{
    isValid: boolean | null;
    verified: boolean;
    message: string;
    loading: boolean;
    data: {
      companyName?: string;
      address?: string;
      city?: string;
      isActive?: boolean;
    } | null;
  }>({ isValid: null, verified: false, message: '', loading: false, data: null });

  // État de validation RPPS
  const [rppsValidationState, setRppsValidationState] = useState<{
    isValid: boolean | null;
    verified: boolean;
    message: string;
    loading: boolean;
    data: {
      firstName?: string;
      lastName?: string;
      profession?: string;
    } | null;
  }>({ isValid: null, verified: false, message: '', loading: false, data: null });

  const [passwordCriteria, setPasswordCriteria] = useState<PasswordCriteria>({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });

  const validatePassword = (pwd: string) => {
    const criteria = {
      minLength: pwd.length >= 8,
      hasUppercase: /[A-Z]/.test(pwd),
      hasLowercase: /[a-z]/.test(pwd),
      hasNumber: /[0-9]/.test(pwd),
      hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd),
    };
    setPasswordCriteria(criteria);
    return Object.values(criteria).every(Boolean);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setAuthData({ ...authData, password: newPassword });
    setShowPasswordStrength(newPassword.length > 0);
    validatePassword(newPassword);
  };

  const getPasswordStrength = (): { label: string; color: string; percentage: number } => {
    const validCount = Object.values(passwordCriteria).filter(Boolean).length;

    if (validCount === 5) {
      return { label: 'Très fort', color: 'bg-green-500', percentage: 100 };
    } else if (validCount === 4) {
      return { label: 'Fort', color: 'bg-green-400', percentage: 80 };
    } else if (validCount === 3) {
      return { label: 'Moyen', color: 'bg-yellow-500', percentage: 60 };
    } else if (validCount >= 1) {
      return { label: 'Faible', color: 'bg-orange-500', percentage: 40 };
    } else {
      return { label: 'Très faible', color: 'bg-red-500', percentage: 20 };
    }
  };

  // Validation de l'étape 2
  const validateStep2 = (): boolean => {
    setError('');

    if (!authData.email) {
      setError('L\'adresse email est obligatoire');
      return false;
    }

    // Validation email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(authData.email)) {
      setError('L\'adresse email n\'est pas valide');
      return false;
    }

    if (!authData.password) {
      setError('Le mot de passe est obligatoire');
      return false;
    }

    if (!validatePassword(authData.password)) {
      setError('Le mot de passe ne respecte pas tous les critères de sécurité');
      return false;
    }

    if (!authData.confirmPassword) {
      setError('La confirmation du mot de passe est obligatoire');
      return false;
    }

    if (authData.password !== authData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return false;
    }

    if (!educatorData.first_name.trim()) {
      setError('Le prénom est obligatoire');
      return false;
    }

    if (!educatorData.last_name.trim()) {
      setError('Le nom est obligatoire');
      return false;
    }

    if (!educatorData.location.trim()) {
      setError('La localisation est obligatoire');
      return false;
    }

    if (!educatorData.diploma_type) {
      setError('Le diplôme principal est obligatoire');
      return false;
    }

    // Validation RPPS si requis
    if (selectedProfession?.requiresRpps) {
      if (!educatorData.rpps_number) {
        setError('Le numéro RPPS est obligatoire pour votre profession');
        return false;
      }
      if (educatorData.rpps_number.length !== 11) {
        setError('Le numéro RPPS doit contenir 11 chiffres');
        return false;
      }
    }

    if (educatorData.years_of_experience === undefined || educatorData.years_of_experience < 1) {
      setError('Minimum 1 an d\'expérience requis pour s\'inscrire');
      return false;
    }

    return true;
  };

  // Validation de l'étape 3
  const validateStep3 = (): boolean => {
    setError('');

    if (!educatorData.siret) {
      setError('Le numéro SIRET est obligatoire');
      return false;
    }

    const siretValidation = validateSIRET(educatorData.siret);
    if (!siretValidation.valid) {
      setError('Le numéro SIRET est invalide');
      return false;
    }

    if (!cvFile) {
      setError('Veuillez uploader votre CV');
      return false;
    }

    return true;
  };

  // Passer à l'étape suivante avec validation
  const goToStep = (step: number) => {
    if (step === 2 && currentStep === 1) {
      if (!professionType) {
        setError('Veuillez sélectionner votre profession');
        return;
      }
      setError('');
      setCurrentStep(2);
    } else if (step === 3 && currentStep === 2) {
      if (validateStep2()) {
        setCurrentStep(3);
      }
    } else if (step < currentStep) {
      // Retour en arrière toujours autorisé
      setError('');
      setCurrentStep(step);
    }
  };

  const handleUseCurrentLocation = async () => {
    setGeolocating(true);
    try {
      const position = await getCurrentPosition();
      const address = await reverseGeocode(position.latitude, position.longitude);

      if (address) {
        setEducatorData({ ...educatorData, location: address });
      } else {
        alert('Impossible de déterminer votre adresse. Veuillez la saisir manuellement.');
      }
    } catch (error: any) {
      alert(error.message || 'Erreur lors de la géolocalisation');
    } finally {
      setGeolocating(false);
    }
  };

  // Vérification du numéro SIRET via l'API INSEE
  const verifySIRET = async (siret: string) => {
    if (siret.length !== 14) {
      setSiretValidationState({
        isValid: false,
        verified: false,
        message: `${siret.length}/14 chiffres`,
        loading: false,
        data: null,
      });
      return;
    }

    setSiretValidationState(prev => ({ ...prev, loading: true, message: 'Vérification en cours...' }));

    try {
      const response = await fetch('/api/verify-siret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siret }),
      });

      const result = await response.json();

      if (result.valid) {
        if (result.verified && result.data) {
          const isActive = result.data.isActive;
          setSiretValidationState({
            isValid: isActive,
            verified: true,
            message: isActive
              ? `${result.data.companyName || 'Établissement vérifié'}`
              : 'Établissement fermé',
            loading: false,
            data: result.data,
          });
        } else {
          setSiretValidationState({
            isValid: true,
            verified: false,
            message: result.message || 'Format valide (vérification manuelle requise)',
            loading: false,
            data: null,
          });
        }
      } else {
        setSiretValidationState({
          isValid: false,
          verified: result.verified || false,
          message: result.message || result.error || 'Numéro SIRET invalide',
          loading: false,
          data: null,
        });
      }
    } catch (error) {
      setSiretValidationState({
        isValid: true,
        verified: false,
        message: 'Erreur de vérification - sera vérifié manuellement',
        loading: false,
        data: null,
      });
    }
  };

  // Vérification du numéro RPPS via l'API ANS
  const verifyRPPS = async (rppsNumber: string) => {
    if (rppsNumber.length !== 11) {
      setRppsValidationState({
        isValid: false,
        verified: false,
        message: `${rppsNumber.length}/11 chiffres`,
        loading: false,
        data: null,
      });
      return;
    }

    setRppsValidationState(prev => ({ ...prev, loading: true, message: 'Vérification en cours...' }));

    try {
      const response = await fetch('/api/verify-rpps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rppsNumber }),
      });

      const result = await response.json();

      if (result.valid) {
        if (result.verified && result.data) {
          setRppsValidationState({
            isValid: true,
            verified: true,
            message: `Vérifié : ${result.data.firstName || ''} ${result.data.lastName || ''}`.trim() || 'Numéro RPPS vérifié',
            loading: false,
            data: result.data,
          });
        } else {
          setRppsValidationState({
            isValid: true,
            verified: false,
            message: result.message || 'Format valide (vérification manuelle requise)',
            loading: false,
            data: null,
          });
        }
      } else {
        setRppsValidationState({
          isValid: false,
          verified: result.verified || false,
          message: result.message || result.error || 'Numéro RPPS invalide',
          loading: false,
          data: null,
        });
      }
    } catch (error) {
      setRppsValidationState({
        isValid: true,
        verified: false,
        message: 'Erreur de vérification - sera vérifié manuellement',
        loading: false,
        data: null,
      });
    }
  };

  // Validation du SIRET avec algorithme de Luhn
  const validateSIRET = (siret: string): { valid: boolean; message?: string } => {
    if (siret.length !== 14) {
      return { valid: false, message: 'Le SIRET doit contenir exactement 14 chiffres' };
    }

    if (!/^\d{14}$/.test(siret)) {
      return { valid: false, message: 'Le SIRET ne doit contenir que des chiffres' };
    }

    const siren = siret.substring(0, 9);
    let sum = 0;

    for (let i = 0; i < siren.length; i++) {
      let digit = parseInt(siren[i]);

      if ((siren.length - i) % 2 === 0) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
    }

    if (sum % 10 !== 0) {
      return { valid: false, message: 'Le numéro SIRET est invalide' };
    }

    return { valid: true };
  };

  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!professionType) {
      setError('Veuillez sélectionner votre profession');
      return;
    }

    if (!educatorData.diploma_type) {
      setError('Veuillez sélectionner votre diplôme principal');
      return;
    }

    if (authData.password !== authData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (!validatePassword(authData.password)) {
      setError('Le mot de passe ne respecte pas tous les critères de sécurité');
      return;
    }

    if (selectedProfession?.requiresRpps) {
      if (!educatorData.rpps_number) {
        setError('Le numéro RPPS est obligatoire pour votre profession');
        return;
      }
      if (educatorData.rpps_number.length !== 11) {
        setError('Le numéro RPPS doit contenir 11 chiffres');
        return;
      }
    }

    if (!educatorData.siret) {
      setError('Le numéro SIRET est obligatoire');
      return;
    }

    const siretValidation = validateSIRET(educatorData.siret);
    if (!siretValidation.valid) {
      setError(siretValidation.message || 'SIRET invalide');
      return;
    }

    if (!cvFile) {
      setError('Veuillez uploader votre CV');
      return;
    }

    setLoading(true);

    try {
      // Préparer les données du profil
      const profileData = {
        first_name: educatorData.first_name,
        last_name: educatorData.last_name,
        bio: educatorData.bio,
        phone: educatorData.phone,
        location: educatorData.location,
        years_of_experience: educatorData.years_of_experience,
        hourly_rate: educatorData.hourly_rate ? parseFloat(educatorData.hourly_rate) : null,
        specializations: selectedSpecializations,
        languages: selectedLanguages,
        siret: educatorData.siret,
        sap_number: educatorData.sap_number || null,
        profession_type: professionType,
        diploma_type: educatorData.diploma_type,
        rpps_number: educatorData.rpps_number || null,
      };

      // Appeler la nouvelle API d'inscription avec confirmation
      const response = await fetch('/api/register-with-confirmation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: authData.email,
          password: authData.password,
          role: 'educator',
          profileData,
          baseUrl: window.location.origin,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de la création du compte');
      }

      // Upload du CV via l'API (le fichier sera uploadé après confirmation)
      // Pour l'instant, on stocke le CV en local storage pour l'uploader après confirmation
      // Ou on peut créer une API dédiée pour l'upload sans auth

      // Note: Le CV sera demandé à nouveau après la première connexion via la page /dashboard/educator/diploma
      // C'est le comportement actuel qui redirige vers cette page de toute façon

      // Afficher le message de succès
      setRegistrationSuccess(true);

    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  // Grouper les professions par catégorie
  const categories = [
    { name: 'Éducatif', icon: '📚', color: 'from-blue-500 to-blue-600' },
    { name: 'Psychologie', icon: '🧠', color: 'from-purple-500 to-purple-600' },
    { name: 'Thérapies', icon: '💆', color: 'from-green-500 to-green-600' },
    { name: 'Autres', icon: '✨', color: 'from-orange-500 to-orange-600' },
  ];

  // Si l'inscription a réussi, afficher le message de confirmation
  if (registrationSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            {/* Icône email */}
            <div className="mx-auto w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mb-6">
              <svg className="w-10 h-10 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>

            {/* Titre */}
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Vérifiez votre boîte mail !
            </h2>

            {/* Message */}
            <p className="text-gray-600 mb-6">
              Nous avons envoyé un email de confirmation à <strong className="text-gray-900">{authData.email}</strong>.
            </p>

            <p className="text-gray-500 text-sm mb-8">
              Cliquez sur le lien dans l'email pour activer votre compte et finaliser votre inscription sur neurocare.
            </p>

            {/* Note CV */}
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-teal-800">
                <strong>Important :</strong> Après validation de votre email, vous pourrez uploader votre CV et vos diplômes depuis votre tableau de bord.
              </p>
            </div>

            {/* Note spam */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-amber-800">
                <strong>Vous n'avez pas reçu l'email ?</strong><br />
                Vérifiez votre dossier spam ou courrier indésirable.
              </p>
            </div>

            {/* Bouton retour */}
            <Link
              href="/pro/login"
              className="inline-flex items-center justify-center w-full py-3 px-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white rounded-lg font-semibold hover:from-emerald-700 hover:via-teal-700 hover:to-cyan-700 transition-all"
            >
              Aller à la page de connexion
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <LogoPro href="/pro" />
            <div className="flex items-center gap-4">
              <span className="hidden sm:block text-sm text-gray-600">Déjà inscrit ?</span>
              <Link
                href="/pro/login"
                className="text-teal-600 hover:text-teal-700 font-semibold text-sm transition-colors"
              >
                Se connecter
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Hero Section */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-100 to-cyan-100 text-teal-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            neurocare Pro
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Rejoignez notre réseau de
            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent"> professionnels</span>
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Développez votre activité et accompagnez des familles qui ont besoin de vous
          </p>
        </div>

        {/* Étapes */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2 sm:gap-4 bg-white rounded-full shadow-lg px-4 sm:px-6 py-3">
            <div className={`flex items-center gap-2 ${currentStep >= 1 ? 'text-teal-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                currentStep >= 1 ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {currentStep > 1 ? '✓' : '1'}
              </div>
              <span className="hidden sm:block text-sm font-medium">Profession</span>
            </div>
            <div className={`w-8 sm:w-16 h-1 rounded-full ${currentStep >= 2 ? 'bg-teal-600' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center gap-2 ${currentStep >= 2 ? 'text-teal-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                currentStep >= 2 ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {currentStep > 2 ? '✓' : '2'}
              </div>
              <span className="hidden sm:block text-sm font-medium">Informations</span>
            </div>
            <div className={`w-8 sm:w-16 h-1 rounded-full ${currentStep >= 3 ? 'bg-teal-600' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center gap-2 ${currentStep >= 3 ? 'text-teal-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                currentStep >= 3 ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                3
              </div>
              <span className="hidden sm:block text-sm font-medium">Finalisation</span>
            </div>
          </div>
        </div>


        <form onSubmit={handleSubmit}>
          {/* Étape 1: Sélection de la profession */}
          {currentStep === 1 && (
            <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-100">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 text-center">
                Quelle est votre profession ?
              </h2>
              <p className="text-gray-600 text-center mb-8">
                Sélectionnez votre domaine d'expertise
              </p>

              <div className="space-y-8">
                {categories.map((category) => (
                  <div key={category.name}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${category.color} flex items-center justify-center text-xl`}>
                        {category.icon}
                      </div>
                      <h3 className="font-semibold text-gray-900">{category.name}</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {professions.filter(p => p.category === category.name).map((profession) => (
                        <button
                          key={profession.value}
                          type="button"
                          onClick={() => setProfessionType(profession.value)}
                          className={`relative p-4 rounded-xl border-2 text-left transition-all duration-200 hover:shadow-md ${
                            professionType === profession.value
                              ? 'border-teal-500 bg-teal-50 ring-2 ring-teal-200 shadow-md'
                              : 'border-gray-200 hover:border-teal-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{profession.icon}</span>
                            <div className="flex-1">
                              <span className={`font-semibold block ${professionType === profession.value ? 'text-teal-700' : 'text-gray-900'}`}>
                                {profession.label}
                              </span>
                              {profession.requiresRpps && (
                                <span className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full inline-block mt-1">
                                  RPPS requis
                                </span>
                              )}
                            </div>
                            {professionType === profession.value && (
                              <svg className="w-6 h-6 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Bouton suivant */}
              <div className="mt-8 flex justify-between items-center">
                <Link href="/auth/signup" className="text-gray-600 hover:text-teal-600 text-sm font-medium flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Changer de type de compte
                </Link>
                <button
                  type="button"
                  onClick={() => goToStep(2)}
                  disabled={!professionType}
                  className="px-8 py-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:from-emerald-700 hover:via-teal-700 hover:to-cyan-700 flex items-center gap-2"
                >
                  Continuer
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Étape 2: Informations personnelles et professionnelles */}
          {currentStep === 2 && (
            <div className="space-y-6">
              {/* Badge profession sélectionnée */}
              <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white rounded-2xl p-4 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{selectedProfession?.icon}</span>
                    <div>
                      <p className="text-sm text-white/80">Profession sélectionnée</p>
                      <p className="font-bold text-lg">{selectedProfession?.label}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => goToStep(1)}
                    className="text-white/80 hover:text-white text-sm underline"
                  >
                    Modifier
                  </button>
                </div>
              </div>

              {/* Formulaire */}
              <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Vos informations
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Email */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Adresse email *</label>
                    <input
                      type="email"
                      required
                      value={authData.email}
                      onChange={(e) => setAuthData({ ...authData, email: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                      placeholder="votre@email.com"
                    />
                  </div>

                  {/* Mot de passe */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Mot de passe *</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={authData.password}
                        onChange={handlePasswordChange}
                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? (
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        ) : (
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                    {showPasswordStrength && (
                      <div className="mt-2">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-600">Force</span>
                          <span className={getPasswordStrength().percentage === 100 ? 'text-green-600 font-semibold' : 'text-gray-600'}>
                            {getPasswordStrength().label}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrength().color}`}
                            style={{ width: `${getPasswordStrength().percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Confirmation mot de passe */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Confirmer *</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={authData.confirmPassword}
                        onChange={(e) => setAuthData({ ...authData, confirmPassword: e.target.value })}
                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? (
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        ) : (
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Prénom */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Prénom *</label>
                    <input
                      type="text"
                      required
                      value={educatorData.first_name}
                      onChange={(e) => setEducatorData({ ...educatorData, first_name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                      placeholder="Jean"
                    />
                  </div>

                  {/* Nom */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Nom *</label>
                    <input
                      type="text"
                      required
                      value={educatorData.last_name}
                      onChange={(e) => setEducatorData({ ...educatorData, last_name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                      placeholder="Dupont"
                    />
                  </div>

                  {/* Téléphone */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Téléphone</label>
                    <input
                      type="tel"
                      value={educatorData.phone}
                      onChange={(e) => setEducatorData({ ...educatorData, phone: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                      placeholder="06 12 34 56 78"
                    />
                  </div>

                  {/* Localisation */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Localisation *</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        required
                        value={educatorData.location}
                        onChange={(e) => setEducatorData({ ...educatorData, location: e.target.value })}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                        placeholder="Paris, France"
                      />
                      <button
                        type="button"
                        onClick={handleUseCurrentLocation}
                        disabled={geolocating}
                        className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 disabled:opacity-50 transition-all"
                        title="Ma position"
                      >
                        {geolocating ? (
                          <div className="animate-spin h-5 w-5 border-2 border-teal-600 border-t-transparent rounded-full"></div>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Diplôme */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Diplôme principal *</label>
                    <select
                      required
                      value={educatorData.diploma_type}
                      onChange={(e) => setEducatorData({ ...educatorData, diploma_type: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                    >
                      <option value="">Sélectionnez votre diplôme</option>
                      {selectedProfession?.diplomas.map((diploma) => (
                        <option key={diploma} value={diploma}>
                          {diplomaLabels[diploma]}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* RPPS (si requis) */}
                  {selectedProfession?.requiresRpps && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Numéro RPPS *</label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          maxLength={11}
                          value={educatorData.rpps_number}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '');
                            setEducatorData({ ...educatorData, rpps_number: value });

                            if (value.length < 11) {
                              setRppsValidationState({
                                isValid: null,
                                verified: false,
                                message: value.length > 0 ? `${value.length}/11 chiffres` : '',
                                loading: false,
                                data: null,
                              });
                            } else if (value.length === 11) {
                              verifyRPPS(value);
                            }
                          }}
                          placeholder="12345678901"
                          className={`w-full px-4 py-3 pr-12 border rounded-xl transition-all ${
                            rppsValidationState.isValid === true
                              ? 'border-green-500 bg-green-50 focus:ring-green-500'
                              : rppsValidationState.isValid === false && educatorData.rpps_number.length === 11
                              ? 'border-red-500 bg-red-50'
                              : 'border-gray-300 focus:ring-teal-500 focus:border-teal-500'
                          }`}
                        />
                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                          {rppsValidationState.loading ? (
                            <div className="animate-spin h-5 w-5 border-2 border-teal-500 border-t-transparent rounded-full"></div>
                          ) : rppsValidationState.isValid === true ? (
                            <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          ) : rppsValidationState.isValid === false && educatorData.rpps_number.length === 11 ? (
                            <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                          ) : null}
                        </div>
                      </div>
                      <p className={`mt-1 text-xs ${
                        rppsValidationState.isValid === true ? 'text-green-600' :
                        rppsValidationState.isValid === false ? 'text-red-600' : 'text-gray-500'
                      }`}>
                        {rppsValidationState.message || '11 chiffres - Obligatoire pour les professions de santé'}
                      </p>
                    </div>
                  )}

                  {/* Expérience */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Années d'expérience * (minimum 1 an)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="Minimum 1 an"
                      value={educatorData.years_of_experience}
                      onChange={(e) => setEducatorData({ ...educatorData, years_of_experience: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                    />
                  </div>

                  {/* Tarif horaire */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Tarif horaire (€)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={educatorData.hourly_rate}
                      onChange={(e) => setEducatorData({ ...educatorData, hourly_rate: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                      placeholder="40"
                    />
                  </div>

                  {/* Bio */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Présentez-vous</label>
                    <textarea
                      rows={4}
                      value={educatorData.bio}
                      onChange={(e) => setEducatorData({ ...educatorData, bio: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all resize-none"
                      placeholder="Décrivez votre parcours, vos motivations et votre approche..."
                    />
                  </div>
                </div>

                {/* Navigation */}
                <div className="mt-8 flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => goToStep(1)}
                    className="text-gray-600 hover:text-teal-600 font-medium flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Retour
                  </button>
                  <button
                    type="button"
                    onClick={() => goToStep(3)}
                    className="px-8 py-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all hover:from-emerald-700 hover:via-teal-700 hover:to-cyan-700 flex items-center gap-2"
                  >
                    Continuer
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Étape 3: Finalisation */}
          {currentStep === 3 && (
            <div className="space-y-6">
              {/* Badge profession */}
              <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white rounded-2xl p-4 shadow-lg">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{selectedProfession?.icon}</span>
                  <div>
                    <p className="font-bold text-lg">{selectedProfession?.label}</p>
                    <p className="text-sm text-white/80">{educatorData.first_name} {educatorData.last_name} • {educatorData.location}</p>
                  </div>
                </div>
              </div>

              {/* Informations professionnelles */}
              <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Informations administratives
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* SIRET */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Numéro SIRET *</label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        maxLength={14}
                        value={educatorData.siret}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          setEducatorData({ ...educatorData, siret: value });

                          if (value.length < 14) {
                            setSiretValidationState({
                              isValid: null,
                              verified: false,
                              message: value.length > 0 ? `${value.length}/14 chiffres` : '',
                              loading: false,
                              data: null,
                            });
                          } else if (value.length === 14) {
                            verifySIRET(value);
                          }
                        }}
                        placeholder="12345678901234"
                        className={`w-full px-4 py-3 pr-12 border rounded-xl transition-all ${
                          siretValidationState.isValid === true
                            ? 'border-green-500 bg-green-50 focus:ring-green-500'
                            : siretValidationState.isValid === false && educatorData.siret.length === 14
                            ? 'border-red-500 bg-red-50'
                            : 'border-gray-300 focus:ring-teal-500 focus:border-teal-500'
                        }`}
                      />
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                        {siretValidationState.loading ? (
                          <div className="animate-spin h-5 w-5 border-2 border-teal-500 border-t-transparent rounded-full"></div>
                        ) : siretValidationState.isValid === true ? (
                          <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        ) : siretValidationState.isValid === false && educatorData.siret.length === 14 ? (
                          <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        ) : null}
                      </div>
                    </div>
                    <p className={`mt-1 text-xs ${
                      siretValidationState.isValid === true ? 'text-green-600' :
                      siretValidationState.isValid === false ? 'text-red-600' : 'text-gray-500'
                    }`}>
                      {siretValidationState.message || '14 chiffres - Obligatoire pour la facturation'}
                    </p>
                  </div>

                  {/* SAP */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Numéro d'agrément SAP
                      <span className="text-green-600 font-normal ml-2">(Facultatif)</span>
                    </label>
                    <input
                      type="text"
                      value={educatorData.sap_number}
                      onChange={(e) => setEducatorData({ ...educatorData, sap_number: e.target.value.toUpperCase() })}
                      placeholder="SAP123456789"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                    />
                    <div className="mt-3 bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200 rounded-xl p-4">
                      <p className="text-sm text-teal-800 font-semibold mb-1">
                        💡 Avantage : Crédit d'impôt 50% pour vos clients
                      </p>
                      <p className="text-xs text-teal-700">
                        Avec l'agrément SAP, vos clients bénéficient du CESU préfinancé et du crédit d'impôt !
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Spécialisations */}
              <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Spécialisations
                  {selectedSpecializations.length > 0 && (
                    <span className="ml-2 bg-teal-100 text-teal-700 text-sm px-2 py-1 rounded-full">
                      {selectedSpecializations.length}
                    </span>
                  )}
                </h2>

                <div className="flex flex-wrap gap-2">
                  {availableSpecializations.map((spec) => (
                    <button
                      key={spec}
                      type="button"
                      onClick={() => toggleSpecialization(spec)}
                      className={`px-4 py-2 text-sm rounded-full border-2 transition-all ${
                        selectedSpecializations.includes(spec)
                          ? 'bg-teal-100 border-teal-500 text-teal-700 font-semibold'
                          : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-teal-300 hover:bg-teal-50'
                      }`}
                    >
                      {selectedSpecializations.includes(spec) && (
                        <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                      {spec}
                    </button>
                  ))}
                </div>
              </div>

              {/* Langues */}
              <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                  </svg>
                  Langues parlées
                </h2>

                <div className="flex flex-wrap gap-2">
                  {availableLanguages.map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => toggleLanguage(lang)}
                      className={`px-4 py-2 text-sm rounded-full border-2 transition-all ${
                        selectedLanguages.includes(lang)
                          ? 'bg-green-100 border-green-500 text-green-700 font-semibold'
                          : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-green-300 hover:bg-green-50'
                      }`}
                    >
                      {selectedLanguages.includes(lang) && (
                        <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              {/* CV Upload */}
              <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  CV *
                </h2>

                <label className="cursor-pointer block">
                  <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                    cvFile ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-teal-500 hover:bg-teal-50'
                  }`}>
                    {cvFile ? (
                      <div className="flex items-center justify-center gap-3 text-green-700">
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="text-left">
                          <p className="font-semibold">{cvFile.name}</p>
                          <p className="text-sm text-green-600">Fichier prêt à être envoyé</p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-gray-600">
                        <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <p className="font-semibold">Cliquez pour uploader votre CV</p>
                        <p className="text-sm text-gray-500 mt-1">PDF uniquement, max 5MB</p>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    accept=".pdf"
                    required
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        if (file.size > 5 * 1024 * 1024) {
                          alert('Le fichier est trop volumineux (max 5MB)');
                          return;
                        }
                        if (file.type !== 'application/pdf') {
                          alert('Seuls les fichiers PDF sont acceptés');
                          return;
                        }
                        setCvFile(file);
                      }
                    }}
                  />
                </label>
                {cvFile && (
                  <button
                    type="button"
                    onClick={() => setCvFile(null)}
                    className="mt-3 text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    Supprimer le fichier
                  </button>
                )}
              </div>

              {/* Consentement RGPD */}
              <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Consentement</h2>

                <div className="space-y-4">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      required
                      className="mt-1 h-5 w-5 text-teal-600 focus:ring-teal-500 border-gray-300 rounded cursor-pointer"
                    />
                    <span className="text-sm text-gray-700 group-hover:text-gray-900">
                      J'accepte les{' '}
                      <a href="/cgu" target="_blank" className="text-teal-600 hover:underline font-medium">
                        conditions générales d'utilisation
                      </a>{' '}
                      et la{' '}
                      <a href="/politique-confidentialite" target="_blank" className="text-teal-600 hover:underline font-medium">
                        politique de confidentialité
                      </a>. <span className="text-red-500">*</span>
                    </span>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      required
                      className="mt-1 h-5 w-5 text-teal-600 focus:ring-teal-500 border-gray-300 rounded cursor-pointer"
                    />
                    <span className="text-sm text-gray-700 group-hover:text-gray-900">
                      Je consens au traitement de mes données personnelles pour la mise en relation avec des familles et la vérification de mes diplômes. <span className="text-red-500">*</span>
                    </span>
                  </label>
                </div>
              </div>

              {/* Navigation finale */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <button
                  type="button"
                  onClick={() => goToStep(2)}
                  className="w-full sm:w-auto text-gray-600 hover:text-teal-600 font-medium flex items-center justify-center gap-2 py-3"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Retour
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    if (validateStep3()) {
                      // Soumettre le formulaire manuellement
                      const form = e.currentTarget.closest('form');
                      if (form) {
                        form.requestSubmit();
                      }
                    }
                  }}
                  disabled={loading}
                  className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:from-emerald-700 hover:via-teal-700 hover:to-cyan-700 flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                      Création en cours...
                    </>
                  ) : (
                    <>
                      Créer mon compte
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-8 mt-12">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-sm text-gray-600">
            Besoin d'aide ?{' '}
            <Link href="/contact" className="text-teal-600 hover:underline font-medium">
              Contactez-nous
            </Link>
          </p>
          <p className="text-xs text-gray-500 mt-2">
            © 2024 neurocare. Tous droits réservés.
          </p>
        </div>
      </footer>

      {/* Toast notification en bas à droite */}
      {error && (
        <div className="fixed bottom-4 right-4 left-4 md:left-auto md:w-96 z-50 animate-slide-up">
          <div className="bg-red-600 text-white px-6 py-4 rounded-lg shadow-2xl border-2 border-red-700">
            <div className="flex items-start gap-3">
              <svg className="h-6 w-6 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-medium">{error}</p>
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
    </div>
  );
}
