'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { getCurrentPosition, reverseGeocode } from '@/lib/geolocation';

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
  const planParam = searchParams.get('plan'); // Récupérer le paramètre plan de l'URL
  const [loading, setLoading] = useState(false);
  const [geolocating, setGeolocating] = useState(false);
  const [error, setError] = useState('');
  const [showPasswordStrength, setShowPasswordStrength] = useState(false);

  // Données d'authentification
  const [authData, setAuthData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });

  // Données de profil éducateur
  const [educatorData, setEducatorData] = useState({
    first_name: '',
    last_name: '',
    bio: '',
    phone: '',
    location: '',
    years_of_experience: 0,
    hourly_rate: '',
    specializations: '',
    languages: '',
    siret: '',
    sap_number: '',
  });

  // CV File
  const [cvFile, setCvFile] = useState<File | null>(null);

  // État de validation SIRET
  const [siretValidationState, setSiretValidationState] = useState<{
    isValid: boolean | null;
    message: string;
  }>({ isValid: null, message: '' });

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
    setError('');

    // Validation du mot de passe
    if (authData.password !== authData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (!validatePassword(authData.password)) {
      setError('Le mot de passe ne respecte pas tous les critères de sécurité');
      return;
    }

    // Validation du SIRET
    if (!educatorData.siret) {
      setError('Le numéro SIRET est obligatoire');
      return;
    }

    const siretValidation = validateSIRET(educatorData.siret);
    if (!siretValidation.valid) {
      setError(siretValidation.message || 'SIRET invalide');
      return;
    }

    // Validation du CV
    if (!cvFile) {
      setError('Veuillez uploader votre CV');
      return;
    }

    setLoading(true);

    try {
      // 1. Créer le compte utilisateur avec Supabase Auth
      const { data: authResult, error: authError } = await supabase.auth.signUp({
        email: authData.email,
        password: authData.password,
        options: {
          data: {
            role: 'educator',
          },
        },
      });

      if (authError) {
        if (authError.message.includes('already been registered')) {
          throw new Error('Cet email est déjà utilisé. Essayez de vous connecter ou utilisez un autre email.');
        }
        throw new Error(authError.message);
      }

      if (!authResult.user) {
        throw new Error('Erreur lors de la création du compte');
      }

      // Si l'email nécessite une confirmation et n'est pas confirmé
      if (authResult.user.email_confirmed_at === null) {
        setError('Un email de confirmation a été envoyé. Veuillez vérifier votre boîte mail.');
        setLoading(false);
        return;
      }

      // 2. Créer le profil via l'API
      const profileData = {
        first_name: educatorData.first_name,
        last_name: educatorData.last_name,
        bio: educatorData.bio,
        phone: educatorData.phone,
        location: educatorData.location,
        years_of_experience: educatorData.years_of_experience,
        hourly_rate: educatorData.hourly_rate ? parseFloat(educatorData.hourly_rate) : null,
        specializations: educatorData.specializations.split(',').map(s => s.trim()).filter(Boolean),
        languages: educatorData.languages.split(',').map(l => l.trim()).filter(Boolean),
        siret: educatorData.siret,
        sap_number: educatorData.sap_number || null,
      };

      const response = await fetch('/api/create-profile-simple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: authResult.user.id,
          role: 'educator',
          profileData,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Erreur lors de la création du profil');
      }

      // 3. Upload du CV vers Supabase Storage
      if (cvFile && authResult.user) {
        const fileExt = cvFile.name.split('.').pop();
        const fileName = `${authResult.user.id}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('educator-cvs')
          .upload(fileName, cvFile, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error('Erreur upload CV:', uploadError);
          throw new Error('Erreur lors de l\'upload du CV');
        }

        // Mettre à jour le profil avec l'URL du CV
        const { error: updateError } = await supabase
          .from('educator_profiles')
          .update({ cv_url: fileName })
          .eq('user_id', authResult.user.id);

        if (updateError) {
          console.error('Erreur MAJ profil CV:', updateError);
        }
      }

      // 4. Si éducateur venant de /pricing, rediriger vers Stripe Checkout
      if (planParam && result.data?.id) {
        // Créer la session Stripe
        const checkoutResponse = await fetch('/api/create-checkout-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            educatorId: result.data.id,
            planType: planParam,
          }),
        });

        const checkoutData = await checkoutResponse.json();

        if (checkoutData.url) {
          // Rediriger vers Stripe Checkout
          window.location.href = checkoutData.url;
          return;
        }
      }

      // 5. Sinon, rediriger vers la page de gestion du diplôme
      router.push('/dashboard/educator/diploma');
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-bold text-primary-600">
            Autisme Connect
          </Link>
          <h2 className="mt-4 text-2xl font-extrabold text-gray-900">
            Inscription Éducateur
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Ou{' '}
            <Link href="/auth/login" className="font-medium text-primary-600 hover:text-primary-500">
              connectez-vous à votre compte existant
            </Link>
          </p>
          <div className="mt-2">
            <Link
              href="/auth/signup"
              className="text-sm text-gray-500 hover:text-primary-600"
            >
              ← Changer de type de compte
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Section Compte */}
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center">
                <svg className="w-6 h-6 text-primary-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-sm font-medium text-gray-900">
                  Compte Éducateur Spécialisé
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                required
                value={authData.email}
                onChange={(e) => setAuthData({ ...authData, email: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Mot de passe</label>
              <input
                type="password"
                required
                value={authData.password}
                onChange={handlePasswordChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500"
              />

              {/* Indicateur de force du mot de passe */}
              {showPasswordStrength && (
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-700">
                      Force du mot de passe :
                    </span>
                    <span className={`text-xs font-semibold ${
                      getPasswordStrength().percentage === 100 ? 'text-green-600' :
                      getPasswordStrength().percentage >= 60 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {getPasswordStrength().label}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrength().color}`}
                      style={{ width: `${getPasswordStrength().percentage}%` }}
                    ></div>
                  </div>

                  {/* Critères de validation */}
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center text-xs">
                      {passwordCriteria.minLength ? (
                        <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-gray-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      )}
                      <span className={passwordCriteria.minLength ? 'text-green-700' : 'text-gray-600'}>
                        Au moins 8 caractères
                      </span>
                    </div>

                    <div className="flex items-center text-xs">
                      {passwordCriteria.hasUppercase ? (
                        <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-gray-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      )}
                      <span className={passwordCriteria.hasUppercase ? 'text-green-700' : 'text-gray-600'}>
                        Une lettre majuscule
                      </span>
                    </div>

                    <div className="flex items-center text-xs">
                      {passwordCriteria.hasLowercase ? (
                        <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-gray-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      )}
                      <span className={passwordCriteria.hasLowercase ? 'text-green-700' : 'text-gray-600'}>
                        Une lettre minuscule
                      </span>
                    </div>

                    <div className="flex items-center text-xs">
                      {passwordCriteria.hasNumber ? (
                        <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-gray-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      )}
                      <span className={passwordCriteria.hasNumber ? 'text-green-700' : 'text-gray-600'}>
                        Un chiffre
                      </span>
                    </div>

                    <div className="flex items-center text-xs">
                      {passwordCriteria.hasSpecialChar ? (
                        <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-gray-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      )}
                      <span className={passwordCriteria.hasSpecialChar ? 'text-green-700' : 'text-gray-600'}>
                        Un caractère spécial (!@#$%^&*...)
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Confirmer le mot de passe</label>
              <input
                type="password"
                required
                value={authData.confirmPassword}
                onChange={(e) => setAuthData({ ...authData, confirmPassword: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            {/* Séparateur */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Votre profil éducateur</h3>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Prénom *</label>
                <input
                  type="text"
                  required
                  value={educatorData.first_name}
                  onChange={(e) => setEducatorData({ ...educatorData, first_name: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Nom *</label>
                <input
                  type="text"
                  required
                  value={educatorData.last_name}
                  onChange={(e) => setEducatorData({ ...educatorData, last_name: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Téléphone</label>
              <input
                type="tel"
                value={educatorData.phone}
                onChange={(e) => setEducatorData({ ...educatorData, phone: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            {/* Section Informations professionnelles */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-base font-semibold text-gray-900 mb-4">Informations professionnelles</h3>

              <div className="space-y-4">
                {/* SIRET */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Numéro SIRET *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      maxLength={14}
                      value={educatorData.siret}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        setEducatorData({ ...educatorData, siret: value });

                        // Valider en temps réel si on a 14 chiffres
                        if (value.length === 14) {
                          const validation = validateSIRET(value);
                          setSiretValidationState({
                            isValid: validation.valid,
                            message: validation.message || 'SIRET valide ✓'
                          });
                        } else if (value.length > 0) {
                          setSiretValidationState({
                            isValid: false,
                            message: `${value.length}/14 chiffres`
                          });
                        } else {
                          setSiretValidationState({ isValid: null, message: '' });
                        }
                      }}
                      placeholder="12345678901234"
                      className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 pr-10 focus:ring-primary-500 focus:border-primary-500 ${
                        siretValidationState.isValid === true
                          ? 'border-green-500 bg-green-50'
                          : siretValidationState.isValid === false
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-300'
                      }`}
                    />
                    {siretValidationState.isValid !== null && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        {siretValidationState.isValid ? (
                          <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    )}
                  </div>
                  <p className={`mt-1 text-xs ${
                    siretValidationState.isValid === true
                      ? 'text-green-600 font-medium'
                      : siretValidationState.isValid === false
                      ? 'text-red-600'
                      : 'text-gray-500'
                  }`}>
                    {siretValidationState.message || '14 chiffres - Obligatoire pour la facturation et les paiements'}
                  </p>
                </div>

                {/* SAP Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                    Numéro d'agrément SAP
                    <span className="text-xs text-green-600 font-normal">(Facultatif)</span>
                  </label>
                  <input
                    type="text"
                    value={educatorData.sap_number}
                    onChange={(e) => setEducatorData({ ...educatorData, sap_number: e.target.value.toUpperCase() })}
                    placeholder="SAP123456789"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500"
                  />
                  <div className="mt-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-xs text-blue-800 mb-2">
                      <strong>💡 Avantage : Crédit d'impôt 50% pour vos clients</strong>
                    </p>
                    <p className="text-xs text-blue-700 mb-2">
                      Avec l'agrément Services à la Personne, vos clients peuvent bénéficier du CESU préfinancé et du crédit d'impôt de 50% !
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

            <div>
              <label className="block text-sm font-medium text-gray-700">Localisation *</label>
              <div className="mt-1 flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="Ex: Paris, France"
                  value={educatorData.location}
                  onChange={(e) => setEducatorData({ ...educatorData, location: e.target.value })}
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
              <label className="block text-sm font-medium text-gray-700">Bio</label>
              <textarea
                rows={3}
                value={educatorData.bio}
                onChange={(e) => setEducatorData({ ...educatorData, bio: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Années d'expérience *</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={educatorData.years_of_experience}
                  onChange={(e) => setEducatorData({ ...educatorData, years_of_experience: parseInt(e.target.value) })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Tarif horaire (€)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={educatorData.hourly_rate}
                  onChange={(e) => setEducatorData({ ...educatorData, hourly_rate: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Spécialisations (séparées par des virgules)</label>
              <input
                type="text"
                placeholder="Ex: Troubles du comportement, Communication, Autonomie"
                value={educatorData.specializations}
                onChange={(e) => setEducatorData({ ...educatorData, specializations: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Langues parlées (séparées par des virgules)</label>
              <input
                type="text"
                placeholder="Ex: Français, Anglais, Arabe"
                value={educatorData.languages}
                onChange={(e) => setEducatorData({ ...educatorData, languages: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            {/* CV Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CV (obligatoire) *
              </label>
              <div className="mt-1 flex items-center gap-4">
                <label className="flex-1 cursor-pointer">
                  <div className={`border-2 border-dashed rounded-lg p-4 text-center ${
                    cvFile ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-primary-500'
                  }`}>
                    {cvFile ? (
                      <div className="flex items-center justify-center gap-2 text-green-700">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-medium">{cvFile.name}</span>
                      </div>
                    ) : (
                      <div className="text-gray-600">
                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <p className="mt-1 text-sm">Cliquez pour uploader votre CV</p>
                        <p className="mt-1 text-xs text-gray-500">PDF uniquement, max 5MB</p>
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
                    className="px-3 py-2 text-sm text-red-600 hover:text-red-700 border border-red-300 rounded-md hover:bg-red-50"
                  >
                    Supprimer
                  </button>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
            >
              {loading ? 'Création...' : 'Créer mon compte'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
