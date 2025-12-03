'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { signOut } from '@/lib/auth';
import Logo from '@/components/Logo';
import FamilyMobileMenu from '@/components/FamilyMobileMenu';

interface ChildProfile {
  id: string;
  first_name: string;
  age: number | null;
  birth_date: string | null;
  support_level_needed: string | null;
  description: string | null;
  accompaniment_types: string[];
  accompaniment_goals: string | null;
  schedule_preferences: string | null;
  location_preference: string | null;
  is_active: boolean;
  created_at: string;
}

const accompanimentTypeLabels: Record<string, string> = {
  scolaire: 'Soutien scolaire',
  comportemental: 'Gestion du comportement',
  socialisation: 'Socialisation',
  autonomie: 'Autonomie',
  communication: 'Communication',
  motricite: 'Motricité',
  sensoriel: 'Sensoriel',
  loisirs: 'Loisirs',
};

const supportLevelLabels: Record<string, string> = {
  level_1: 'Niveau 1',
  level_2: 'Niveau 2',
  level_3: 'Niveau 3',
};

const scheduleOptions = [
  { value: 'lundi', label: 'Lundi' },
  { value: 'mardi', label: 'Mardi' },
  { value: 'mercredi', label: 'Mercredi' },
  { value: 'jeudi', label: 'Jeudi' },
  { value: 'vendredi', label: 'Vendredi' },
  { value: 'samedi', label: 'Samedi' },
  { value: 'dimanche', label: 'Dimanche' },
  { value: 'matin', label: 'Matin (8h-12h)' },
  { value: 'journee', label: 'Journée (9h-16h)' },
  { value: 'apres-midi', label: 'Après-midi (14h-17h)' },
  { value: 'soir', label: 'Soir (17h-20h)' },
];

