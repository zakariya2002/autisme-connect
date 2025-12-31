'use client';

import { useState } from 'react';
import Link from 'next/link';
import PublicNavbar from '@/components/PublicNavbar';

// Types
interface SimulatorData {
  // Étape 1 : Profil
  beneficiaire: 'enfant' | 'adulte' | '';
  age: string;

  // Étape 2 : Situation MDPH
  hasMdph: 'oui' | 'non' | 'en_cours' | '';
  tauxIncapacite: '80_plus' | '50_79' | 'moins_50' | 'inconnu' | '';
  hasRestrictionEmploi: 'oui' | 'non' | '';

  // Étape 3 : Accompagnement
  typeAccompagnement: string[];
  frequenceHebdo: string;
  coutMensuelEstime: string;

  // Étape 4 : Situation financière
  revenusFoyer: string;
  situationFamiliale: 'seul' | 'couple' | '';
  nombreEnfants: string;

  // Étape 5 : Éducateur SAP
  educateurSap: 'oui' | 'non' | 'ne_sait_pas' | '';
}

interface AideResult {
  nom: string;
  eligible: boolean;
  montantMin?: number;
  montantMax?: number;
  montantExact?: number;
  description: string;
  conditions: string[];
  lienFormulaire: string;
  lienTexte: string;
  important?: string;
  couleur: string;
  icone: string;
}

const initialData: SimulatorData = {
  beneficiaire: '',
  age: '',
  hasMdph: '',
  tauxIncapacite: '',
  hasRestrictionEmploi: '',
  typeAccompagnement: [],
  frequenceHebdo: '',
  coutMensuelEstime: '',
  revenusFoyer: '',
  situationFamiliale: '',
  nombreEnfants: '',
  educateurSap: '',
};

// Barèmes 2025
const BAREME = {
  AEEH_BASE: 142.70,
  AEEH_COMPLEMENTS: [
    { niveau: 1, montant: 107.15 },
    { niveau: 2, montant: 289.78 },
    { niveau: 3, montant: 410.21 },
    { niveau: 4, montant: 635.71 },
    { niveau: 5, montant: 812.53 },
    { niveau: 6, montant: 1156.29 },
  ],
  AAH_MAX: 1016.05,
  AAH_PLAFOND_SEUL: 12193,
  AAH_PLAFOND_COUPLE: 22072,
  AAH_MAJORATION_ENFANT: 6096,
  CREDIT_IMPOT_TAUX: 0.5,
  CREDIT_IMPOT_PLAFOND_BASE: 12000,
  CREDIT_IMPOT_MAJORATION_ENFANT: 1500,
  PCH_AIDE_HUMAINE_TAUX: 17.77, // €/heure
};

