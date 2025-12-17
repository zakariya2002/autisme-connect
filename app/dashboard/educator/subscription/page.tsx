'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { signOut } from '@/lib/auth';
import EducatorNavbar from '@/components/EducatorNavbar';

interface Subscription {
  id: string;
  stripe_subscription_id: string;
  stripe_customer_id: string;
  status: string;
  plan_type: string;
  price_amount: number;
  current_period_start: string;
  current_period_end: string;
  trial_start: string | null;
  trial_end: string | null;
  cancel_at: string | null;
  canceled_at: string | null;
}

interface Invoice {
  id: string;
  amount_paid: number;
  currency: string;
  status: string;
  created: number;
  invoice_pdf: string;
  hosted_invoice_url: string;
  period_start: number;
  period_end: number;
}

export default function SubscriptionManagementPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      router.push('/auth/login');
      return;
    }

    // Récupérer le profil éducateur
    const { data: educatorData } = await supabase
      .from('educator_profiles')
      .select('*')
      .eq('user_id', session.user.id)
      .single();

    if (!educatorData) {
      router.push('/dashboard/educator');
      return;
    }

    setProfile(educatorData);

    // Récupérer l'abonnement
    const { data: subscriptionData } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('educator_id', educatorData.id)
      .single();

    setSubscription(subscriptionData);

    // Récupérer les factures depuis l'API
    if (subscriptionData?.stripe_customer_id) {
      fetchInvoices(subscriptionData.stripe_customer_id);
    }

    setLoading(false);
  };

  const fetchInvoices = async (customerId: string) => {
    try {
      const response = await fetch(`/api/get-invoices?customerId=${customerId}`);
      const data = await response.json();
      if (response.ok) {
        setInvoices(data.invoices || []);
      }
    } catch (error) {
      console.error('Erreur chargement factures:', error);
    }
  };

  const handleCancelSubscription = async () => {
    if (!subscription) return;

    setCanceling(true);

    try {
      const response = await fetch('/api/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId: subscription.stripe_subscription_id,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Votre abonnement sera annulé à la fin de la période en cours.');
        window.location.reload();
      } else {
        alert('Erreur: ' + data.error);
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Une erreur est survenue');
    } finally {
      setCanceling(false);
      setShowCancelConfirm(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    window.location.href = '/';
  };

  const isPremium = !!(subscription && ['active', 'trialing'].includes(subscription.status));

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: 'Actif', color: 'bg-green-100 text-green-800' },
      trialing: { label: 'Période d\'essai', color: 'bg-blue-100 text-blue-800' },
      canceled: { label: 'Annulé', color: 'bg-red-100 text-red-800' },
      past_due: { label: 'Paiement en retard', color: 'bg-orange-100 text-orange-800' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      label: status,
      color: 'bg-gray-100 text-gray-800',
    };

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="min-h-screen bg-gray-50">
        <EducatorNavbar profile={profile} subscription={subscription} />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Aucun abonnement actif</h2>
            <p className="text-gray-600 mb-6">Vous n'avez pas encore d'abonnement Premium.</p>
            <Link
              href="/pricing"
              className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition"
            >
              Découvrir nos offres
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isTrialing = subscription.status === 'trialing';
  const isCanceled = subscription.status === 'canceled' || subscription.cancel_at;

  return (
    <div className="min-h-screen bg-gray-50">
      <EducatorNavbar profile={profile} subscription={subscription} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Gérer mon abonnement</h1>

        {/* Abonnement actuel */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4">
            <h2 className="text-xl font-bold text-white">Abonnement actuel</h2>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {subscription.plan_type === 'annual' ? 'Plan Annuel' : 'Plan Mensuel'}
                </h3>
                <p className="text-gray-600 mt-1">
                  {formatAmount(subscription.price_amount)}/{subscription.plan_type === 'annual' ? 'an' : 'mois'}
                </p>
              </div>
              {getStatusBadge(subscription.status)}
            </div>

            {isTrialing && subscription.trial_end && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <svg className="h-5 w-5 text-blue-600 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h4 className="text-sm font-semibold text-blue-900">Période d'essai gratuite</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Votre période d'essai se termine le <strong>{formatDate(subscription.trial_end)}</strong>.
                      <br />
                      Le premier paiement de {formatAmount(subscription.price_amount)} sera effectué à cette date.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {isCanceled && subscription.cancel_at && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <svg className="h-5 w-5 text-red-600 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h4 className="text-sm font-semibold text-red-900">Abonnement annulé</h4>
                    <p className="text-sm text-red-700 mt-1">
                      Votre abonnement prendra fin le <strong>{formatDate(subscription.cancel_at)}</strong>.
                      <br />
                      Vous aurez accès à toutes les fonctionnalités Premium jusqu'à cette date.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Début de la période</p>
                <p className="text-lg font-semibold text-gray-900">{formatDate(subscription.current_period_start)}</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Fin de la période</p>
                <p className="text-lg font-semibold text-gray-900">{formatDate(subscription.current_period_end)}</p>
              </div>
            </div>

            {!isCanceled && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowCancelConfirm(true)}
                  className="text-red-600 hover:text-red-700 font-medium text-sm"
                >
                  Annuler mon abonnement
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Prochaine facturation */}
        {!isCanceled && (
          <div className="bg-white rounded-lg shadow mb-8 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Prochaine facturation</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">
                  {isTrialing ? 'Premier paiement' : 'Prochain paiement'}
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatAmount(subscription.price_amount)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-gray-600">Date</p>
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  {formatDate(subscription.current_period_end)}
                </p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Vos informations de paiement sont traitées de manière sécurisée via Stripe.
                Nous ne stockons aucune donnée bancaire sur nos serveurs conformément au RGPD.
              </p>
            </div>
          </div>
        )}

        {/* Historique des factures */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">Historique des factures</h2>
          </div>
          <div className="p-6">
            {invoices.length === 0 ? (
              <p className="text-gray-600 text-center py-8">Aucune facture pour le moment</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200" role="table" aria-label="Tableau de l'historique des factures">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Montant
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                      <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {invoices.map((invoice) => (
                      <tr key={invoice.id} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <p className="font-medium text-gray-900">
                            {formatAmount(invoice.amount_paid / 100)}
                          </p>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <p className="text-sm text-gray-600">
                            {new Date(invoice.created * 1000).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })}
                          </p>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            invoice.status === 'paid'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {invoice.status === 'paid' ? 'Payée' : invoice.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-right">
                          {invoice.invoice_pdf && (
                            <a
                              href={invoice.invoice_pdf}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                              aria-label="Télécharger la facture"
                            >
                              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              Télécharger
                            </a>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de confirmation d'annulation */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Confirmer l'annulation</h3>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir annuler votre abonnement ? Vous conserverez l'accès Premium jusqu'au{' '}
              <strong>{formatDate(subscription.current_period_end)}</strong>.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleCancelSubscription}
                disabled={canceling}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 font-medium"
              >
                {canceling ? 'Annulation...' : 'Confirmer l\'annulation'}
              </button>
              <button
                onClick={() => setShowCancelConfirm(false)}
                disabled={canceling}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 font-medium"
              >
                Garder mon abonnement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