export default function ChildrenPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingChild, setEditingChild] = useState<ChildProfile | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    first_name: '',
    birth_date: '',
    support_level_needed: 'level_1',
    description: '',
    accompaniment_types: [] as string[],
    accompaniment_goals: '',
    schedule_preferences: [] as string[],
    location_preference: 'both',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        router.push('/auth/login');
        return;
      }

      // Récupérer le profil famille
      const { data: familyProfile } = await supabase
        .from('family_profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (!familyProfile) {
        router.push('/auth/login');
        return;
      }

      setProfile(familyProfile);

      // Récupérer les enfants
      const { data: childrenData, error: childrenError } = await supabase
        .from('child_profiles')
        .select('*')
        .eq('family_id', familyProfile.id)
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (childrenError) throw childrenError;
      setChildren(childrenData || []);
    } catch (err: any) {
      console.error('Erreur:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  const resetForm = () => {
    setFormData({
      first_name: '',
      birth_date: '',
      support_level_needed: 'level_1',
      description: '',
      accompaniment_types: [],
      accompaniment_goals: '',
      schedule_preferences: [],
      location_preference: 'both',
    });
    setEditingChild(null);
    setError('');
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (child: ChildProfile) => {
    // Parse schedule_preferences (peut être une string JSON ou un tableau)
    let schedulePrefs: string[] = [];
    if (child.schedule_preferences) {
      if (Array.isArray(child.schedule_preferences)) {
        schedulePrefs = child.schedule_preferences;
      } else if (typeof child.schedule_preferences === 'string') {
        try {
          schedulePrefs = JSON.parse(child.schedule_preferences);
        } catch {
          // Si ce n'est pas du JSON, on le garde comme string vide
          schedulePrefs = [];
        }
      }
    }

    setFormData({
      first_name: child.first_name,
      birth_date: child.birth_date || '',
      support_level_needed: child.support_level_needed || 'level_1',
      description: child.description || '',
      accompaniment_types: child.accompaniment_types || [],
      accompaniment_goals: child.accompaniment_goals || '',
      schedule_preferences: schedulePrefs,
      location_preference: child.location_preference || 'both',
    });
    setEditingChild(child);
    setShowAddModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
    resetForm();
  };

  const handleAccompanimentTypeToggle = (type: string) => {
    const current = formData.accompaniment_types;
    if (current.includes(type)) {
      setFormData({ ...formData, accompaniment_types: current.filter(t => t !== type) });
    } else {
      setFormData({ ...formData, accompaniment_types: [...current, type] });
    }
  };

  const handleScheduleToggle = (value: string) => {
    const current = formData.schedule_preferences;
    if (current.includes(value)) {
      setFormData({ ...formData, schedule_preferences: current.filter(v => v !== value) });
    } else {
      setFormData({ ...formData, schedule_preferences: [...current, value] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.first_name.trim()) {
      setError('Le prénom est obligatoire');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const childData = {
        family_id: profile.id,
        first_name: formData.first_name.trim(),
        birth_date: formData.birth_date || null,
        support_level_needed: formData.support_level_needed,
        description: formData.description || null,
        accompaniment_types: formData.accompaniment_types,
        accompaniment_goals: formData.accompaniment_goals || null,
        schedule_preferences: formData.schedule_preferences.length > 0 ? JSON.stringify(formData.schedule_preferences) : null,
        location_preference: formData.location_preference,
      };

      if (editingChild) {
        // Mise à jour
        const { error: updateError } = await supabase
          .from('child_profiles')
          .update(childData)
          .eq('id', editingChild.id);

        if (updateError) throw updateError;
      } else {
        // Création
        const { error: insertError } = await supabase
          .from('child_profiles')
          .insert(childData);

        if (insertError) throw insertError;
      }

      await fetchData();
      closeModal();
    } catch (err: any) {
      console.error('Erreur:', err);
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (childId: string) => {
    if (!confirm('Voulez-vous vraiment supprimer ce profil enfant ?')) return;

    try {
      const { error: deleteError } = await supabase
        .from('child_profiles')
        .update({ is_active: false })
        .eq('id', childId);

      if (deleteError) throw deleteError;
      await fetchData();
    } catch (err: any) {
      console.error('Erreur:', err);
      setError(err.message);
    }
  };

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
              <div className="md:hidden">
                <FamilyMobileMenu profile={profile} onLogout={handleLogout} />
              </div>
              <div className="hidden md:block">
                <Logo />
              </div>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <Link
                href="/dashboard/family"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 px-6 py-2.5 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
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
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mes enfants</h1>
            <p className="text-gray-600 mt-1">Gérez les profils de vos enfants pour personnaliser l'accompagnement</p>
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Ajouter un enfant
          </button>
        </div>

        {/* Liste des enfants */}
        {children.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun profil enfant</h3>
            <p className="text-gray-500 mb-6">Créez un profil pour chaque enfant afin de personnaliser leur accompagnement.</p>
            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Ajouter mon premier enfant
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {children.map((child) => (
              <div key={child.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-semibold text-primary-600">
                        {child.first_name[0].toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{child.first_name}</h3>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        {child.birth_date && (
                          <span className="text-sm text-gray-500">
                            Né(e) le {new Date(child.birth_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </span>
                        )}
                        {!child.birth_date && child.age && (
                          <span className="text-sm text-gray-500">{child.age} ans</span>
                        )}
                        {child.location_preference && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                            {child.location_preference === 'domicile' ? 'Domicile' :
                             child.location_preference === 'exterieur' ? 'Extérieur' : 'Domicile/Extérieur'}
                          </span>
                        )}
                      </div>

                      {child.accompaniment_types && child.accompaniment_types.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {child.accompaniment_types.map((type) => (
                            <span key={type} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-50 text-primary-700">
                              {accompanimentTypeLabels[type] || type}
                            </span>
                          ))}
                        </div>
                      )}

                      {child.description && (
                        <p className="text-sm text-gray-600 mt-3 line-clamp-2">{child.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(child)}
                      className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition"
                      title="Modifier les infos de base"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(child.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Supprimer"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Bouton dossier - bien visible */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <Link
                    href={`/dashboard/family/children/${child.id}/dossier`}
                    className="flex items-center justify-between w-full p-3 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 border border-green-300 rounded-xl transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center group-hover:bg-green-600 transition">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                        </svg>
                      </div>
                      <div>
                        <span className="font-semibold text-green-800 block">Dossier</span>
                        <span className="text-xs text-green-600">Profil, compétences, objectifs, préférences, PPA...</span>
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-green-600 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Ajout/Edition */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingChild ? 'Modifier le profil' : 'Ajouter un enfant'}
              </h2>
              <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-lg transition">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Prénom et date de naissance */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Prénom *</label>
                  <input
                    type="text"
                    required
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Prénom de l'enfant"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date de naissance</label>
                  <input
                    type="date"
                    value={formData.birth_date}
                    onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Personnalité, centres d'intérêt, forces..."
                />
              </div>

              {/* Types d'accompagnement */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Types d'accompagnement recherchés</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(accompanimentTypeLabels).map(([value, label]) => (
                    <label
                      key={value}
                      className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
                        formData.accompaniment_types.includes(value)
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.accompaniment_types.includes(value)}
                        onChange={() => handleAccompanimentTypeToggle(value)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Objectifs */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Objectifs d'accompagnement</label>
                <textarea
                  rows={2}
                  value={formData.accompaniment_goals}
                  onChange={(e) => setFormData({ ...formData, accompaniment_goals: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Quels sont vos objectifs pour cet enfant ?"
                />
              </div>

              {/* Préférences horaires */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Préférences horaires</label>
                <div className="space-y-3">
                  {/* Jours */}
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Jours préférés</p>
                    <div className="flex flex-wrap gap-2">
                      {scheduleOptions.slice(0, 7).map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => handleScheduleToggle(option.value)}
                          className={`px-3 py-1.5 text-sm rounded-full border transition-all ${
                            formData.schedule_preferences.includes(option.value)
                              ? 'bg-primary-600 text-white border-primary-600'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-primary-400'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Créneaux */}
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Créneaux préférés</p>
                    <div className="flex flex-wrap gap-2">
                      {scheduleOptions.slice(7).map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => handleScheduleToggle(option.value)}
                          className={`px-3 py-1.5 text-sm rounded-full border transition-all ${
                            formData.schedule_preferences.includes(option.value)
                              ? 'bg-primary-600 text-white border-primary-600'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-primary-400'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Préférence de lieu */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Préférence de lieu</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'domicile', label: 'Domicile', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
                    { value: 'exterieur', label: 'Extérieur', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z' },
                    { value: 'both', label: 'Les deux', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
                  ].map((option) => (
                    <label
                      key={option.value}
                      className={`flex flex-col items-center p-3 border rounded-lg cursor-pointer transition-all ${
                        formData.location_preference === option.value
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="location_preference"
                        value={option.value}
                        checked={formData.location_preference === option.value}
                        onChange={(e) => setFormData({ ...formData, location_preference: e.target.value })}
                        className="sr-only"
                      />
                      <svg className="w-6 h-6 text-gray-600 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={option.icon} />
                      </svg>
                      <span className="text-sm font-medium text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Boutons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition"
                >
                  {saving ? 'Enregistrement...' : (editingChild ? 'Enregistrer' : 'Ajouter')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
