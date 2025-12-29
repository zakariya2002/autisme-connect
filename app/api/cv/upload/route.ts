import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Client Supabase avec service role pour bypasser RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function POST(request: NextRequest) {
  try {
    // Vérifier le token d'authentification
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token d\'authentification manquant' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');

    // Vérifier le token avec Supabase
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Token invalide', details: authError },
        { status: 401 }
      );
    }

    // Récupérer le FormData
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'Fichier manquant' },
        { status: 400 }
      );
    }

    // Vérifier que c'est un PDF
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Seuls les fichiers PDF sont acceptés' },
        { status: 400 }
      );
    }

    // Créer le nom du fichier
    const fileName = `${user.id}/cv-${Date.now()}.pdf`;

    // Convertir le fichier en ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload vers Supabase Storage (bucket cv)
    const { data, error: uploadError } = await supabaseAdmin.storage
      .from('cv')
      .upload(fileName, buffer, {
        contentType: 'application/pdf',
        upsert: true
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return NextResponse.json(
        { error: 'Erreur lors de l\'upload', details: uploadError },
        { status: 500 }
      );
    }

    // Mettre à jour le profil éducateur avec l'URL du CV
    const { error: updateError } = await supabaseAdmin
      .from('educator_profiles')
      .update({ cv_url: fileName })
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Profile update error:', updateError);
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour du profil', details: updateError },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      path: fileName,
      data
    });

  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur', details: error },
      { status: 500 }
    );
  }
}
