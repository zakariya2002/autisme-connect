import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email requis' },
        { status: 400 }
      );
    }

    // Confirmer l'email de l'utilisateur
    const { data: user, error: userError } = await supabase.auth.admin.listUsers();

    if (userError) {
      console.error('Erreur liste users:', userError);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des utilisateurs' },
        { status: 500 }
      );
    }

    const targetUser = user.users.find(u => u.email === email);

    if (!targetUser) {
      return NextResponse.json(
        { error: 'Utilisateur introuvable' },
        { status: 404 }
      );
    }

    // Confirmer l'email
    const { error: confirmError } = await supabase.auth.admin.updateUserById(
      targetUser.id,
      { email_confirm: true }
    );

    if (confirmError) {
      console.error('Erreur confirmation email:', confirmError);
      return NextResponse.json(
        { error: 'Erreur lors de la confirmation de l\'email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Email confirmé avec succès',
      userId: targetUser.id
    });

  } catch (error: any) {
    console.error('Erreur:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la confirmation de l\'email' },
      { status: 500 }
    );
  }
}
