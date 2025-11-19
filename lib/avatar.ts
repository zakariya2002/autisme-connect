import { supabase } from './supabase';

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

/**
 * Valide un fichier image pour l'avatar
 */
export function validateAvatarFile(file: File): { valid: boolean; error?: string } {
  // Vérifier le type de fichier
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Format de fichier non supporté. Utilisez JPG, PNG ou WEBP.',
    };
  }

  // Vérifier la taille du fichier
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: 'Le fichier est trop volumineux. Maximum: 2MB.',
    };
  }

  return { valid: true };
}

/**
 * Upload un avatar vers Supabase Storage
 */
export async function uploadAvatar(
  file: File,
  userId: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    // Valider le fichier
    const validation = validateAvatarFile(file);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // Générer un nom de fichier unique
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;

    // Uploader le fichier
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Erreur upload:', error);
      return { success: false, error: error.message };
    }

    // Obtenir l'URL publique
    const { data: publicUrlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(data.path);

    return {
      success: true,
      url: publicUrlData.publicUrl,
    };
  } catch (error: any) {
    console.error('Erreur upload avatar:', error);
    return {
      success: false,
      error: error.message || 'Erreur lors de l\'upload',
    };
  }
}

/**
 * Supprime un avatar de Supabase Storage
 */
export async function deleteAvatar(
  avatarUrl: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Extraire le chemin du fichier depuis l'URL
    const urlParts = avatarUrl.split('/avatars/');
    if (urlParts.length < 2) {
      return { success: false, error: 'URL invalide' };
    }

    const filePath = urlParts[1];

    // Supprimer le fichier
    const { error } = await supabase.storage
      .from('avatars')
      .remove([filePath]);

    if (error) {
      console.error('Erreur suppression:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Erreur suppression avatar:', error);
    return {
      success: false,
      error: error.message || 'Erreur lors de la suppression',
    };
  }
}

/**
 * Met à jour l'avatar dans le profil
 */
export async function updateProfileAvatar(
  profileType: 'educator' | 'family',
  userId: string,
  avatarUrl: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const tableName = profileType === 'educator' ? 'educator_profiles' : 'family_profiles';

    const { error } = await supabase
      .from(tableName)
      .update({
        avatar_url: avatarUrl,
        avatar_moderation_status: 'pending', // Statut en attente de modération
      })
      .eq('user_id', userId);

    if (error) {
      console.error('Erreur mise à jour profil:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Erreur update avatar profil:', error);
    return {
      success: false,
      error: error.message || 'Erreur lors de la mise à jour',
    };
  }
}

/**
 * Récupère le statut de modération d'un avatar
 */
export async function getAvatarModerationStatus(
  profileType: 'educator' | 'family',
  userId: string
): Promise<{
  status: 'pending' | 'approved' | 'rejected' | null;
  reason?: string;
}> {
  try {
    const tableName = profileType === 'educator' ? 'educator_profiles' : 'family_profiles';

    const { data, error } = await supabase
      .from(tableName)
      .select('avatar_moderation_status, avatar_moderation_reason')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      return { status: null };
    }

    return {
      status: data.avatar_moderation_status,
      reason: data.avatar_moderation_reason,
    };
  } catch (error) {
    console.error('Erreur récupération statut modération:', error);
    return { status: null };
  }
}
