'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { signOut } from '@/lib/auth';
import Logo from '@/components/Logo';
import FamilyMobileMenu from '@/components/FamilyMobileMenu';

interface Receipt {
  id: string;
  invoice_number: string;
  invoice_date: string;
  amount_total: number;
  pdf_url: string;
  status: string;
  appointment: {
    appointment_date: string;
    start_time: string;
    end_time: string;
    educator: {
      first_name: string;
      last_name: string;
    };
  };
}

export default function FamilyReceiptsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
    fetchReceipts();
  }, []);

  const fetchProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      router.push('/auth/login');
      return;
    }

    const { data } = await supabase
      .from('family_profiles')
      .select('*')
      .eq('user_id', session.user.id)
      .single();

    setProfile(data);
  };

  const fetchReceipts = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { data: familyProfile } = await supabase
        .from('family_profiles')
        .select('id')
        .eq('user_id', session.user.id)
        .single();

      if (familyProfile) {
        const { data, error } = await supabase
          .from('invoices')
          .select(`
            id,
            invoice_number,
            invoice_date,
            amount_total,
            pdf_url,
            status,
            appointment:appointments(
              appointment_date,
              start_time,
              end_time,
              educator:educator_profiles(
                first_name,
                last_name
              )
            )
          `)
          .eq('family_id', familyProfile.id)
          .eq('type', 'family_receipt')
          .order('invoice_date', { ascending: false });

        if (error) {
          console.error('Error fetching receipts:', error);
        } else {
          // Mapper les données pour transformer les tableaux en objets
          const mappedData = (data || []).map((receipt: any) => ({
            ...receipt,
            appointment: Array.isArray(receipt.appointment) && receipt.appointment.length > 0
              ? {
                  ...receipt.appointment[0],
                  educator: Array.isArray(receipt.appointment[0].educator) && receipt.appointment[0].educator.length > 0
                    ? receipt.appointment[0].educator[0]
                    : receipt.appointment[0].educator
                }
              : receipt.appointment
          }));
          setReceipts(mappedData);
        }
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  const formatAmount = (amountInCents: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amountInCents / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="hidden md:block">
              <Logo />
            </div>
            <div className="md:hidden ml-auto">
              <FamilyMobileMenu profile={profile} onLogout={handleLogout} />
            </div>
            <div className="hidden md:flex space-x-4">
              <Link href="/dashboard/family" className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 px-6 py-2.5 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Tableau de bord
              </Link>
              <Link href="/dashboard/family/profile" className="text-gray-700 hover:text-primary-600 px-3 py-2 font-medium transition">
                Mon profil
              </Link>
              <button onClick={handleLogout} className="text-gray-700 hover:text-primary-600 px-3 py-2 font-medium transition">
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mes reçus</h1>
              <p className="text-gray-600 mt-1">Téléchargez vos reçus de paiement</p>
            </div>
            <Link
              href="/dashboard/family"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition"
            >
              <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Retour
            </Link>
          </div>
        </div>

        {/* Liste des reçus */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Historique des reçus ({receipts.length})
            </h2>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                <p className="mt-4 text-gray-600">Chargement des reçus...</p>
              </div>
            ) : receipts.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun reçu</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Vos reçus apparaîtront ici après chaque séance complétée.
                </p>
                <div className="mt-6">
                  <Link
                    href="/search"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                  >
                    Chercher un éducateur
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {receipts.map((receipt) => (
                  <div
                    key={receipt.id}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="flex-shrink-0">
                            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              Reçu {receipt.invoice_number}
                            </h3>
                            <p className="text-sm text-gray-500">
                              Émis le {formatDate(receipt.invoice_date)}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          <div>
                            <p className="text-sm font-medium text-gray-500">Éducateur</p>
                            <p className="text-sm text-gray-900 mt-1">
                              {receipt.appointment?.educator?.first_name} {receipt.appointment?.educator?.last_name}
                            </p>
                          </div>

                          <div>
                            <p className="text-sm font-medium text-gray-500">Date de la séance</p>
                            <p className="text-sm text-gray-900 mt-1">
                              {receipt.appointment?.appointment_date && formatDate(receipt.appointment.appointment_date)}
                              {receipt.appointment?.start_time && ` à ${receipt.appointment.start_time}`}
                            </p>
                          </div>

                          <div>
                            <p className="text-sm font-medium text-gray-500">Montant payé</p>
                            <p className="text-lg font-bold text-green-600 mt-1">
                              {formatAmount(receipt.amount_total)}
                            </p>
                          </div>

                          <div>
                            <p className="text-sm font-medium text-gray-500">Statut</p>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                              {receipt.status === 'generated' ? 'Généré' : receipt.status}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="ml-6 flex-shrink-0">
                        <a
                          href={receipt.pdf_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 transition"
                        >
                          <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Télécharger
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Info box */}
        {receipts.length > 0 && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">À propos de vos reçus</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <ul className="list-disc list-inside space-y-1">
                    <li>Les reçus sont générés automatiquement après chaque séance</li>
                    <li>Vous pouvez les télécharger au format PDF à tout moment</li>
                    <li>Conservez-les pour votre comptabilité personnelle</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
