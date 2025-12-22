/**
 * Utilitaires d'abonnement - Simplifié
 *
 * Depuis la suppression du système d'abonnement premium,
 * tous les professionnels ont accès à toutes les fonctionnalités.
 * Le modèle économique repose uniquement sur les commissions (12%).
 */

/**
 * Vérifie si un éducateur est "Premium"
 * Retourne toujours true - tous les pros sont premium par défaut
 */
export async function isEducatorPremium(educatorId: string): Promise<boolean> {
  return true;
}

/**
 * Vérifie si un éducateur peut créer une nouvelle réservation
 * Retourne toujours true - pas de limite
 */
export async function canEducatorCreateBooking(educatorId: string): Promise<{
  canCreate: boolean;
  reason?: string;
  current?: number;
  limit?: number;
}> {
  return { canCreate: true };
}

/**
 * Vérifie si un éducateur peut créer une nouvelle conversation
 * Retourne toujours true - pas de limite
 */
export async function canEducatorCreateConversation(educatorId: string): Promise<{
  canCreate: boolean;
  reason?: string;
  current?: number;
  limit?: number;
}> {
  return { canCreate: true };
}

/**
 * Récupère les statistiques d'utilisation d'un éducateur
 * Toujours premium, pas de limites
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
  return {
    isPremium: true,
    bookings: {
      current: 0,
      limit: null,
    },
    conversations: {
      current: 0,
      limit: null,
    },
  };
}
