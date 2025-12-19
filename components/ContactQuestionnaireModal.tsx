'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface ChildProfile {
  id: string;
  first_name: string;
  tnd_types: string[];
  accompaniment_types: string[];
}

interface QuestionnaireData {
  child_id: string | null;
  child_name: string;
  existing_support: {
    has_support: boolean;
    types: string[];
  };
  needs: {
    accompaniment_types: string[];
    objectives: string[];
  };
  modalities: {
    location: string;
    frequency: string;
    availability: string[];
  };
  message: string;
}

interface ContactQuestionnaireModalProps {
  isOpen: boolean;
  onClose: () => void;
  educatorId: string;
  educatorName: string;
  familyId: string;
  onSubmit: (data: QuestionnaireData, childId: string | null) => Promise<void>;
}

const supportTypes = [
  // Professions éducatives
  { value: 'educateur_specialise', label: 'Éducateur spécialisé' },
  { value: 'moniteur_educateur', label: 'Moniteur éducateur' },
  // Psychologie
  { value: 'psychologue', label: 'Psychologue' },
  // Thérapies paramédicales
  { value: 'orthophoniste', label: 'Orthophoniste' },
  { value: 'psychomotricien', label: 'Psychomotricien' },
  { value: 'ergotherapeute', label: 'Ergothérapeute' },
  { value: 'kinesitherapeute', label: 'Kinésithérapeute' },
  // Autres professions
  { value: 'enseignant_apa', label: 'Enseignant APA' },
  { value: 'musicotherapeute', label: 'Musicothérapeute' },
  // Méthodes spécialisées
  { value: 'aba', label: 'ABA (Analyse Appliquée du Comportement)' },
  { value: 'pecs', label: 'PECS (Communication par échange d\'images)' },
  { value: 'teacch', label: 'TEACCH' },
  // Autre
  { value: 'autre', label: 'Autre' },
];

const accompanimentTypes = [
  { value: 'educatif', label: 'Éducatif', description: 'Apprentissages, autonomie' },
  { value: 'social', label: 'Social', description: 'Socialisation, interactions' },
  { value: 'scolaire', label: 'Scolaire', description: 'Soutien aux devoirs' },
  { value: 'vie_quotidienne', label: 'Vie quotidienne', description: 'Routines, organisation' },
];

const objectiveTypes = [
  { value: 'autonomie', label: 'Autonomie', icon: '🎯' },
  { value: 'communication', label: 'Communication', icon: '💬' },
  { value: 'gestion_emotions', label: 'Gestion des émotions', icon: '🧘' },
  { value: 'socialisation', label: 'Socialisation', icon: '👥' },
  { value: 'motricite', label: 'Motricité', icon: '🏃' },
  { value: 'sensoriel', label: 'Sensoriel', icon: '🎨' },
];

const locationOptions = [
  { value: 'domicile', label: 'À domicile', icon: '🏠' },
  { value: 'cabinet', label: 'En cabinet', icon: '🏢' },
  { value: 'ecole', label: 'À l\'école', icon: '🏫' },
  { value: 'peu_importe', label: 'Peu importe', icon: '✨' },
];

const frequencyOptions = [
  { value: '1x_semaine', label: '1 fois / semaine' },
  { value: '2x_semaine', label: '2 fois / semaine' },
  { value: 'plus', label: 'Plus fréquent' },
  { value: 'a_definir', label: 'À définir ensemble' },
];

const availabilityOptions = [
  { value: 'matin', label: 'Matin (8h-12h)' },
  { value: 'apres_midi', label: 'Après-midi (14h-17h)' },
  { value: 'soir', label: 'Soir (17h-20h)' },
  { value: 'week_end', label: 'Week-end' },
];

