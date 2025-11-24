'use client';

import { useState, useRef, useEffect } from 'react';

interface PinCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onValidate: (pin: string) => Promise<{ success: boolean; error?: string; attemptsLeft?: number }>;
  appointmentId: string;
}

export default function PinCodeModal({ isOpen, onClose, onValidate, appointmentId }: PinCodeModalProps) {
  const [pin, setPin] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [attemptsLeft, setAttemptsLeft] = useState(3);

  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // Focus le premier input quand la modal s'ouvre
  useEffect(() => {
    if (isOpen) {
      inputRefs[0].current?.focus();
      setPin(['', '', '', '']);
      setError('');
      setAttemptsLeft(3);
    }
  }, [isOpen]);

  const handleChange = (index: number, value: string) => {
    // Accepter uniquement les chiffres
    if (value && !/^\d$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    setError('');

    // Auto-focus sur le champ suivant
    if (value && index < 3) {
      inputRefs[index + 1].current?.focus();
    }

    // Si tous les champs sont remplis, valider automatiquement
    if (newPin.every(digit => digit !== '') && index === 3) {
      handleValidate(newPin.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Retour arrière : effacer et revenir au champ précédent
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }

    // Flèche gauche/droite pour naviguer
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
    if (e.key === 'ArrowRight' && index < 3) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleValidate = async (pinCode: string) => {
    if (pinCode.length !== 4) {
      setError('Code PIN incomplet');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await onValidate(pinCode);

      if (result.success) {
        // Succès
        onClose();
      } else {
        // Erreur
        setError(result.error || 'Code incorrect');
        if (result.attemptsLeft !== undefined) {
          setAttemptsLeft(result.attemptsLeft);
        }

        // Réinitialiser le PIN
        setPin(['', '', '', '']);
        inputRefs[0].current?.focus();
      }
    } catch (err: any) {
      setError(err.message || 'Erreur de validation');
      setPin(['', '', '', '']);
      inputRefs[0].current?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();

    // Vérifier que ce sont 4 chiffres
    if (/^\d{4}$/.test(pastedData)) {
      const newPin = pastedData.split('');
      setPin(newPin);
      inputRefs[3].current?.focus();
      handleValidate(pastedData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 transform transition-all">

          {/* Icône */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-3xl">🔐</span>
            </div>
          </div>

          {/* Titre */}
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
            Entrez le code PIN
          </h2>
          <p className="text-center text-gray-600 mb-8">
            Demandez le code à 4 chiffres à la famille pour démarrer la séance
          </p>

          {/* Inputs PIN */}
          <div className="flex justify-center gap-3 mb-6" onPaste={handlePaste}>
            {pin.map((digit, index) => (
              <input
                key={index}
                ref={inputRefs[index]}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                disabled={loading}
                className={`w-16 h-16 text-center text-3xl font-bold border-2 rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all
                  ${error ? 'border-red-500 bg-red-50' : 'border-gray-300'}
                  ${loading ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              />
            ))}
          </div>

          {/* Message d'erreur */}
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center text-red-700">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium">{error}</span>
              </div>
              {attemptsLeft > 0 && (
                <p className="text-xs text-red-600 mt-1 ml-7">
                  {attemptsLeft} tentative{attemptsLeft > 1 ? 's' : ''} restante{attemptsLeft > 1 ? 's' : ''}
                </p>
              )}
            </div>
          )}

          {/* Informations */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Ce code permet de :</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Confirmer votre présence</li>
                  <li>Démarrer officiellement la séance</li>
                  <li>Déclencher le paiement en fin de séance</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Boutons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              onClick={() => handleValidate(pin.join(''))}
              disabled={loading || pin.some(d => !d)}
              className="flex-1 px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Validation...
                </span>
              ) : (
                'Valider'
              )}
            </button>
          </div>

          {/* Aide */}
          <p className="text-xs text-gray-500 text-center mt-6">
            Le code expire 2h après l'heure de début prévue
          </p>
        </div>
      </div>
    </div>
  );
}
