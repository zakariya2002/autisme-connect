'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Card, Badge, StatCard } from '@/components/admin/ui';

interface PaymentStats {
  totalRevenue: number;
  totalCommission: number;
  totalEducatorRevenue: number;
  subscriptionRevenue: number;
  totalAppointments: number;
  completedAppointments: number;
  failedPayments: number;
  refundedPayments: number;
  pendingPayments: number;
}

interface Appointment {
  id: string;
  appointment_date: string;
  start_time: string;
  price: number;
  status: string;
  payment_status: string;
  payment_intent_id: string;
  platform_commission: number;
  educator_revenue: number;
  created_at: string;
  educator_name: string;
  family_name: string;
}

interface SubscriptionTransaction {
  id: string;
  amount: number;
  status: string;
  description: string;
  created_at: string;
  educator_id: string;
}

export default function AdminPayments() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState<'appointments' | 'subscriptions'>('appointments');
  const [stats, setStats] = useState<PaymentStats>({
    totalRevenue: 0, totalCommission: 0, totalEducatorRevenue: 0,
    subscriptionRevenue: 0, totalAppointments: 0, completedAppointments: 0,
    failedPayments: 0, refundedPayments: 0, pendingPayments: 0,
  });
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [subscriptionTransactions, setSubscriptionTransactions] = useState<SubscriptionTransaction[]>([]);

  useEffect(() => {
    checkAccess();
  }, []);

  useEffect(() => {
    if (!loading) loadData();
  }, [period, statusFilter]);

  const checkAccess = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      router.push('/auth/login');
      return;
    }
    await loadData();
    setLoading(false);
  };

  const loadData = async () => {
    try {
      const res = await fetch(`/api/admin/payments?period=${period}&status=${statusFilter}`);
      if (!res.ok) throw new Error('Erreur chargement');
      const data = await res.json();
      setStats(data.stats);
      setAppointments(data.appointments);
      setSubscriptionTransactions(data.subscriptionTransactions);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const formatCents = (cents: number) => `${(cents / 100).toFixed(2)} €`;
  const formatEuros = (euros: number) => `${euros.toFixed(2)} €`;

  const getStatusBadge = (status: string) => {
    const variant: Record<string, 'success' | 'warning' | 'danger' | 'purple' | 'neutral'> = {
      authorized: 'warning',
      captured: 'success',
      failed: 'danger',
      refunded: 'purple',
      canceled: 'neutral',
      succeeded: 'success',
      pending: 'warning',
    };
    const labels: Record<string, string> = {
      authorized: 'Autorisé',
      captured: 'Capturé',
      failed: 'Échoué',
      refunded: 'Remboursé',
      canceled: 'Annulé',
      succeeded: 'Réussi',
      pending: 'En attente',
    };
    return <Badge variant={variant[status] || 'neutral'}>{labels[status] || status}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary-200 border-t-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-admin-muted-dark">Chargement...</p>
        </div>
      </div>
    );
  }

  const selectClass = "px-3 py-2 bg-white dark:bg-admin-surface-dark border border-gray-200 dark:border-admin-border-dark rounded-lg text-sm font-medium text-gray-700 dark:text-admin-text-dark focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-admin-text-dark">
          Paiements
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-admin-muted-dark">
          Suivi des revenus, commissions et transactions
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className={selectClass}
        >
          <option value="7">7 derniers jours</option>
          <option value="30">30 derniers jours</option>
          <option value="90">3 derniers mois</option>
          <option value="365">12 derniers mois</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={selectClass}
        >
          <option value="all">Tous les statuts</option>
          <option value="authorized">Autorisés</option>
          <option value="captured">Capturés</option>
          <option value="failed">Échoués</option>
          <option value="refunded">Remboursés</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Revenu total" value={formatCents(stats.totalRevenue)} />
        <StatCard label="Commission (12%)" value={formatCents(stats.totalCommission)} />
        <StatCard label="Abonnements" value={formatEuros(stats.subscriptionRevenue)} />
        <StatCard
          label="Rendez-vous"
          value={stats.completedAppointments}
          hint={`/ ${stats.totalAppointments} total`}
        />
      </div>

      {/* Indicateurs secondaires */}
      {(stats.pendingPayments > 0 || stats.failedPayments > 0 || stats.refundedPayments > 0) && (
        <div className="flex flex-wrap gap-3">
          {stats.pendingPayments > 0 && (
            <Badge variant="warning">{stats.pendingPayments} en attente de capture</Badge>
          )}
          {stats.failedPayments > 0 && (
            <Badge variant="danger">{stats.failedPayments} échoués</Badge>
          )}
          {stats.refundedPayments > 0 && (
            <Badge variant="purple">{stats.refundedPayments} remboursements</Badge>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-admin-surface-dark-2 rounded-lg p-1 max-w-md">
        <button
          onClick={() => setActiveTab('appointments')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'appointments'
              ? 'bg-white dark:bg-admin-surface-dark text-gray-900 dark:text-admin-text-dark shadow-sm'
              : 'text-gray-500 dark:text-admin-muted-dark hover:text-gray-700 dark:hover:text-admin-text-dark'
          }`}
        >
          Rendez-vous ({appointments.length})
        </button>
        <button
          onClick={() => setActiveTab('subscriptions')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'subscriptions'
              ? 'bg-white dark:bg-admin-surface-dark text-gray-900 dark:text-admin-text-dark shadow-sm'
              : 'text-gray-500 dark:text-admin-muted-dark hover:text-gray-700 dark:hover:text-admin-text-dark'
          }`}
        >
          Abonnements ({subscriptionTransactions.length})
        </button>
      </div>

      {/* Appointments table */}
      {activeTab === 'appointments' && (
        <Card padding="none" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-admin-border-dark bg-gray-50 dark:bg-admin-surface-dark-2">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-admin-muted-dark uppercase">Date</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-admin-muted-dark uppercase hidden sm:table-cell">Famille</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-admin-muted-dark uppercase hidden sm:table-cell">Professionnel</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-admin-muted-dark uppercase">Montant</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-admin-muted-dark uppercase hidden md:table-cell">Commission</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-admin-muted-dark uppercase">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-admin-border-dark">
                {appointments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-gray-400 dark:text-admin-muted-dark">
                      Aucune transaction pour cette période
                    </td>
                  </tr>
                ) : (
                  appointments.map((apt) => (
                    <tr key={apt.id} className="hover:bg-gray-50 dark:hover:bg-admin-surface-dark-2 transition-colors">
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900 dark:text-admin-text-dark">
                          {new Date(apt.appointment_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                        </div>
                        <div className="text-xs text-gray-400 dark:text-admin-muted-dark">{apt.start_time?.slice(0, 5)}</div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className="text-sm text-gray-700 dark:text-admin-muted-dark">{apt.family_name}</span>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className="text-sm text-gray-700 dark:text-admin-muted-dark">{apt.educator_name}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-semibold text-gray-900 dark:text-admin-text-dark">
                          {formatCents(apt.price || 0)}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                          {formatCents(apt.platform_commission || 0)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(apt.payment_status || apt.status)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Subscriptions table */}
      {activeTab === 'subscriptions' && (
        <Card padding="none" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-admin-border-dark bg-gray-50 dark:bg-admin-surface-dark-2">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-admin-muted-dark uppercase">Date</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-admin-muted-dark uppercase">Description</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-admin-muted-dark uppercase">Montant</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-admin-muted-dark uppercase">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-admin-border-dark">
                {subscriptionTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-12 text-center text-gray-400 dark:text-admin-muted-dark">
                      Aucune transaction d&apos;abonnement pour cette période
                    </td>
                  </tr>
                ) : (
                  subscriptionTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-admin-surface-dark-2 transition-colors">
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-900 dark:text-admin-text-dark">
                          {new Date(tx.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-700 dark:text-admin-muted-dark">{tx.description}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-semibold text-gray-900 dark:text-admin-text-dark">
                          {formatEuros(tx.amount)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(tx.status)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
