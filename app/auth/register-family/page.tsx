&apos;use client&apos;;

export const dynamic = &apos;force-dynamic&apos;;

import { useState } from &apos;react&apos;;
import { useRouter } from &apos;next/navigation&apos;;
import Link from &apos;next/link&apos;;
import { supabase } from &apos;@/lib/supabase&apos;;
import { getCurrentPosition, reverseGeocode } from &apos;@/lib/geolocation&apos;;

interface PasswordCriteria {
  minLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

export default function RegisterFamilyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [geolocating, setGeolocating] = useState(false);
  const [error, setError] = useState(&apos;&apos;);
  const [showPasswordStrength, setShowPasswordStrength] = useState(false);

  // Données d&apos;authentification
  const [authData, setAuthData] = useState({
    email: &apos;&apos;,
    password: &apos;&apos;,
    confirmPassword: &apos;&apos;,
  });

  // Données de profil famille
  const [familyData, setFamilyData] = useState({
    first_name: &apos;&apos;,
    last_name: &apos;&apos;,
    phone: &apos;&apos;,
    location: &apos;&apos;,
    relationship: &apos;parent&apos;,
    person_with_autism_age: &apos;&apos;,
    support_level_needed: &apos;level_1&apos;,
    specific_needs: &apos;&apos;,
    preferred_certifications: [] as string[],
    budget_min: &apos;&apos;,
    budget_max: &apos;&apos;,
  });

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
      hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};&apos;:"\\|,.<>\/?]/.test(pwd),
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
      return { label: &apos;Très fort&apos;, color: &apos;bg-green-500&apos;, percentage: 100 };
    } else if (validCount === 4) {
      return { label: &apos;Fort&apos;, color: &apos;bg-green-400&apos;, percentage: 80 };
    } else if (validCount === 3) {
      return { label: &apos;Moyen&apos;, color: &apos;bg-yellow-500&apos;, percentage: 60 };
    } else if (validCount >= 1) {
      return { label: &apos;Faible&apos;, color: &apos;bg-orange-500&apos;, percentage: 40 };
    } else {
      return { label: &apos;Très faible&apos;, color: &apos;bg-red-500&apos;, percentage: 20 };
    }
  };

  const handleUseCurrentLocation = async () => {
    setGeolocating(true);
    try {
      const position = await getCurrentPosition();
      const address = await reverseGeocode(position.latitude, position.longitude);

      if (address) {
        setFamilyData({ ...familyData, location: address });
      } else {
        alert(&apos;Impossible de déterminer votre adresse. Veuillez la saisir manuellement.&apos;);
      }
    } catch (error: any) {
      alert(error.message || &apos;Erreur lors de la géolocalisation&apos;);
    } finally {
      setGeolocating(false);
    }
  };

  const handleCertificationToggle = (cert: string) => {
    const current = familyData.preferred_certifications;
    if (current.includes(cert)) {
      setFamilyData({
        ...familyData,
        preferred_certifications: current.filter(c => c !== cert),
      });
    } else {
      setFamilyData({
        ...familyData,
        preferred_certifications: [...current, cert],
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(&apos;&apos;);

    // Validation du mot de passe
    if (authData.password !== authData.confirmPassword) {
      setError(&apos;Les mots de passe ne correspondent pas&apos;);
      return;
    }

    if (!validatePassword(authData.password)) {
      setError(&apos;Le mot de passe ne respecte pas tous les critères de sécurité&apos;);
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
            role: &apos;family&apos;,
          },
        },
      });

      if (authError) {
        if (authError.message.includes(&apos;already been registered&apos;)) {
          throw new Error(&apos;Cet email est déjà utilisé. Essayez de vous connecter ou utilisez un autre email.&apos;);
        }
        throw new Error(authError.message);
      }

      if (!authResult.user) {
        throw new Error(&apos;Erreur lors de la création du compte&apos;);
      }

      // Si l&apos;email nécessite une confirmation et n&apos;est pas confirmé
      if (authResult.user.email_confirmed_at === null) {
        setError(&apos;Un email de confirmation a été envoyé. Veuillez vérifier votre boîte mail.&apos;);
        setLoading(false);
        return;
      }

      // 2. Créer le profil via l&apos;API
      const profileData = {
        first_name: familyData.first_name,
        last_name: familyData.last_name,
        phone: familyData.phone,
        location: familyData.location,
        relationship: familyData.relationship,
        person_with_autism_age: familyData.person_with_autism_age ? parseInt(familyData.person_with_autism_age) : null,
        support_level_needed: familyData.support_level_needed,
        specific_needs: familyData.specific_needs.split(&apos;,&apos;).map(s => s.trim()).filter(Boolean),
        preferred_certifications: familyData.preferred_certifications,
        budget_min: familyData.budget_min ? parseFloat(familyData.budget_min) : null,
        budget_max: familyData.budget_max ? parseFloat(familyData.budget_max) : null,
      };

      const response = await fetch(&apos;/api/create-profile-simple&apos;, {
        method: &apos;POST&apos;,
        headers: {
          &apos;Content-Type&apos;: &apos;application/json&apos;,
        },
        body: JSON.stringify({
          userId: authResult.user.id,
          role: &apos;family&apos;,
          profileData,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || &apos;Erreur lors de la création du profil&apos;);
      }

      // 3. Rediriger vers le dashboard
      router.push(&apos;/dashboard/family&apos;);
    } catch (err: any) {
      setError(err.message || &apos;Une erreur est survenue&apos;);
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
            Inscription Famille
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Ou{&apos; &apos;}
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="text-sm font-medium text-gray-900">
                  Compte Famille / Personne avec TSA
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
                      getPasswordStrength().percentage === 100 ? &apos;text-green-600&apos; :
                      getPasswordStrength().percentage >= 60 ? &apos;text-yellow-600&apos; :
                      &apos;text-red-600&apos;
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
                      <span className={passwordCriteria.minLength ? &apos;text-green-700&apos; : &apos;text-gray-600&apos;}>
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
                      <span className={passwordCriteria.hasUppercase ? &apos;text-green-700&apos; : &apos;text-gray-600&apos;}>
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
                      <span className={passwordCriteria.hasLowercase ? &apos;text-green-700&apos; : &apos;text-gray-600&apos;}>
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
                      <span className={passwordCriteria.hasNumber ? &apos;text-green-700&apos; : &apos;text-gray-600&apos;}>
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
                      <span className={passwordCriteria.hasSpecialChar ? &apos;text-green-700&apos; : &apos;text-gray-600&apos;}>
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
              <h3 className="text-lg font-medium text-gray-900 mb-4">Votre profil famille</h3>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Prénom *</label>
                <input
                  type="text"
                  required
                  value={familyData.first_name}
                  onChange={(e) => setFamilyData({ ...familyData, first_name: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Nom *</label>
                <input
                  type="text"
                  required
                  value={familyData.last_name}
                  onChange={(e) => setFamilyData({ ...familyData, last_name: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Téléphone</label>
              <input
                type="tel"
                value={familyData.phone}
                onChange={(e) => setFamilyData({ ...familyData, phone: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Localisation *</label>
              <div className="mt-1 flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="Ex: Paris, France"
                  value={familyData.location}
                  onChange={(e) => setFamilyData({ ...familyData, location: e.target.value })}
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
              <label className="block text-sm font-medium text-gray-700">Vous êtes *</label>
              <select
                value={familyData.relationship}
                onChange={(e) => setFamilyData({ ...familyData, relationship: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="parent">Parent</option>
                <option value="guardian">Tuteur</option>
                <option value="self">Personne avec TSA</option>
                <option value="other">Autre</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Âge de la personne avec TSA</label>
              <input
                type="number"
                min="0"
                max="150"
                value={familyData.person_with_autism_age}
                onChange={(e) => setFamilyData({ ...familyData, person_with_autism_age: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Niveau de soutien requis *</label>
              <select
                value={familyData.support_level_needed}
                onChange={(e) => setFamilyData({ ...familyData, support_level_needed: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="level_1">Niveau 1 - Nécessite un soutien</option>
                <option value="level_2">Niveau 2 - Nécessite un soutien important</option>
                <option value="level_3">Niveau 3 - Nécessite un soutien très important</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Besoins spécifiques (séparés par des virgules)</label>
              <textarea
                rows={2}
                placeholder="Ex: Communication non verbale, Gestion des comportements, Compétences sociales"
                value={familyData.specific_needs}
                onChange={(e) => setFamilyData({ ...familyData, specific_needs: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Certifications préférées (optionnel)</label>
              <div className="space-y-2">
                {[&apos;ABA&apos;, &apos;TEACCH&apos;, &apos;PECS&apos;, &apos;DEES&apos;, &apos;DEME&apos;].map((cert) => (
                  <div key={cert} className="flex items-center">
                    <input
                      id={`cert-${cert}`}
                      type="checkbox"
                      checked={familyData.preferred_certifications.includes(cert)}
                      onChange={() => handleCertificationToggle(cert)}
                      className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
                    />
                    <label htmlFor={`cert-${cert}`} className="ml-2 block text-sm text-gray-700">
                      {cert}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Budget minimum (€/h)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={familyData.budget_min}
                  onChange={(e) => setFamilyData({ ...familyData, budget_min: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Budget maximum (€/h)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={familyData.budget_max}
                  onChange={(e) => setFamilyData({ ...familyData, budget_max: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
            >
              {loading ? &apos;Création...&apos; : &apos;Créer mon compte&apos;}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
