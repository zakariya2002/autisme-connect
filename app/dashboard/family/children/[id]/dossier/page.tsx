'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { signOut } from '@/lib/auth';
import Logo from '@/components/Logo';
import FamilyMobileMenu from '@/components/FamilyMobileMenu';

// Types
interface ChildProfile {
  id: string;
  first_name: string;
  age: number | null;
  description: string | null;
  accompaniment_types: string[];
  accompaniment_goals: string | null;
}

interface Goal {
  id: string;
  title: string;
  description: string | null;
  category: string;
  status: string;
  progress: number;
  target_date: string | null;
  created_at: string;
}

interface SessionNote {
  id: string;
  session_date: string;
  title: string | null;
  activities: string | null;
  observations: string | null;
  positive_points: string | null;
  engagement_level: string | null;
  created_at: string;
}

interface Skill {
  id: string;
  name: string;
  category: string;
  mastery_level: string;
  notes: string | null;
}

interface Preference {
  id: string;
  type: string;
  name: string;
  description: string | null;
  effectiveness: string | null;
}

type TabType = 'overview' | 'goals' | 'sessions' | 'skills' | 'preferences';

const categoryLabels: Record<string, string> = {
  communication: 'Communication',
  autonomie: 'Autonomie',
  socialisation: 'Socialisation',
  comportement: 'Comportement',
  motricite: 'Motricité',
  scolaire: 'Scolaire',
  sensoriel: 'Sensoriel',
  jeu: 'Jeu',
  loisirs: 'Loisirs',
  autre: 'Autre',
};

const statusLabels: Record<string, { label: string; color: string }> = {
  en_cours: { label: 'En cours', color: 'bg-blue-100 text-blue-700' },
  atteint: { label: 'Atteint', color: 'bg-green-100 text-green-700' },
  pause: { label: 'En pause', color: 'bg-yellow-100 text-yellow-700' },
  abandonne: { label: 'Abandonné', color: 'bg-gray-100 text-gray-700' },
};

const masteryLabels: Record<string, { label: string; color: string; level: number }> = {
  non_acquis: { label: 'Non acquis', color: 'bg-gray-100 text-gray-600', level: 0 },
  en_emergence: { label: 'En émergence', color: 'bg-red-100 text-red-700', level: 1 },
  en_cours: { label: 'En cours', color: 'bg-orange-100 text-orange-700', level: 2 },
  acquis_avec_aide: { label: 'Acquis avec aide', color: 'bg-yellow-100 text-yellow-700', level: 3 },
  acquis: { label: 'Acquis', color: 'bg-green-100 text-green-700', level: 4 },
};

const preferenceTypeLabels: Record<string, { label: string; icon: string; color: string }> = {
  reinforcer: { label: 'Renforçateur', icon: '⭐', color: 'bg-yellow-50 border-yellow-200' },
  interest: { label: 'Centre d\'intérêt', icon: '❤️', color: 'bg-pink-50 border-pink-200' },
  routine: { label: 'Routine', icon: '🔄', color: 'bg-blue-50 border-blue-200' },
  strategy: { label: 'Stratégie efficace', icon: '💡', color: 'bg-green-50 border-green-200' },
  avoid: { label: 'À éviter', icon: '⚠️', color: 'bg-red-50 border-red-200' },
};

const engagementLabels: Record<string, string> = {
  tres_engage: 'Très engagé',
  engage: 'Engagé',
  moyen: 'Moyen',
  difficile: 'Difficile',
};

