import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendPasswordResetEmail } from '@/lib/email';
import crypto from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email requis' },
        { status: 400 }
      );
    }

    // Vérifier si l'utilisateur existe
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();

    if (authError) {
      console.error('Erreur recherche utilisateur:', authError);
      return NextResponse.json(
        { error: 'Erreur serveur' },
        { status: 500 }
      );
    }

    const user = authUsers.users.find(u => u.email?.toLowerCase() === email.toLowerCase());

    if (!user) {
      // Pour des raisons de sécurité, on ne révèle pas si l'email existe ou non
      return NextResponse.json({
        success: true,
        message: 'Si un compte existe avec cet email, vous recevrez un lien de réinitialisation.'
      });
    }

    // Récupérer le prénom de l'utilisateur depuis les profils
    let firstName = 'Utilisateur';

    // Chercher dans educator_profiles
    const { data: educatorProfile } = await supabase
      .from('educator_profiles')
      .select('first_name')
      .eq('user_id', user.id)
      .single();

    if (educatorProfile?.first_name) {
      firstName = educatorProfile.first_name;
    } else {
      // Chercher dans family_profiles
      const { data: familyProfile } = await supabase
        .from('family_profiles')
        .select('first_name')
        .eq('user_id', user.id)
        .single();

      if (familyProfile?.first_name) {
        firstName = familyProfile.first_name;
      }
    }

    // Générer un token unique
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 heure

    // Supprimer les anciens tokens pour cet utilisateur
    await supabase
      .from('password_reset_tokens')
      .delete()
      .eq('user_id', user.id);

    // Sauvegarder le nouveau token
    const { error: insertError } = await supabase
      .from('password_reset_tokens')
      .insert({
        user_id: user.id,
        token,
        expires_at: expiresAt.toISOString(),
      });

    if (insertError) {
      console.error('Erreur création token:', insertError);
      return NextResponse.json(
        { error: 'Erreur serveur' },
        { status: 500 }
      );
    }

    // Créer le lien de réinitialisation
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.neuro-care.fr';
    const resetUrl = `${baseUrl}/auth/reset-password?token=${token}`;

    // Envoyer l'email
    const emailResult = await sendPasswordResetEmail(email, firstName, resetUrl);

    if (!emailResult.success) {
      console.error('Erreur envoi email:', emailResult.error);
      return NextResponse.json(
        { error: 'Erreur lors de l\'envoi de l\'email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Si un compte existe avec cet email, vous recevrez un lien de réinitialisation.'
    });

  } catch (error) {
    console.error('Erreur reset-password:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