export default function SimulateurAidesPage() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<SimulatorData>(initialData);
  const [results, setResults] = useState<AideResult[] | null>(null);
  const [showResults, setShowResults] = useState(false);

  const totalSteps = 5;

  const updateData = (field: keyof SimulatorData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const toggleAccompagnement = (type: string) => {
    setData(prev => ({
      ...prev,
      typeAccompagnement: prev.typeAccompagnement.includes(type)
        ? prev.typeAccompagnement.filter(t => t !== type)
        : [...prev.typeAccompagnement, type]
    }));
  };

  const canProceed = (): boolean => {
    switch (step) {
      case 1:
        return data.beneficiaire !== '' && data.age !== '';
      case 2:
        return data.hasMdph !== '';
      case 3:
        return data.typeAccompagnement.length > 0;
      case 4:
        return true; // Optionnel
      case 5:
        return data.educateurSap !== '';
      default:
        return true;
    }
  };

  const calculateAides = (): AideResult[] => {
    const aides: AideResult[] = [];
    const isEnfant = data.beneficiaire === 'enfant';
    const age = parseInt(data.age) || 0;
    const coutMensuel = parseFloat(data.coutMensuelEstime) || 0;
    const revenus = parseFloat(data.revenusFoyer) || 0;
    const nbEnfants = parseInt(data.nombreEnfants) || 0;

    // AEEH (enfants < 20 ans)
    if (isEnfant && age < 20) {
      const eligible = data.tauxIncapacite === '80_plus' ||
                       data.tauxIncapacite === '50_79' ||
                       data.hasMdph === 'en_cours';

      let complementEstime = 0;
      if (coutMensuel > 800) complementEstime = 5;
      else if (coutMensuel > 500) complementEstime = 4;
      else if (coutMensuel > 300) complementEstime = 3;
      else if (coutMensuel > 150) complementEstime = 2;
      else if (coutMensuel > 0) complementEstime = 1;

      const montantComplement = complementEstime > 0
        ? BAREME.AEEH_COMPLEMENTS[complementEstime - 1].montant
        : 0;

      aides.push({
        nom: 'AEEH - Allocation Éducation Enfant Handicapé',
        eligible: eligible || data.hasMdph === 'en_cours',
        montantMin: BAREME.AEEH_BASE,
        montantMax: BAREME.AEEH_BASE + BAREME.AEEH_COMPLEMENTS[5].montant,
        montantExact: eligible ? BAREME.AEEH_BASE + montantComplement : undefined,
        description: 'Allocation mensuelle pour compenser les frais liés au handicap de votre enfant. Finance TOUS les professionnels.',
        conditions: [
          'Enfant de moins de 20 ans',
          'Taux d\'incapacité ≥ 50% reconnu par la MDPH',
          'Pas de condition de ressources',
        ],
        lienFormulaire: 'https://www.mdphenligne.cnsa.fr/',
        lienTexte: 'Faire ma demande MDPH',
        important: data.hasMdph === 'en_cours'
          ? 'Votre dossier est en cours, vous pourriez être éligible !'
          : undefined,
        couleur: 'purple',
        icone: '👶',
      });
    }

    // AAH (adultes ou transition)
    if (!isEnfant || age >= 16) {
      const plafondRevenus = data.situationFamiliale === 'couple'
        ? BAREME.AAH_PLAFOND_COUPLE + (nbEnfants * BAREME.AAH_MAJORATION_ENFANT)
        : BAREME.AAH_PLAFOND_SEUL + (nbEnfants * BAREME.AAH_MAJORATION_ENFANT);

      const eligible = (data.tauxIncapacite === '80_plus' ||
                       (data.tauxIncapacite === '50_79' && data.hasRestrictionEmploi === 'oui')) &&
                       (revenus === 0 || revenus < plafondRevenus);

      let montantEstime = BAREME.AAH_MAX;
      if (revenus > 0 && revenus < plafondRevenus) {
        montantEstime = Math.max(0, BAREME.AAH_MAX - (revenus * 0.1));
      }

      aides.push({
        nom: 'AAH - Allocation Adulte Handicapé',
        eligible,
        montantMax: BAREME.AAH_MAX,
        montantExact: eligible ? Math.round(montantEstime * 100) / 100 : undefined,
        description: 'Revenu minimum garanti pour les adultes en situation de handicap.',
        conditions: [
          'Taux d\'incapacité ≥ 80% OU 50-79% avec restriction d\'emploi',
          `Revenus < ${plafondRevenus.toLocaleString()}€/an`,
          'Résider en France',
        ],
        lienFormulaire: 'https://www.mdphenligne.cnsa.fr/',
        lienTexte: 'Faire ma demande MDPH',
        important: 'L\'AAH est un revenu, pas une aide pour financer des séances.',
        couleur: 'blue',
        icone: '🧑',
      });
    }

    // Crédit d'impôt SAP
    if (data.educateurSap === 'oui' || data.educateurSap === 'ne_sait_pas') {
      const plafondDepenses = BAREME.CREDIT_IMPOT_PLAFOND_BASE + (nbEnfants * BAREME.CREDIT_IMPOT_MAJORATION_ENFANT);
      const depensesAnnuelles = coutMensuel * 12;
      const depensesEligibles = Math.min(depensesAnnuelles, plafondDepenses);
      const creditEstime = depensesEligibles * BAREME.CREDIT_IMPOT_TAUX;

      aides.push({
        nom: 'Crédit d\'impôt 50% - Services à la Personne',
        eligible: data.educateurSap === 'oui',
        montantExact: data.educateurSap === 'oui' ? Math.round(creditEstime) : undefined,
        montantMax: plafondDepenses * BAREME.CREDIT_IMPOT_TAUX,
        description: 'Récupérez 50% des sommes versées à un éducateur agréé SAP.',
        conditions: [
          'Éducateur avec agrément Services à la Personne',
          'Interventions à domicile',
          'Paiement par CESU ou virement avec attestation fiscale',
        ],
        lienFormulaire: 'https://www.impots.gouv.fr/',
        lienTexte: 'impots.gouv.fr',
        important: data.educateurSap === 'ne_sait_pas'
          ? 'Vérifiez si votre éducateur a l\'agrément SAP - demandez-lui !'
          : `Sur ${depensesAnnuelles.toLocaleString()}€/an de dépenses, vous récupérez ${creditEstime.toLocaleString()}€`,
        couleur: 'green',
        icone: '💰',
      });
    }

    // PCH
    if (data.hasMdph === 'oui' || data.hasMdph === 'en_cours') {
      const heuresEstimees = parseFloat(data.frequenceHebdo) || 0;
      const montantMensuelPch = heuresEstimees * 4 * BAREME.PCH_AIDE_HUMAINE_TAUX;

      const hasLiberal = data.typeAccompagnement.some(t =>
        ['psychologue', 'ergotherapeute', 'psychomotricien', 'orthophoniste'].includes(t)
      );

      aides.push({
        nom: 'PCH - Prestation de Compensation du Handicap',
        eligible: data.tauxIncapacite === '80_plus' || data.tauxIncapacite === '50_79',
        montantExact: heuresEstimees > 0 ? Math.round(montantMensuelPch) : undefined,
        description: 'Aide pour financer les aides humaines et techniques liées au handicap.',
        conditions: [
          'Reconnaissance MDPH',
          'Évaluation des besoins par l\'équipe pluridisciplinaire',
          'Sur justificatifs de dépenses',
        ],
        lienFormulaire: 'https://www.mdphenligne.cnsa.fr/',
        lienTexte: 'Contacter ma MDPH',
        important: hasLiberal
          ? '⚠️ ATTENTION : La PCH ne finance PAS les professionnels libéraux (psy, ergo...). Privilégiez l\'AEEH pour les enfants.'
          : undefined,
        couleur: 'orange',
        icone: '🏠',
      });
    }

    return aides;
  };

  const handleSubmit = () => {
    const aides = calculateAides();
    setResults(aides);
    setShowResults(true);
  };

  const resetSimulator = () => {
    setData(initialData);
    setStep(1);
    setResults(null);
    setShowResults(false);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-5">
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Pour qui cherchez-vous des aides ?</h3>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <button
                  onClick={() => updateData('beneficiaire', 'enfant')}
                  className={`p-4 sm:p-6 rounded-xl border-2 transition-all ${
                    data.beneficiaire === 'enfant'
                      ? 'border-gray-200'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  style={data.beneficiaire === 'enfant' ? { borderColor: '#027e7e', backgroundColor: '#e6f4f4' } : {}}
                >
                  <span className="text-3xl sm:text-4xl mb-2 sm:mb-3 block">👶</span>
                  <span className="font-medium text-gray-900 text-sm sm:text-base">Un enfant</span>
                  <span className="text-xs sm:text-sm text-gray-500 block mt-1">Moins de 20 ans</span>
                </button>
                <button
                  onClick={() => updateData('beneficiaire', 'adulte')}
                  className={`p-4 sm:p-6 rounded-xl border-2 transition-all ${
                    data.beneficiaire === 'adulte'
                      ? 'border-gray-200'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  style={data.beneficiaire === 'adulte' ? { borderColor: '#027e7e', backgroundColor: '#e6f4f4' } : {}}
                >
                  <span className="text-3xl sm:text-4xl mb-2 sm:mb-3 block">🧑</span>
                  <span className="font-medium text-gray-900 text-sm sm:text-base">Un adulte</span>
                  <span className="text-xs sm:text-sm text-gray-500 block mt-1">20 ans et plus</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Âge du bénéficiaire
              </label>
              <input
                type="number"
                min="0"
                max="99"
                value={data.age}
                onChange={(e) => updateData('age', e.target.value)}
                className="w-full border border-gray-300 rounded-xl py-3 px-4 text-sm sm:text-base focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': '#027e7e' } as any}
                placeholder="Ex: 8"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-5">
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Avez-vous un dossier MDPH ?</h3>
              <div className="space-y-3">
                {[
                  { value: 'oui', label: 'Oui, j\'ai une reconnaissance MDPH', icon: '✅' },
                  { value: 'en_cours', label: 'Dossier en cours de traitement', icon: '⏳' },
                  { value: 'non', label: 'Non, pas encore de dossier', icon: '❌' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => updateData('hasMdph', option.value)}
                    className="w-full p-3 sm:p-4 rounded-xl border-2 text-left flex items-center gap-3 transition-all border-gray-200 hover:border-gray-300"
                    style={data.hasMdph === option.value ? { borderColor: '#027e7e', backgroundColor: '#e6f4f4' } : {}}
                  >
                    <span className="text-xl sm:text-2xl">{option.icon}</span>
                    <span className="font-medium text-gray-900 text-sm sm:text-base">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {(data.hasMdph === 'oui' || data.hasMdph === 'en_cours') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Taux d'incapacité reconnu (ou attendu)
                </label>
                <div className="space-y-2">
                  {[
                    { value: '80_plus', label: '80% ou plus' },
                    { value: '50_79', label: 'Entre 50% et 79%' },
                    { value: 'moins_50', label: 'Moins de 50%' },
                    { value: 'inconnu', label: 'Je ne sais pas' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => updateData('tauxIncapacite', option.value)}
                      className="w-full p-3 rounded-xl border-2 text-left transition-all border-gray-200 hover:border-gray-300 text-sm sm:text-base"
                      style={data.tauxIncapacite === option.value ? { borderColor: '#027e7e', backgroundColor: '#e6f4f4' } : {}}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {data.beneficiaire === 'adulte' && data.tauxIncapacite === '50_79' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Avez-vous une restriction substantielle d'accès à l'emploi ?
                </label>
                <div className="rounded-xl p-3 mb-3 text-sm text-gray-600" style={{ backgroundColor: '#e6f4f4', border: '1px solid #c9eaea' }}>
                  <div className="flex items-start gap-2">
                    <span style={{ color: '#027e7e' }}>ℹ️</span>
                    <p>
                      <strong>Restriction substantielle d'accès à l'emploi :</strong> cela signifie que votre handicap
                      rend très difficile la recherche ou le maintien d'un emploi, même avec des aménagements.
                      La MDPH évalue cela selon l'impact de votre TND sur votre vie professionnelle.
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => updateData('hasRestrictionEmploi', 'oui')}
                    className="p-3 rounded-xl border-2 transition-all border-gray-200 hover:border-gray-300 text-sm sm:text-base"
                    style={data.hasRestrictionEmploi === 'oui' ? { borderColor: '#027e7e', backgroundColor: '#e6f4f4' } : {}}
                  >
                    Oui
                  </button>
                  <button
                    onClick={() => updateData('hasRestrictionEmploi', 'non')}
                    className="p-3 rounded-xl border-2 transition-all border-gray-200 hover:border-gray-300 text-sm sm:text-base"
                    style={data.hasRestrictionEmploi === 'non' ? { borderColor: '#027e7e', backgroundColor: '#e6f4f4' } : {}}
                  >
                    Non
                  </button>
                </div>
              </div>
            )}

            {data.hasMdph === 'non' && (
              <div className="rounded-xl p-4" style={{ backgroundColor: '#e6f4f4', border: '1px solid #c9eaea' }}>
                <p className="text-sm" style={{ color: '#027e7e' }}>
                  <strong>Conseil :</strong> Pour bénéficier de la plupart des aides (AEEH, AAH, PCH),
                  vous devez d'abord constituer un dossier MDPH. C'est gratuit et c'est la première étape !
                </p>
                <a
                  href="https://www.mdphenligne.cnsa.fr/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-3 font-medium hover:underline text-sm"
                  style={{ color: '#027e7e' }}
                >
                  Commencer mon dossier MDPH
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-5">
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                Quel type d'accompagnement recherchez-vous ?
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 mb-4">Sélectionnez tous ceux qui s'appliquent</p>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                {[
                  { value: 'educateur', label: 'Éducateur spécialisé', icon: '👨‍🏫' },
                  { value: 'psychologue', label: 'Psychologue', icon: '🧠' },
                  { value: 'psychomotricien', label: 'Psychomotricien', icon: '🤸' },
                  { value: 'ergotherapeute', label: 'Ergothérapeute', icon: '🎯' },
                  { value: 'orthophoniste', label: 'Orthophoniste', icon: '🗣️' },
                  { value: 'autre', label: 'Autre', icon: '✨' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => toggleAccompagnement(option.value)}
                    className="p-3 sm:p-4 rounded-xl border-2 text-left transition-all border-gray-200 hover:border-gray-300"
                    style={data.typeAccompagnement.includes(option.value) ? { borderColor: '#027e7e', backgroundColor: '#e6f4f4' } : {}}
                  >
                    <span className="text-xl sm:text-2xl block mb-1">{option.icon}</span>
                    <span className="text-xs sm:text-sm font-medium text-gray-900">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Heures d'accompagnement par semaine (estimation)
              </label>
              <input
                type="number"
                min="0"
                max="40"
                value={data.frequenceHebdo}
                onChange={(e) => updateData('frequenceHebdo', e.target.value)}
                className="w-full border border-gray-300 rounded-xl py-3 px-4 text-sm sm:text-base focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': '#027e7e' } as any}
                placeholder="Ex: 4"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Coût mensuel estimé des accompagnements (en euros)
              </label>
              <input
                type="number"
                min="0"
                value={data.coutMensuelEstime}
                onChange={(e) => updateData('coutMensuelEstime', e.target.value)}
                className="w-full border border-gray-300 rounded-xl py-3 px-4 text-sm sm:text-base focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': '#027e7e' } as any}
                placeholder="Ex: 400"
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-5">
            <div className="rounded-xl p-4 mb-2" style={{ backgroundColor: '#e6f4f4', border: '1px solid #c9eaea' }}>
              <p className="text-sm text-gray-600">
                <strong>Optionnel :</strong> Ces informations permettent d'affiner le calcul de l'AAH.
                Vous pouvez passer cette étape.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Revenus annuels du foyer (approximatif)
              </label>
              <input
                type="number"
                min="0"
                value={data.revenusFoyer}
                onChange={(e) => updateData('revenusFoyer', e.target.value)}
                className="w-full border border-gray-300 rounded-xl py-3 px-4 text-sm sm:text-base focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': '#027e7e' } as any}
                placeholder="Ex: 25000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Situation familiale
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => updateData('situationFamiliale', 'seul')}
                  className="p-3 rounded-xl border-2 transition-all border-gray-200 hover:border-gray-300 text-sm sm:text-base"
                  style={data.situationFamiliale === 'seul' ? { borderColor: '#027e7e', backgroundColor: '#e6f4f4' } : {}}
                >
                  Seul(e)
                </button>
                <button
                  onClick={() => updateData('situationFamiliale', 'couple')}
                  className="p-3 rounded-xl border-2 transition-all border-gray-200 hover:border-gray-300 text-sm sm:text-base"
                  style={data.situationFamiliale === 'couple' ? { borderColor: '#027e7e', backgroundColor: '#e6f4f4' } : {}}
                >
                  En couple
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre d'enfants à charge
              </label>
              <input
                type="number"
                min="0"
                max="10"
                value={data.nombreEnfants}
                onChange={(e) => updateData('nombreEnfants', e.target.value)}
                className="w-full border border-gray-300 rounded-xl py-3 px-4 text-sm sm:text-base focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': '#027e7e' } as any}
                placeholder="Ex: 2"
              />
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-5">
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                Votre éducateur a-t-il l'agrément Services à la Personne (SAP) ?
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 mb-4">
                L'agrément SAP permet de bénéficier du crédit d'impôt de 50%
              </p>
              <div className="space-y-3">
                {[
                  { value: 'oui', label: 'Oui, il a l\'agrément SAP', icon: '✅' },
                  { value: 'non', label: 'Non, pas d\'agrément SAP', icon: '❌' },
                  { value: 'ne_sait_pas', label: 'Je ne sais pas', icon: '❓' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => updateData('educateurSap', option.value)}
                    className="w-full p-3 sm:p-4 rounded-xl border-2 text-left flex items-center gap-3 transition-all border-gray-200 hover:border-gray-300"
                    style={data.educateurSap === option.value ? { borderColor: '#027e7e', backgroundColor: '#e6f4f4' } : {}}
                  >
                    <span className="text-xl sm:text-2xl">{option.icon}</span>
                    <span className="font-medium text-gray-900 text-sm sm:text-base">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {data.educateurSap === 'ne_sait_pas' && (
              <div className="rounded-xl p-4" style={{ backgroundColor: '#fff7e6', border: '1px solid #ffd699' }}>
                <p className="text-sm" style={{ color: '#b36b00' }}>
                  <strong>Astuce :</strong> Demandez à votre éducateur s'il dispose de l'agrément SAP.
                  Sur neurocare, les éducateurs agréés SAP affichent le badge "Éligible crédit d'impôt 50%".
                </p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const renderResults = () => {
    if (!results) return null;

    const eligibleAides = results.filter(a => a.eligible);
    const nonEligibleAides = results.filter(a => !a.eligible);

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Vos résultats personnalisés</h2>
          <p className="text-sm text-gray-500">
            Basé sur vos réponses, voici les aides auxquelles vous pourriez avoir droit
          </p>
        </div>

        {/* Résumé */}
        <div className="rounded-xl p-4 sm:p-5 text-white" style={{ background: 'linear-gradient(135deg, #027e7e 0%, #3a9e9e 100%)' }}>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-2xl sm:text-3xl">💰</span>
            </div>
            <div>
              <p className="text-white/80 text-xs sm:text-sm">Aides potentielles identifiées</p>
              <p className="text-2xl sm:text-3xl font-bold">{eligibleAides.length} aide{eligibleAides.length > 1 ? 's' : ''}</p>
            </div>
          </div>
        </div>

        {/* Aides éligibles */}
        {eligibleAides.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
              <span className="text-green-500">✅</span> Vous êtes potentiellement éligible
            </h3>
            {eligibleAides.map((aide, index) => (
              <div key={index} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-gray-100" style={{ backgroundColor: '#e6f4f4' }}>
                  <div className="flex items-start sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                      <span className="text-xl sm:text-2xl flex-shrink-0">{aide.icone}</span>
                      <h4 className="font-bold text-gray-900 text-sm sm:text-base">{aide.nom}</h4>
                    </div>
                    {aide.montantExact && (
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs text-gray-500">Estimation</p>
                        <p className="text-base sm:text-lg font-bold" style={{ color: '#027e7e' }}>{aide.montantExact.toLocaleString()}€/mois</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="p-4 sm:p-5 space-y-3 sm:space-y-4">
                  <p className="text-gray-600 text-sm">{aide.description}</p>

                  {aide.important && (
                    <div className="rounded-lg p-3" style={{ backgroundColor: '#e6f4f4', border: '1px solid #c9eaea' }}>
                      <p className="text-sm font-medium text-gray-800">{aide.important}</p>
                    </div>
                  )}

                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Conditions :</p>
                    <ul className="space-y-1">
                      {aide.conditions.map((condition, i) => (
                        <li key={i} className="text-xs sm:text-sm text-gray-600 flex items-start gap-2">
                          <span style={{ color: '#027e7e' }} className="mt-0.5">•</span>
                          {condition}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <a
                    href={aide.lienFormulaire}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 text-white rounded-xl hover:opacity-90 transition text-sm font-medium"
                    style={{ backgroundColor: '#027e7e' }}
                  >
                    {aide.lienTexte}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Aides non éligibles */}
        {nonEligibleAides.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
              <span className="text-gray-400">ℹ️</span> Autres aides (non éligible actuellement)
            </h3>
            {nonEligibleAides.map((aide, index) => (
              <div key={index} className="bg-gray-50 rounded-xl border border-gray-200 p-3 sm:p-4">
                <div className="flex items-start gap-3">
                  <span className="text-lg sm:text-xl opacity-50 flex-shrink-0">{aide.icone}</span>
                  <div className="min-w-0">
                    <h4 className="font-medium text-gray-700 text-sm sm:text-base">{aide.nom}</h4>
                    <p className="text-xs sm:text-sm text-gray-500">{aide.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Avertissement */}
        <div className="rounded-xl p-4" style={{ backgroundColor: '#fff7e6', border: '1px solid #ffd699' }}>
          <p className="text-sm" style={{ color: '#b36b00' }}>
            <strong>⚠️ Information importante :</strong> Ces résultats sont des estimations basées sur vos déclarations.
            Les montants réels dépendent de l'évaluation officielle par les organismes compétents (MDPH, CAF, etc.).
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={resetSimulator}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium text-sm"
          >
            Recommencer la simulation
          </button>
          <Link
            href="/familles/aides-financieres"
            className="flex-1 px-4 py-3 text-white rounded-xl hover:opacity-90 transition font-medium text-center text-sm"
            style={{ backgroundColor: '#f0879f' }}
          >
            Voir le détail des aides
          </Link>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col" style={{ backgroundColor: '#fdf9f4' }}>
      {/* Navigation */}
      <PublicNavbar />

      <div className="flex-1 max-w-2xl mx-auto px-4 pt-20 xl:pt-24 pb-6 sm:pb-8 w-full">
        {/* Header avec icône */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center p-1" style={{ backgroundColor: '#027e7e' }}>
            <img src="/images/icons/7.svg" alt="" className="w-full h-full" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
            Simulateur d'aides financières
          </h1>
          <p className="text-sm text-gray-500">
            Répondez à quelques questions pour découvrir les aides auxquelles vous avez droit
          </p>
        </div>

        {!showResults ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
            {/* Progress bar */}
            <div className="mb-6 sm:mb-8">
              <div className="flex justify-between text-sm text-gray-500 mb-2">
                <span>Étape {step} sur {totalSteps}</span>
                <span>{Math.round((step / totalSteps) * 100)}%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full transition-all duration-300"
                  style={{ width: `${(step / totalSteps) * 100}%`, background: 'linear-gradient(to right, #027e7e, #3a9e9e)' }}
                />
              </div>
            </div>

            {/* Step content */}
            {renderStep()}

            {/* Navigation */}
            <div className="flex justify-between mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-100">
              <button
                onClick={() => setStep(s => s - 1)}
                disabled={step === 1}
                className="px-4 sm:px-6 py-2.5 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm sm:text-base"
              >
                Précédent
              </button>

              {step < totalSteps ? (
                <button
                  onClick={() => setStep(s => s + 1)}
                  disabled={!canProceed()}
                  className="px-4 sm:px-6 py-2.5 text-white rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm sm:text-base font-medium"
                  style={{ backgroundColor: '#027e7e' }}
                >
                  Suivant
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={!canProceed()}
                  className="px-4 sm:px-6 py-2.5 text-white rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2 text-sm sm:text-base font-medium"
                  style={{ backgroundColor: '#f0879f' }}
                >
                  <span>Voir mes résultats</span>
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
            {renderResults()}
          </div>
        )}
      </div>

      {/* Footer teal */}
      <div className="mt-auto" style={{ backgroundColor: '#027e7e', height: '40px' }}></div>
    </div>
  );
}
