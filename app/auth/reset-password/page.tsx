&apos;use client&apos;;

import { useState, useEffect } from &apos;react&apos;;
import { useRouter } from &apos;next/navigation&apos;;
import Link from &apos;next/link&apos;;
import { updatePassword } from &apos;@/lib/auth&apos;;
import { supabase } from &apos;@/lib/supabase&apos;;

export default function ResetPasswordPage() {
  const [password, setPassword] = useState(&apos;&apos;);
  const [confirmPassword, setConfirmPassword] = useState(&apos;&apos;);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState(&apos;&apos;);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);
  const [checking, setChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Vérifier si l&apos;utilisateur a un token de récupération valide
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setIsValidToken(true);
        } else {
          setError(&apos;Le lien de réinitialisation est invalide ou a expiré&apos;);
        }
      } catch (err) {
        setError(&apos;Erreur lors de la vérification du lien&apos;);
      } finally {
        setChecking(false);
      }
    };

    checkSession();
  }, []);

  const validatePassword = (pass: string) => {
    if (pass.length < 8) {
      return &apos;Le mot de passe doit contenir au moins 8 caractères&apos;;
    }
    if (!/[A-Z]/.test(pass)) {
      return &apos;Le mot de passe doit contenir au moins une majuscule&apos;;
    }
    if (!/[a-z]/.test(pass)) {
      return &apos;Le mot de passe doit contenir au moins une minuscule&apos;;
    }
    if (!/[0-9]/.test(pass)) {
      return &apos;Le mot de passe doit contenir au moins un chiffre&apos;;
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(&apos;&apos;);

    // Validation
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      setError(&apos;Les mots de passe ne correspondent pas&apos;);
      return;
    }

    setLoading(true);

    try {
      await updatePassword(password);
      setSuccess(true);

      // Rediriger vers la page de connexion après 3 secondes
      setTimeout(() => {
        router.push(&apos;/auth/login&apos;);
      }, 3000);
    } catch (err: any) {
      setError(err.message || &apos;Une erreur est survenue lors de la réinitialisation du mot de passe&apos;);
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = (pass: string) => {
    let strength = 0;
    if (pass.length >= 8) strength++;
    if (pass.length >= 12) strength++;
    if (/[A-Z]/.test(pass)) strength++;
    if (/[a-z]/.test(pass)) strength++;
    if (/[0-9]/.test(pass)) strength++;
    if (/[^A-Za-z0-9]/.test(pass)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(password);

  if (checking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Vérification du lien...</p>
        </div>
      </div>
    );
  }

  if (!isValidToken && !checking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-blue-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-10 px-6 shadow-xl rounded-2xl sm:px-12 border border-gray-100">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Lien invalide ou expiré
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                {error || &apos;Le lien de réinitialisation est invalide ou a expiré. Veuillez en demander un nouveau.&apos;}
              </p>
              <Link
                href="/auth/forgot-password"
                className="inline-block w-full py-3 px-4 border border-transparent rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-center transition-all"
              >
                Demander un nouveau lien
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-blue-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Logo et titre */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        </Link>
        <h1 className="text-center text-4xl font-bold text-primary-600 mb-2">
          Autisme Connect
        </h1>
        <h2 className="text-center text-3xl font-extrabold text-gray-900 mb-2">
          Nouveau mot de passe
        </h2>
        <p className="text-center text-sm text-gray-600">
          Choisissez un mot de passe sécurisé pour votre compte
        </p>
      </div>

      {/* Formulaire */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-10 px-6 shadow-xl rounded-2xl sm:px-12 border border-gray-100">
          {success ? (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Mot de passe modifié !
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Votre mot de passe a été réinitialisé avec succès. Vous allez être redirigé vers la page de connexion...
              </p>
              <div className="animate-pulse text-primary-600">
                <svg className="animate-spin h-5 w-5 mx-auto" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-r">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium">{error}</span>
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Nouveau mot de passe
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? &apos;text&apos; : &apos;password&apos;}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="appearance-none block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
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

                {/* Indicateur de force du mot de passe */}
                {password && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[...Array(6)].map((_, i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded ${
                            i < passwordStrength
                              ? passwordStrength <= 2
                                ? &apos;bg-red-500&apos;
                                : passwordStrength <= 4
                                ? &apos;bg-yellow-500&apos;
                                : &apos;bg-green-500&apos;
                              : &apos;bg-gray-200&apos;
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-gray-600">
                      Force : {passwordStrength <= 2 ? &apos;Faible&apos; : passwordStrength <= 4 ? &apos;Moyen&apos; : &apos;Fort&apos;}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? &apos;text&apos; : &apos;password&apos;}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="appearance-none block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
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
                {confirmPassword && password !== confirmPassword && (
                  <p className="mt-1 text-xs text-red-600">Les mots de passe ne correspondent pas</p>
                )}
                {confirmPassword && password === confirmPassword && (
                  <p className="mt-1 text-xs text-green-600 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Les mots de passe correspondent
                  </p>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-xs font-semibold text-blue-900 mb-2">Votre mot de passe doit contenir :</p>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li className="flex items-center">
                    <span className={password.length >= 8 ? &apos;text-green-600&apos; : &apos;text-gray-500&apos;}>
                      {password.length >= 8 ? &apos;✓&apos; : &apos;○&apos;}
                    </span>
                    <span className="ml-2">Au moins 8 caractères</span>
                  </li>
                  <li className="flex items-center">
                    <span className={/[A-Z]/.test(password) ? &apos;text-green-600&apos; : &apos;text-gray-500&apos;}>
                      {/[A-Z]/.test(password) ? &apos;✓&apos; : &apos;○&apos;}
                    </span>
                    <span className="ml-2">Une lettre majuscule</span>
                  </li>
                  <li className="flex items-center">
                    <span className={/[a-z]/.test(password) ? &apos;text-green-600&apos; : &apos;text-gray-500&apos;}>
                      {/[a-z]/.test(password) ? &apos;✓&apos; : &apos;○&apos;}
                    </span>
                    <span className="ml-2">Une lettre minuscule</span>
                  </li>
                  <li className="flex items-center">
                    <span className={/[0-9]/.test(password) ? &apos;text-green-600&apos; : &apos;text-gray-500&apos;}>
                      {/[0-9]/.test(password) ? &apos;✓&apos; : &apos;○&apos;}
                    </span>
                    <span className="ml-2">Un chiffre</span>
                  </li>
                </ul>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading || !password || !confirmPassword || password !== confirmPassword}
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Réinitialisation...
                    </div>
                  ) : (
                    <span className="flex items-center">
                      Réinitialiser le mot de passe
                      <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </span>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
