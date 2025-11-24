'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface Educator {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  verification_status: string;
  created_at: string;
  documents_count: number;
}

export default function AdminVerificationsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [educators, setEducators] = useState<Educator[]>([]);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadEducators();
  }, [filter]);

  const loadEducators = async () => {
    try {
      setLoading(true);

      let query = supabase
        .from('educator_profiles')
        .select(`
          id,
          first_name,
          last_name,
          verification_status,
          created_at,
          user_id
        `)
        .order('created_at', { ascending: false });

      // Filtrer par statut
      if (filter !== 'all') {
        query = query.eq('verification_status', filter);
      } else {
        // Par défaut, afficher ceux qui nécessitent une action
        query = query.in('verification_status', [
          'documents_submitted',
          'documents_verified',
          'interview_scheduled'
        ]);
      }

      const { data: profiles, error: profilesError } = await query;

      if (profilesError) throw profilesError;

      // Récupérer les emails et compter les documents pour chaque éducateur
      const educatorsWithDetails = await Promise.all(
        (profiles || []).map(async (profile) => {
          // Récupérer l'email
          const { data: userData } = await supabase.auth.admin.getUserById(profile.user_id);

          // Compter les documents
          const { count } = await supabase
            .from('verification_documents')
            .select('*', { count: 'exact', head: true })
            .eq('educator_id', profile.id);

          return {
            ...profile,
            email: userData?.user?.email || 'N/A',
            documents_count: count || 0
          };
        })
      );

      setEducators(educatorsWithDetails);
    } catch (error) {
      console.error('Erreur chargement éducateurs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    const statuses: Record<string, { label: string; color: string; bgColor: string }> = {
      pending_documents: { label: 'En attente documents', color: 'text-gray-700', bgColor: 'bg-gray-100' },
      documents_submitted: { label: 'Documents soumis', color: 'text-blue-700', bgColor: 'bg-blue-100' },
      documents_verified: { label: 'Documents vérifiés', color: 'text-green-700', bgColor: 'bg-green-100' },
      interview_scheduled: { label: 'Entretien planifié', color: 'text-purple-700', bgColor: 'bg-purple-100' },
      verified: { label: 'Vérifié ✓', color: 'text-green-800', bgColor: 'bg-green-200' },
      rejected_criminal_record: { label: 'Refusé (casier)', color: 'text-red-700', bgColor: 'bg-red-100' },
      rejected_interview: { label: 'Refusé (entretien)', color: 'text-red-700', bgColor: 'bg-red-100' }
    };
    return statuses[status] || { label: status, color: 'text-gray-700', bgColor: 'bg-gray-100' };
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
            <div className="flex items-center gap-4">
              <Link href="/admin" className="text-gray-600 hover:text-primary-600">
                ← Retour
              </Link>
              <h1 className="text-xl font-bold text-gray-900">Vérifications des éducateurs</h1>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtres */}
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'all'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
            }`}
          >
            En attente d'action
          </button>
          <button
            onClick={() => setFilter('documents_submitted')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'documents_submitted'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
            }`}
          >
            Documents soumis
          </button>
          <button
            onClick={() => setFilter('documents_verified')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'documents_verified'
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
            }`}
          >
            Documents OK
          </button>
          <button
            onClick={() => setFilter('verified')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'verified'
                ? 'bg-green-700 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
            }`}
          >
            Vérifiés
          </button>
        </div>

        {/* Liste des éducateurs */}
        {educators.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">Aucune vérification en attente</h3>
            <p className="mt-1 text-gray-500">Tous les éducateurs ont été traités</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Éducateur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Documents
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date soumission
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {educators.map((educator) => {
                  const statusInfo = getStatusInfo(educator.verification_status);
                  return (
                    <tr key={educator.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {educator.first_name} {educator.last_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{educator.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {educator.documents_count}/4 documents
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.color} ${statusInfo.bgColor}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(educator.created_at).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          href={`/admin/verifications/${educator.id}`}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                        >
                          Examiner
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
