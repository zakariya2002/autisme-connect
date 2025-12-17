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
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
            Actif
          </span>
        );
      case 'trialing':
        return (
          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold text-white" style={{ backgroundColor: '#41005c' }}>
            Période d'essai
          </span>
        );
      case 'canceled':
        return (
          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold text-white" style={{ backgroundColor: '#f0879f' }}>
            Annulé
          </span>
        );
      case 'past_due':
        return (
          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
            Paiement en retard
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
            {status}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#fdf9f4' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#41005c' }}></div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="min-h-screen min-h-[100dvh] flex flex-col" style={{ backgroundColor: '#fdf9f4' }}>
        <div className="sticky top-0 z-40">
          <EducatorNavbar profile={profile} subscription={subscription} />
        </div>

        <div className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full">
          {/* En-tête centré avec icône */}
          <div className="mb-6 sm:mb-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center p-1" style={{ backgroundColor: '#41005c' }}>
              <img src="/images/icons/subscription.svg" alt="" className="w-full h-full" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Mon abonnement</h1>
            <p className="text-gray-500 text-sm mt-1">Gérez votre abonnement Premium</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#f3e8ff' }}>
              <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" style={{ color: '#41005c' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Aucun abonnement actif</h2>
            <p className="text-gray-500 text-sm mb-6">Vous n'avez pas encore d'abonnement Premium.</p>
            <Link
              href="/pro/pricing"
              className="inline-flex items-center px-5 py-2.5 text-sm font-medium rounded-xl text-white hover:opacity-90 transition"
              style={{ backgroundColor: '#41005c' }}
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
    <div className="min-h-screen min-h-[100dvh] flex flex-col" style={{ backgroundColor: '#fdf9f4' }}>
      <div className="sticky top-0 z-40">
        <EducatorNavbar profile={profile} subscription={subscription} />
      </div>

      <div className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full">
        {/* En-tête centré avec icône */}
        <div className="mb-6 sm:mb-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center p-1" style={{ backgroundColor: '#41005c' }}>
            <img src="/images/icons/subscription.svg" alt="" className="w-full h-full" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Mon abonnement</h1>
          <p className="text-gray-500 text-sm mt-1">Gérez votre abonnement Premium</p>
        </div>

        {/* Abonnement actuel */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="px-5 py-4" style={{ backgroundColor: '#41005c' }}>
            <h2 className="text-base font-bold text-white">Abonnement actuel</h2>
          </div>
          <div className="p-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {subscription.plan_type === 'annual' ? 'Plan Annuel' : 'Plan Mensuel'}
                </h3>
                <p className="text-gray-500 text-sm mt-1">
                  {formatAmount(subscription.price_amount)}/{subscription.plan_type === 'annual' ? 'an' : 'mois'}
                </p>
              </div>
              {getStatusBadge(subscription.status)}
            </div>

            {isTrialing && subscription.trial_end && (
              <div className="rounded-xl p-4 mb-5" style={{ backgroundColor: '#f3e8ff', border: '1px solid #d8b4fe' }}>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#41005c' }}>
                    <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold" style={{ color: '#41005c' }}>Période d'essai gratuite</h4>
                    <p className="text-sm mt-1" style={{ color: '#5a1a75' }}>
                      Votre période d'essai se termine le <strong>{formatDate(subscription.trial_end)}</strong>.
                      <br />
                      Le premier paiement de {formatAmount(subscription.price_amount)} sera effectué à cette date.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {isCanceled && subscription.cancel_at && (
              <div className="rounded-xl p-4 mb-5" style={{ backgroundColor: '#fff1f2', border: '1px solid #f0879f' }}>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#f0879f' }}>
                    <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold" style={{ color: '#9f1239' }}>Abonnement annulé</h4>
                    <p className="text-sm mt-1" style={{ color: '#be123c' }}>
                      Votre abonnement prendra fin le <strong>{formatDate(subscription.cancel_at)}</strong>.
                      <br />
                      Vous aurez accès à toutes les fonctionnalités Premium jusqu'à cette date.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="rounded-xl p-4" style={{ backgroundColor: '#faf5ff', border: '1px solid #e9d5ff' }}>
                <p className="text-xs text-gray-500 mb-1">Début de la période</p>
                <p className="text-base font-semibold" style={{ color: '#41005c' }}>{formatDate(subscription.current_period_start)}</p>
              </div>
              <div className="rounded-xl p-4" style={{ backgroundColor: '#faf5ff', border: '1px solid #e9d5ff' }}>
                <p className="text-xs text-gray-500 mb-1">Fin de la période</p>
                <p className="text-base font-semibold" style={{ color: '#41005c' }}>{formatDate(subscription.current_period_end)}</p>
              </div>
            </div>

            {!isCanceled && (
              <div className="mt-5 pt-5 border-t border-gray-100">
                <button
                  onClick={() => setShowCancelConfirm(true)}
                  className="text-sm font-medium hover:underline"
                  style={{ color: '#f0879f' }}
                >
                  Annuler mon abonnement
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Prochaine facturation */}
        {!isCanceled && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6 p-5">
            <h2 className="text-base font-bold text-gray-900 mb-4">Prochaine facturation</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">
                  {isTrialing ? 'Premier paiement' : 'Prochain paiement'}
                </p>
                <p className="text-2xl font-bold mt-1" style={{ color: '#41005c' }}>
                  {formatAmount(subscription.price_amount)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-gray-500 text-sm">Date</p>
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  {formatDate(subscription.current_period_end)}
                </p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                Vos informations de paiement sont traitées de manière sécurisée via Stripe.
                Nous ne stockons aucune donnée bancaire sur nos serveurs conformément au RGPD.
              </p>
            </div>
          </div>
        )}

        {/* Historique des factures */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4" style={{ backgroundColor: '#faf5ff' }}>
            <h2 className="text-base font-bold" style={{ color: '#41005c' }}>Historique des factures</h2>
          </div>
          <div className="p-5">
            {invoices.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: '#f3e8ff' }}>
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" style={{ color: '#41005c' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-gray-500 text-sm">Aucune facture pour le moment</p>
              </div>
            ) : (
              <>
                {/* Vue mobile - Cartes */}
                <div className="md:hidden space-y-3">
                  {invoices.map((invoice) => (
                    <div key={invoice.id} className="rounded-xl p-4" style={{ backgroundColor: '#faf5ff', border: '1px solid #e9d5ff' }}>
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="text-lg font-bold" style={{ color: '#41005c' }}>
                            {formatAmount(invoice.amount_paid / 100)}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {new Date(invoice.created * 1000).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                          invoice.status === 'paid'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {invoice.status === 'paid' ? 'Payée' : invoice.status}
                        </span>
                      </div>
                      {invoice.invoice_pdf && (
                        <a
                          href={invoice.invoice_pdf}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-white rounded-xl hover:opacity-90 font-medium transition text-sm"
                          style={{ backgroundColor: '#41005c' }}
                          aria-label="Télécharger la facture"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Télécharger
                        </a>
                      )}
                    </div>
                  ))}
                </div>

                {/* Vue desktop - Tableau */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-100" role="table" aria-label="Tableau de l'historique des factures">
                    <thead style={{ backgroundColor: '#faf5ff' }}>
                      <tr>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#41005c' }}>
                          Montant
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#41005c' }}>
                          Date
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#41005c' }}>
                          Statut
                        </th>
                        <th scope="col" className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: '#41005c' }}>
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {invoices.map((invoice) => (
                        <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-4 whitespace-nowrap">
                            <p className="font-semibold" style={{ color: '#41005c' }}>
                              {formatAmount(invoice.amount_paid / 100)}
                            </p>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <p className="text-sm text-gray-500">
                              {new Date(invoice.created * 1000).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                              })}
                            </p>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                              invoice.status === 'paid'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-700'
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
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-xs font-medium hover:opacity-90 transition"
                                style={{ backgroundColor: '#41005c' }}
                                aria-label="Télécharger la facture"
                              >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                PDF
                              </a>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modal de confirmation d'annulation */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#fff1f2' }}>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true" style={{ color: '#f0879f' }}>
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-3 text-center">Confirmer l'annulation</h3>
            <p className="text-gray-500 text-sm mb-6 text-center">
              Êtes-vous sûr de vouloir annuler votre abonnement ? Vous conserverez l'accès Premium jusqu'au{' '}
              <strong className="text-gray-700">{formatDate(subscription.current_period_end)}</strong>.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => setShowCancelConfirm(false)}
                disabled={canceling}
                className="w-full px-4 py-2.5 text-white rounded-xl hover:opacity-90 disabled:opacity-50 font-medium transition"
                style={{ backgroundColor: '#41005c' }}
              >
                Garder mon abonnement
              </button>
              <button
                onClick={handleCancelSubscription}
                disabled={canceling}
                className="w-full px-4 py-2.5 rounded-xl disabled:opacity-50 font-medium transition text-sm"
                style={{ backgroundColor: '#fff1f2', color: '#be123c', border: '1px solid #f0879f' }}
              >
                {canceling ? 'Annulation...' : 'Confirmer l\'annulation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