export default function ChildDossierPage() {
  const router = useRouter();
  const params = useParams();
  const childId = params.id as string;

  const [profile, setProfile] = useState<any>(null);
  const [child, setChild] = useState<ChildProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // Data states
  const [goals, setGoals] = useState<Goal[]>([]);
  const [sessions, setSessions] = useState<SessionNote[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [preferences, setPreferences] = useState<Preference[]>([]);

  // Modal states
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [showPreferenceModal, setShowPreferenceModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [goalForm, setGoalForm] = useState({
    title: '',
    description: '',
    category: 'communication',
    specific: '',
    measurable: '',
    target_date: '',
  });

  const [sessionForm, setSessionForm] = useState({
    session_date: new Date().toISOString().split('T')[0],
    title: '',
    activities: '',
    observations: '',
    positive_points: '',
    engagement_level: 'engage',
  });

  const [skillForm, setSkillForm] = useState({
    name: '',
    category: 'communication',
    mastery_level: 'non_acquis',
    notes: '',
  });

  const [preferenceForm, setPreferenceForm] = useState({
    type: 'interest',
    name: '',
    description: '',
    effectiveness: 'efficace',
  });

  useEffect(() => {
    fetchData();
  }, [childId]);

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

      // Récupérer l'enfant
      const { data: childData, error: childError } = await supabase
        .from('child_profiles')
        .select('*')
        .eq('id', childId)
        .eq('family_id', familyProfile.id)
        .single();

      if (childError || !childData) {
        router.push('/dashboard/family/children');
        return;
      }

      setChild(childData);

      // Charger les données du dossier
      await Promise.all([
        fetchGoals(),
        fetchSessions(),
        fetchSkills(),
        fetchPreferences(),
      ]);
    } catch (err: any) {
      console.error('Erreur:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchGoals = async () => {
    const { data } = await supabase
      .from('child_educational_goals')
      .select('*')
      .eq('child_id', childId)
      .order('created_at', { ascending: false });
    setGoals(data || []);
  };

  const fetchSessions = async () => {
    const { data } = await supabase
      .from('child_session_notes')
      .select('*')
      .eq('child_id', childId)
      .order('session_date', { ascending: false });
    setSessions(data || []);
  };

  const fetchSkills = async () => {
    const { data } = await supabase
      .from('child_skills')
      .select('*')
      .eq('child_id', childId)
      .order('category', { ascending: true });
    setSkills(data || []);
  };

  const fetchPreferences = async () => {
    const { data } = await supabase
      .from('child_preferences')
      .select('*')
      .eq('child_id', childId)
      .order('type', { ascending: true });
    setPreferences(data || []);
  };

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  // Handlers pour ajouter des éléments
  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase.from('child_educational_goals').insert({
        child_id: childId,
        ...goalForm,
        target_date: goalForm.target_date || null,
      });
      if (error) throw error;
      await fetchGoals();
      setShowGoalModal(false);
      setGoalForm({ title: '', description: '', category: 'communication', specific: '', measurable: '', target_date: '' });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAddSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase.from('child_session_notes').insert({
        child_id: childId,
        ...sessionForm,
      });
      if (error) throw error;
      await fetchSessions();
      setShowSessionModal(false);
      setSessionForm({
        session_date: new Date().toISOString().split('T')[0],
        title: '',
        activities: '',
        observations: '',
        positive_points: '',
        engagement_level: 'engage',
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase.from('child_skills').insert({
        child_id: childId,
        ...skillForm,
      });
      if (error) throw error;
      await fetchSkills();
      setShowSkillModal(false);
      setSkillForm({ name: '', category: 'communication', mastery_level: 'non_acquis', notes: '' });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAddPreference = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase.from('child_preferences').insert({
        child_id: childId,
        ...preferenceForm,
      });
      if (error) throw error;
      await fetchPreferences();
      setShowPreferenceModal(false);
      setPreferenceForm({ type: 'interest', name: '', description: '', effectiveness: 'efficace' });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateSkillLevel = async (skillId: string, newLevel: string) => {
    try {
      const { error } = await supabase
        .from('child_skills')
        .update({ mastery_level: newLevel, last_evaluated_at: new Date().toISOString() })
        .eq('id', skillId);
      if (error) throw error;
      await fetchSkills();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleUpdateGoalProgress = async (goalId: string, progress: number) => {
    try {
      const { error } = await supabase
        .from('child_educational_goals')
        .update({
          progress,
          status: progress >= 100 ? 'atteint' : 'en_cours'
        })
        .eq('id', goalId);
      if (error) throw error;
      await fetchGoals();
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du dossier...</p>
        </div>
      </div>
    );
  }

  if (!child) {
    return null;
  }

  const tabs = [
    { id: 'overview' as TabType, label: 'Vue d\'ensemble', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { id: 'goals' as TabType, label: 'Objectifs', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
    { id: 'sessions' as TabType, label: 'Séances', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { id: 'skills' as TabType, label: 'Compétences', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    { id: 'preferences' as TabType, label: 'Préférences', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
  ];

  // Statistiques pour la vue d'ensemble
  const stats = {
    totalGoals: goals.length,
    activeGoals: goals.filter(g => g.status === 'en_cours').length,
    achievedGoals: goals.filter(g => g.status === 'atteint').length,
    totalSessions: sessions.length,
    recentSessions: sessions.filter(s => {
      const date = new Date(s.session_date);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return date >= thirtyDaysAgo;
    }).length,
    totalSkills: skills.length,
    acquiredSkills: skills.filter(s => s.mastery_level === 'acquis' || s.mastery_level === 'acquis_avec_aide').length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="hidden md:block">
              <Logo />
            </div>
            <div className="md:hidden ml-auto">
              <FamilyMobileMenu profile={profile} onLogout={handleLogout} />
            </div>
            <div className="hidden md:flex items-center gap-4">
              <Link
                href="/dashboard/family/children"
                className="text-gray-600 hover:text-primary-600 px-3 py-2 font-medium transition flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Retour aux enfants
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header avec infos enfant */}
        <div className="bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-500 rounded-2xl p-6 mb-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">
                {child.first_name[0].toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-bold">Dossier de {child.first_name}</h1>
                <p className="text-white/80">
                  {child.age ? `${child.age} ans` : ''}
                  {child.accompaniment_goals && ` • ${child.accompaniment_goals.substring(0, 50)}...`}
                </p>
              </div>
            </div>
            <Link
              href={`/dashboard/family/children/${childId}/ppa`}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition backdrop-blur"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="font-medium">Générer PPA</span>
            </Link>
          </div>
        </div>

        {/* Onglets */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition ${
                  activeTab === tab.id
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                </svg>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            {error}
            <button onClick={() => setError('')} className="float-right">&times;</button>
          </div>
        )}

        {/* Contenu des onglets */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          {/* Vue d'ensemble */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">Vue d'ensemble</h2>

              {/* Stats cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-xl p-4">
                  <p className="text-sm text-blue-600 font-medium">Objectifs actifs</p>
                  <p className="text-2xl font-bold text-blue-700">{stats.activeGoals}/{stats.totalGoals}</p>
                </div>
                <div className="bg-green-50 rounded-xl p-4">
                  <p className="text-sm text-green-600 font-medium">Objectifs atteints</p>
                  <p className="text-2xl font-bold text-green-700">{stats.achievedGoals}</p>
                </div>
                <div className="bg-purple-50 rounded-xl p-4">
                  <p className="text-sm text-purple-600 font-medium">Séances (30j)</p>
                  <p className="text-2xl font-bold text-purple-700">{stats.recentSessions}</p>
                </div>
                <div className="bg-amber-50 rounded-xl p-4">
                  <p className="text-sm text-amber-600 font-medium">Compétences acquises</p>
                  <p className="text-2xl font-bold text-amber-700">{stats.acquiredSkills}/{stats.totalSkills}</p>
                </div>
              </div>

              {/* Derniers objectifs */}
              {goals.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Objectifs récents</h3>
                  <div className="space-y-2">
                    {goals.slice(0, 3).map((goal) => (
                      <div key={goal.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${statusLabels[goal.status]?.color || 'bg-gray-100'}`}>
                            {statusLabels[goal.status]?.label || goal.status}
                          </span>
                          <span className="text-sm text-gray-900">{goal.title}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-gray-200 rounded-full">
                            <div
                              className="h-2 bg-primary-600 rounded-full"
                              style={{ width: `${goal.progress}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">{goal.progress}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Dernières séances */}
              {sessions.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Dernières séances</h3>
                  <div className="space-y-2">
                    {sessions.slice(0, 3).map((session) => (
                      <div key={session.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-900">
                            {session.title || 'Séance'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(session.session_date).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                        {session.activities && (
                          <p className="text-xs text-gray-600 line-clamp-1">{session.activities}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {goals.length === 0 && sessions.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">Commencez à remplir le dossier en ajoutant des objectifs ou des notes de séances.</p>
                </div>
              )}
            </div>
          )}

          {/* Objectifs */}
          {activeTab === 'goals' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Objectifs éducatifs</h2>
                <button
                  onClick={() => setShowGoalModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Nouvel objectif
                </button>
              </div>

              {goals.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun objectif</h3>
                  <p className="text-gray-500 mb-4">Définissez des objectifs éducatifs pour suivre la progression.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {goals.map((goal) => (
                    <div key={goal.id} className="border border-gray-200 rounded-xl p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusLabels[goal.status]?.color}`}>
                              {statusLabels[goal.status]?.label}
                            </span>
                            <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                              {categoryLabels[goal.category]}
                            </span>
                          </div>
                          <h3 className="font-semibold text-gray-900">{goal.title}</h3>
                          {goal.description && (
                            <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
                          )}
                        </div>
                        {goal.target_date && (
                          <span className="text-xs text-gray-500">
                            Objectif: {new Date(goal.target_date).toLocaleDateString('fr-FR')}
                          </span>
                        )}
                      </div>

                      {/* Barre de progression */}
                      <div className="mt-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-600">Progression</span>
                          <span className="text-sm font-medium text-gray-900">{goal.progress}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full">
                          <div
                            className="h-2 bg-primary-600 rounded-full transition-all"
                            style={{ width: `${goal.progress}%` }}
                          />
                        </div>
                        <div className="flex gap-2 mt-2">
                          {[0, 25, 50, 75, 100].map((value) => (
                            <button
                              key={value}
                              onClick={() => handleUpdateGoalProgress(goal.id, value)}
                              className={`px-2 py-1 text-xs rounded ${
                                goal.progress === value
                                  ? 'bg-primary-600 text-white'
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              {value}%
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Séances */}
          {activeTab === 'sessions' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Notes de séances</h2>
                <button
                  onClick={() => setShowSessionModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Nouvelle note
                </button>
              </div>

              {sessions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune note de séance</h3>
                  <p className="text-gray-500 mb-4">Notez les observations après chaque séance.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sessions.map((session) => (
                    <div key={session.id} className="border border-gray-200 rounded-xl p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {session.title || `Séance du ${new Date(session.session_date).toLocaleDateString('fr-FR')}`}
                          </h3>
                          <span className="text-sm text-gray-500">
                            {new Date(session.session_date).toLocaleDateString('fr-FR', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                        {session.engagement_level && (
                          <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700">
                            {engagementLabels[session.engagement_level]}
                          </span>
                        )}
                      </div>

                      {session.activities && (
                        <div className="mb-2">
                          <p className="text-xs font-medium text-gray-500 mb-1">Activités</p>
                          <p className="text-sm text-gray-700">{session.activities}</p>
                        </div>
                      )}

                      {session.observations && (
                        <div className="mb-2">
                          <p className="text-xs font-medium text-gray-500 mb-1">Observations</p>
                          <p className="text-sm text-gray-700">{session.observations}</p>
                        </div>
                      )}

                      {session.positive_points && (
                        <div className="bg-green-50 rounded-lg p-2 mt-2">
                          <p className="text-xs font-medium text-green-700 mb-1">Points positifs</p>
                          <p className="text-sm text-green-800">{session.positive_points}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Compétences */}
          {activeTab === 'skills' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Compétences</h2>
                <button
                  onClick={() => setShowSkillModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Ajouter une compétence
                </button>
              </div>

              {skills.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune compétence</h3>
                  <p className="text-gray-500 mb-4">Suivez l'acquisition des compétences.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(categoryLabels).map(([category, label]) => {
                    const categorySkills = skills.filter(s => s.category === category);
                    if (categorySkills.length === 0) return null;

                    return (
                      <div key={category}>
                        <h3 className="font-medium text-gray-700 mb-2">{label}</h3>
                        <div className="space-y-2">
                          {categorySkills.map((skill) => (
                            <div key={skill.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div>
                                <p className="font-medium text-gray-900">{skill.name}</p>
                                {skill.notes && (
                                  <p className="text-xs text-gray-500">{skill.notes}</p>
                                )}
                              </div>
                              <select
                                value={skill.mastery_level}
                                onChange={(e) => handleUpdateSkillLevel(skill.id, e.target.value)}
                                className={`text-xs font-medium px-2 py-1 rounded border-0 ${masteryLabels[skill.mastery_level]?.color}`}
                              >
                                {Object.entries(masteryLabels).map(([value, { label }]) => (
                                  <option key={value} value={value}>{label}</option>
                                ))}
                              </select>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Préférences */}
          {activeTab === 'preferences' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Préférences et stratégies</h2>
                <button
                  onClick={() => setShowPreferenceModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Ajouter
                </button>
              </div>

              {preferences.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune préférence</h3>
                  <p className="text-gray-500 mb-4">Notez les renforçateurs, intérêts et stratégies efficaces.</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {Object.entries(preferenceTypeLabels).map(([type, { label, icon, color }]) => {
                    const typePrefs = preferences.filter(p => p.type === type);
                    if (typePrefs.length === 0) return null;

                    return (
                      <div key={type} className={`border rounded-xl p-4 ${color}`}>
                        <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                          <span>{icon}</span> {label}
                        </h3>
                        <div className="space-y-2">
                          {typePrefs.map((pref) => (
                            <div key={pref.id} className="bg-white/70 rounded-lg p-2">
                              <p className="font-medium text-gray-900">{pref.name}</p>
                              {pref.description && (
                                <p className="text-xs text-gray-600">{pref.description}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal Objectif */}
      {showGoalModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Nouvel objectif</h2>
              <button onClick={() => setShowGoalModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleAddGoal} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
                <input
                  type="text"
                  required
                  value={goalForm.title}
                  onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Ex: Dire bonjour aux adultes"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                <select
                  value={goalForm.category}
                  onChange={(e) => setGoalForm({ ...goalForm, category: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg py-2 px-3"
                >
                  {Object.entries(categoryLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={goalForm.description}
                  onChange={(e) => setGoalForm({ ...goalForm, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg py-2 px-3"
                  rows={2}
                  placeholder="Détails de l'objectif..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Comment mesurer (critère de réussite)</label>
                <input
                  type="text"
                  value={goalForm.measurable}
                  onChange={(e) => setGoalForm({ ...goalForm, measurable: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg py-2 px-3"
                  placeholder="Ex: 8 fois sur 10 sans rappel"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date cible</label>
                <input
                  type="date"
                  value={goalForm.target_date}
                  onChange={(e) => setGoalForm({ ...goalForm, target_date: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg py-2 px-3"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowGoalModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  {saving ? 'Ajout...' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Séance */}
      {showSessionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Note de séance</h2>
              <button onClick={() => setShowSessionModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleAddSession} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={sessionForm.session_date}
                    onChange={(e) => setSessionForm({ ...sessionForm, session_date: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg py-2 px-3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Engagement</label>
                  <select
                    value={sessionForm.engagement_level}
                    onChange={(e) => setSessionForm({ ...sessionForm, engagement_level: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg py-2 px-3"
                  >
                    {Object.entries(engagementLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Titre (optionnel)</label>
                <input
                  type="text"
                  value={sessionForm.title}
                  onChange={(e) => setSessionForm({ ...sessionForm, title: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg py-2 px-3"
                  placeholder="Ex: Séance communication"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Activités réalisées</label>
                <textarea
                  value={sessionForm.activities}
                  onChange={(e) => setSessionForm({ ...sessionForm, activities: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg py-2 px-3"
                  rows={2}
                  placeholder="Qu'avez-vous travaillé ?"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observations</label>
                <textarea
                  value={sessionForm.observations}
                  onChange={(e) => setSessionForm({ ...sessionForm, observations: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg py-2 px-3"
                  rows={2}
                  placeholder="Observations factuelles..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Points positifs</label>
                <textarea
                  value={sessionForm.positive_points}
                  onChange={(e) => setSessionForm({ ...sessionForm, positive_points: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg py-2 px-3"
                  rows={2}
                  placeholder="Ce qui a bien fonctionné..."
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowSessionModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  {saving ? 'Ajout...' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Compétence */}
      {showSkillModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Nouvelle compétence</h2>
              <button onClick={() => setShowSkillModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleAddSkill} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom de la compétence *</label>
                <input
                  type="text"
                  required
                  value={skillForm.name}
                  onChange={(e) => setSkillForm({ ...skillForm, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg py-2 px-3"
                  placeholder="Ex: S'habiller seul"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                  <select
                    value={skillForm.category}
                    onChange={(e) => setSkillForm({ ...skillForm, category: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg py-2 px-3"
                  >
                    {Object.entries(categoryLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Niveau actuel</label>
                  <select
                    value={skillForm.mastery_level}
                    onChange={(e) => setSkillForm({ ...skillForm, mastery_level: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg py-2 px-3"
                  >
                    {Object.entries(masteryLabels).map(([value, { label }]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={skillForm.notes}
                  onChange={(e) => setSkillForm({ ...skillForm, notes: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg py-2 px-3"
                  rows={2}
                  placeholder="Contexte, observations..."
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowSkillModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  {saving ? 'Ajout...' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Préférence */}
      {showPreferenceModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Nouvelle préférence</h2>
              <button onClick={() => setShowPreferenceModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleAddPreference} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={preferenceForm.type}
                  onChange={(e) => setPreferenceForm({ ...preferenceForm, type: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg py-2 px-3"
                >
                  {Object.entries(preferenceTypeLabels).map(([value, { label, icon }]) => (
                    <option key={value} value={value}>{icon} {label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                <input
                  type="text"
                  required
                  value={preferenceForm.name}
                  onChange={(e) => setPreferenceForm({ ...preferenceForm, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg py-2 px-3"
                  placeholder="Ex: Dinosaures, Puzzle, Timer visuel..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={preferenceForm.description}
                  onChange={(e) => setPreferenceForm({ ...preferenceForm, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg py-2 px-3"
                  rows={2}
                  placeholder="Détails, comment utiliser..."
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPreferenceModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  {saving ? 'Ajout...' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
