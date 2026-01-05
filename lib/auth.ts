import { supabase } from './supabase';
import { UserRole } from '@/types';

export async function signUp(email: string, password: string, role: UserRole) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role,
      },
    },
  });

  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${typeof window !== 'undefined' ? window.location.origin : 'https://neuro-care.fr'}/auth/callback`,
    },
  });

  if (error) throw error;
  return data;
}

export async function signOut() {
  try {
    // Déconnexion globale (supprime la session côté serveur et local)
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Erreur lors de la déconnexion:', error);
      // En cas d'erreur, forcer la déconnexion locale
      await supabase.auth.signOut({ scope: 'local' });
    }
  } catch (err) {
    // En cas d'erreur, forcer la déconnexion locale
    console.error('Erreur lors de la déconnexion:', err);
    try {
      await supabase.auth.signOut({ scope: 'local' });
    } catch {
      // Ignorer
    }
  }

  // Nettoyer aussi le localStorage Supabase pour être sûr
  if (typeof window !== 'undefined') {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('sb-')) {
        localStorage.removeItem(key);
      }
    });
  }
}

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
}

export async function getUserRole(): Promise<UserRole | null> {
  const user = await getCurrentUser();
  return user?.user_metadata?.role || null;
}

export async function resetPassword(email: string) {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://neuro-care.fr';

  const response = await fetch(`${baseUrl}/api/auth/reset-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Erreur lors de la réinitialisation');
  }

  return data;
}

export async function updatePassword(newPassword: string) {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) throw error;
  return data;
}
