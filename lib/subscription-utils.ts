import { supabase } from '@/lib/supabase';

/**
 * Limites pour les plans gratuits
 */
export const FREE_PLAN_LIMITS = {
  MAX_BOOKINGS_PER_MONTH: 3,
  MAX_ACTIVE_CONVERSATIONS: 5,
};

/**
 * Vérifie si un éducateur a un abonnement Premium actif
 */
export async function isEducatorPremium(educatorId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('status')
      .eq('educator_id', educatorId)
      .in('status', ['active', 'trialing'])
      .maybeSingle();

    if (error) {
      console.error('Erreur vérification Premium:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('Erreur vérification Premium:', error);
    return false;
  }
}

/**
 * Compte le nombre de réservations d'un éducateur pour le mois en cours
 */
export async function getEducatorMonthlyBookings(educatorId: string): Promise<number> {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const { count, error } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('educator_id', educatorId)
      .gte('appointment_date', startOfMonth.toISOString().split('T')[0])
      .lte('appointment_date', endOfMonth.toISOString().split('T')[0]);

    if (error) {
      console.error('Erreur comptage réservations:', error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error('Erreur comptage réservations:', error);
    return 0;
  }
}

/**
 * Compte le nombre de conversations actives d'un éducateur
 */
export async function getEducatorActiveConversations(educatorId: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('conversations')
      .select('*', { count: 'exact', head: true })
      .eq('educator_id', educatorId);

    if (error) {
      console.error('Erreur comptage conversations:', error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error('Erreur comptage conversations:', error);
    return 0;
  }
}

/**
 * Vérifie si un éducateur peut créer une nouvelle réservation
 */
export async function canEducatorCreateBooking(educatorId: string): Promise<{
  canCreate: boolean;
  reason?: string;
  current?: number;
  limit?: number;
}> {
  const isPremium = await isEducatorPremium(educatorId);

  if (isPremium) {
    return { canCreate: true };
  }

  const currentBookings = await getEducatorMonthlyBookings(educatorId);

  if (currentBookings >= FREE_PLAN_LIMITS.MAX_BOOKINGS_PER_MONTH) {
    return {
      canCreate: false,
      reason: 'Limite de réservations mensuelles atteinte',
      current: currentBookings,
      limit: FREE_PLAN_LIMITS.MAX_BOOKINGS_PER_MONTH,
    };
  }

  return {
    canCreate: true,
    current: currentBookings,
    limit: FREE_PLAN_LIMITS.MAX_BOOKINGS_PER_MONTH,
  };
}

/**
 * Vérifie si un éducateur peut créer une nouvelle conversation
 */
export async function canEducatorCreateConversation(educatorId: string): Promise<{
  canCreate: boolean;
  reason?: string;
  current?: number;
  limit?: number;
}> {
  const isPremium = await isEducatorPremium(educatorId);

  if (isPremium) {
    return { canCreate: true };
  }

  const currentConversations = await getEducatorActiveConversations(educatorId);

  if (currentConversations >= FREE_PLAN_LIMITS.MAX_ACTIVE_CONVERSATIONS) {
    return {
      canCreate: false,
      reason: 'Limite de conversations actives atteinte',
      current: currentConversations,
      limit: FREE_PLAN_LIMITS.MAX_ACTIVE_CONVERSATIONS,
    };
  }

  return {
    canCreate: true,
    current: currentConversations,
    limit: FREE_PLAN_LIMITS.MAX_ACTIVE_CONVERSATIONS,
  };
}

/**
 * Récupère les statistiques d'utilisation d'un éducateur
 */
export async function getEducatorUsageStats(educatorId: string): Promise<{
  isPremium: boolean;
  bookings: {
    current: number;
    limit: number | null;
  };
  conversations: {
    current: number;
    limit: number | null;
  };
}> {
  const isPremium = await isEducatorPremium(educatorId);
  const currentBookings = await getEducatorMonthlyBookings(educatorId);
  const currentConversations = await getEducatorActiveConversations(educatorId);

  return {
    isPremium,
    bookings: {
      current: currentBookings,
      limit: isPremium ? null : FREE_PLAN_LIMITS.MAX_BOOKINGS_PER_MONTH,
    },
    conversations: {
      current: currentConversations,
      limit: isPremium ? null : FREE_PLAN_LIMITS.MAX_ACTIVE_CONVERSATIONS,
    },
  };
}