export default function ContactQuestionnaireModal({
  isOpen,
  onClose,
  educatorId,
  educatorName,
  familyId,
  onSubmit,
}: ContactQuestionnaireModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState<QuestionnaireData>({
    child_id: null,
    child_name: '',
    existing_support: {
      has_support: false,
      types: [],
    },
    needs: {
      accompaniment_types: [],
      objectives: [],
    },
    modalities: {
      location: '',
      frequency: '',
      availability: [],
    },
    message: '',
  });

  const totalSteps = 5;

  useEffect(() => {
    if (isOpen) {
      fetchChildren();
    }
  }, [isOpen, familyId]);

  const fetchChildren = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('child_profiles')
        .select('id, first_name, tnd_types, accompaniment_types')
        .eq('family_id', familyId)
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setChildren(data || []);
    } catch (err) {
      console.error('Erreur chargement enfants:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChildSelect = (child: ChildProfile | null) => {
    if (child) {
      setFormData({
        ...formData,
        child_id: child.id,
        child_name: child.first_name,
        needs: {
          ...formData.needs,
          accompaniment_types: child.accompaniment_types || [],
        },
      });
    } else {
      setFormData({
        ...formData,
        child_id: null,
        child_name: '',
      });
    }
  };

  const handleSupportTypeToggle = (type: string) => {
    const current = formData.existing_support.types;
    if (current.includes(type)) {
      setFormData({
        ...formData,
        existing_support: {
          ...formData.existing_support,
          types: current.filter(t => t !== type),
        },
      });
    } else {
      setFormData({
        ...formData,
        existing_support: {
          ...formData.existing_support,
          types: [...current, type],
        },
      });
    }
  };

  const handleAccompanimentToggle = (type: string) => {
    const current = formData.needs.accompaniment_types;
    if (current.includes(type)) {
      setFormData({
        ...formData,
        needs: {
          ...formData.needs,
          accompaniment_types: current.filter(t => t !== type),
        },
      });
    } else {
      setFormData({
        ...formData,
        needs: {
          ...formData.needs,
          accompaniment_types: [...current, type],
        },
      });
    }
  };

  const handleObjectiveToggle = (objective: string) => {
    const current = formData.needs.objectives;
    if (current.includes(objective)) {
      setFormData({
        ...formData,
        needs: {
          ...formData.needs,
          objectives: current.filter(o => o !== objective),
        },
      });
    } else {
      setFormData({
        ...formData,
        needs: {
          ...formData.needs,
          objectives: [...current, objective],
        },
      });
    }
  };

  const handleAvailabilityToggle = (slot: string) => {
    const current = formData.modalities.availability;
    if (current.includes(slot)) {
      setFormData({
        ...formData,
        modalities: {
          ...formData.modalities,
          availability: current.filter(s => s !== slot),
        },
      });
    } else {
      setFormData({
        ...formData,
        modalities: {
          ...formData.modalities,
          availability: [...current, slot],
        },
      });
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.child_id !== null || formData.child_name.trim() !== '';
      case 2:
        return true; // L'étape suivi existant est optionnelle
      case 3:
        return formData.needs.accompaniment_types.length > 0 || formData.needs.objectives.length > 0;
      case 4:
        return formData.modalities.location !== '' && formData.modalities.frequency !== '';
      case 5:
        return true; // Le message est optionnel
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps && canProceed()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await onSubmit(formData, formData.child_id);
      onClose();
      // Reset form
      setCurrentStep(1);
      setFormData({
        child_id: null,
        child_name: '',
        existing_support: { has_support: false, types: [] },
        needs: { accompaniment_types: [], objectives: [] },
        modalities: { location: '', frequency: '', availability: [] },
        message: '',
      });
    } catch (err) {
      console.error('Erreur envoi:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 border-b border-gray-100 flex items-center justify-between" style={{ background: 'linear-gradient(135deg, #027e7e 0%, #3a9e9e 100%)' }}>
          <div className="text-white">
            <h2 className="text-lg font-semibold">Contacter {educatorName}</h2>
            <p className="text-sm text-white/80">Étape {currentStep} sur {totalSteps}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition text-white"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progress bar */}
        <div className="px-4 sm:px-6 py-2 bg-gray-50">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((step) => (
              <div
                key={step}
                className="h-1.5 flex-1 rounded-full transition-all"
                style={{ backgroundColor: step <= currentStep ? '#027e7e' : '#e5e7eb' }}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: '#027e7e' }}></div>
            </div>
          ) : (
            <>
              {/* Étape 1: Sélection de l'accompagnement */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Pour quel accompagnement ?
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Sélectionnez l'accompagnement concerné par cette demande
                    </p>
                  </div>

                  {children.length > 0 ? (
                    <div className="space-y-2">
                      {children.map((child) => (
                        <button
                          key={child.id}
                          onClick={() => handleChildSelect(child)}
                          className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                            formData.child_id === child.id
                              ? 'border-[#027e7e] bg-[#e6f5f5]'
                              : 'border-gray-200 hover:border-[#3a9e9e] hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-full flex items-center justify-center"
                              style={{
                                backgroundColor: formData.child_id === child.id ? '#027e7e' : '#f3f4f6',
                                color: formData.child_id === child.id ? 'white' : '#4b5563'
                              }}
                            >
                              <span className="font-semibold">{child.first_name[0]}</span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{child.first_name}</p>
                              {child.tnd_types && child.tnd_types.length > 0 && (
                                <p className="text-xs text-gray-500">
                                  {child.tnd_types.slice(0, 3).map(t => t.toUpperCase()).join(', ')}
                                </p>
                              )}
                            </div>
                            {formData.child_id === child.id && (
                              <svg className="w-5 h-5 ml-auto" style={{ color: '#027e7e' }} fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-[#e6f5f5] border border-[#027e7e]/30 rounded-xl p-4 text-center">
                      <p className="text-[#027e7e] text-sm mb-3">
                        Vous n'avez pas encore créé d'accompagnement.
                      </p>
                      <p className="text-gray-600 text-sm">
                        Entrez un prénom pour continuer :
                      </p>
                      <input
                        type="text"
                        value={formData.child_name}
                        onChange={(e) => setFormData({ ...formData, child_name: e.target.value })}
                        className="mt-2 w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-[#027e7e] focus:border-[#027e7e]"
                        placeholder="Prénom de l'accompagné"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Étape 2: Accompagnement actuel */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Suivi actuel
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      {formData.child_name || 'L\'accompagné'} bénéficie-t-il déjà d'un suivi ?
                    </p>
                  </div>

                  <div className="flex gap-3 mb-4">
                    <button
                      onClick={() => setFormData({
                        ...formData,
                        existing_support: { ...formData.existing_support, has_support: true }
                      })}
                      className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                        formData.existing_support.has_support
                          ? 'border-[#027e7e] bg-[#e6f5f5]'
                          : 'border-gray-200 hover:border-[#3a9e9e]'
                      }`}
                    >
                      <span className="text-2xl mb-1 block">✅</span>
                      <span className="font-medium">Oui</span>
                    </button>
                    <button
                      onClick={() => setFormData({
                        ...formData,
                        existing_support: { has_support: false, types: [] }
                      })}
                      className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                        !formData.existing_support.has_support
                          ? 'border-[#027e7e] bg-[#e6f5f5]'
                          : 'border-gray-200 hover:border-[#3a9e9e]'
                      }`}
                    >
                      <span className="text-2xl mb-1 block">❌</span>
                      <span className="font-medium">Non</span>
                    </button>
                  </div>

                  {formData.existing_support.has_support && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-3">Types de suivi actuels :</p>
                      <div className="grid grid-cols-2 gap-2">
                        {supportTypes.map((type) => (
                          <button
                            key={type.value}
                            onClick={() => handleSupportTypeToggle(type.value)}
                            className={`p-3 rounded-lg border text-left transition-all text-sm ${
                              formData.existing_support.types.includes(type.value)
                                ? 'border-[#027e7e] bg-[#e6f5f5] text-[#027e7e]'
                                : 'border-gray-200 hover:border-gray-300 text-gray-700'
                            }`}
                          >
                            {type.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Étape 3: Besoins recherchés */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Besoins recherchés
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Quel type d'accompagnement recherchez-vous ?
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-3">Type d'accompagnement :</p>
                    <div className="grid grid-cols-2 gap-2">
                      {accompanimentTypes.map((type) => (
                        <button
                          key={type.value}
                          onClick={() => handleAccompanimentToggle(type.value)}
                          className={`p-3 rounded-xl border-2 text-left transition-all ${
                            formData.needs.accompaniment_types.includes(type.value)
                              ? 'border-[#027e7e] bg-[#e6f5f5]'
                              : 'border-gray-200 hover:border-[#3a9e9e]'
                          }`}
                        >
                          <p className="font-medium text-gray-900">{type.label}</p>
                          <p className="text-xs text-gray-500">{type.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-3">Objectifs principaux :</p>
                    <div className="grid grid-cols-2 gap-2">
                      {objectiveTypes.map((obj) => (
                        <button
                          key={obj.value}
                          onClick={() => handleObjectiveToggle(obj.value)}
                          className={`p-3 rounded-lg border text-left transition-all flex items-center gap-2 ${
                            formData.needs.objectives.includes(obj.value)
                              ? 'border-[#027e7e] bg-[#e6f5f5] text-[#027e7e]'
                              : 'border-gray-200 hover:border-gray-300 text-gray-700'
                          }`}
                        >
                          <span>{obj.icon}</span>
                          <span className="text-sm">{obj.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Étape 4: Modalités pratiques */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Modalités pratiques
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Comment souhaitez-vous organiser les séances ?
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-3">Lieu d'intervention :</p>
                    <div className="grid grid-cols-2 gap-2">
                      {locationOptions.map((loc) => (
                        <button
                          key={loc.value}
                          onClick={() => setFormData({
                            ...formData,
                            modalities: { ...formData.modalities, location: loc.value }
                          })}
                          className={`p-3 rounded-xl border-2 text-center transition-all ${
                            formData.modalities.location === loc.value
                              ? 'border-[#027e7e] bg-[#e6f5f5]'
                              : 'border-gray-200 hover:border-[#3a9e9e]'
                          }`}
                        >
                          <span className="text-2xl block mb-1">{loc.icon}</span>
                          <span className="text-sm font-medium">{loc.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-3">Fréquence souhaitée :</p>
                    <div className="space-y-2">
                      {frequencyOptions.map((freq) => (
                        <button
                          key={freq.value}
                          onClick={() => setFormData({
                            ...formData,
                            modalities: { ...formData.modalities, frequency: freq.value }
                          })}
                          className={`w-full p-3 rounded-lg border text-left transition-all ${
                            formData.modalities.frequency === freq.value
                              ? 'border-[#027e7e] bg-[#e6f5f5] text-[#027e7e]'
                              : 'border-gray-200 hover:border-gray-300 text-gray-700'
                          }`}
                        >
                          {freq.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-3">Disponibilités :</p>
                    <div className="grid grid-cols-2 gap-2">
                      {availabilityOptions.map((slot) => (
                        <button
                          key={slot.value}
                          onClick={() => handleAvailabilityToggle(slot.value)}
                          className={`p-3 rounded-lg border text-center transition-all text-sm ${
                            formData.modalities.availability.includes(slot.value)
                              ? 'border-[#027e7e] bg-[#e6f5f5] text-[#027e7e]'
                              : 'border-gray-200 hover:border-gray-300 text-gray-700'
                          }`}
                        >
                          {slot.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Étape 5: Message libre */}
              {currentStep === 5 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Message personnalisé
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Ajoutez des précisions pour {educatorName} (optionnel)
                    </p>
                  </div>

                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={5}
                    className="w-full border border-gray-300 rounded-xl py-3 px-4 focus:ring-[#027e7e] focus:border-[#027e7e]"
                    placeholder="Présentez-vous, expliquez votre situation, posez vos questions..."
                  />

                  {/* Récapitulatif */}
                  <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                    <p className="text-sm font-medium text-gray-700">Récapitulatif :</p>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>👤 Pour : <span className="font-medium">{formData.child_name || 'Non spécifié'}</span></p>
                      {formData.needs.accompaniment_types.length > 0 && (
                        <p>🎯 Accompagnement : <span className="font-medium">{formData.needs.accompaniment_types.map(t => {
                          const type = accompanimentTypes.find(at => at.value === t);
                          return type?.label || t;
                        }).join(', ')}</span></p>
                      )}
                      {formData.modalities.location && (
                        <p>📍 Lieu : <span className="font-medium">{locationOptions.find(l => l.value === formData.modalities.location)?.label}</span></p>
                      )}
                      {formData.modalities.frequency && (
                        <p>📅 Fréquence : <span className="font-medium">{frequencyOptions.find(f => f.value === formData.modalities.frequency)?.label}</span></p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer avec boutons */}
        <div className="px-4 sm:px-6 py-4 border-t border-gray-100 flex gap-3 bg-white">
          {currentStep > 1 && (
            <button
              onClick={handleBack}
              className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 font-medium transition"
            >
              Retour
            </button>
          )}
          {currentStep < totalSteps ? (
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex-1 px-4 py-3 rounded-xl font-medium transition text-white"
              style={{
                backgroundColor: canProceed() ? '#027e7e' : '#e5e7eb',
                color: canProceed() ? 'white' : '#9ca3af',
                cursor: canProceed() ? 'pointer' : 'not-allowed'
              }}
            >
              Suivant
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 px-4 py-3 text-white rounded-xl font-medium transition disabled:opacity-50"
              style={{ backgroundColor: '#027e7e' }}
            >
              {submitting ? 'Envoi...' : 'Envoyer la demande'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
