import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Créer un client admin avec le service role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    // Récupérer le token depuis l'en-tête Authorization
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');

    // Vérifier l'authentification avec le client admin
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      console.error('Erreur auth:', userError);
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const body = await request.json();
    const { educatorId, videoUrl, videoDuration } = body;

    if (!educatorId) {
      return NextResponse.json({ error: 'ID éducateur manquant' }, { status: 400 });
    }

    // Vérifier que l'utilisateur est bien le propriétaire du profil
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('educator_profiles')
      .select('id, user_id')
      .eq('id', educatorId)
      .single();

    if (profileError || !profile) {
      console.error('Erreur profil:', profileError);
      return NextResponse.json({ error: 'Profil non trouvé' }, { status: 404 });
    }

    if (profile.user_id !== user.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    // Mettre à jour la vidéo avec le client admin (bypass RLS)
    const { error: updateError } = await supabaseAdmin
      .from('educator_profiles')
      .update({
        video_presentation_url: videoUrl,
        video_duration_seconds: videoDuration ? Math.floor(videoDuration) : null,
        video_uploaded_at: videoUrl ? new Date().toISOString() : null
      })
      .eq('id', educatorId);

    if (updateError) {
      console.error('Erreur mise à jour vidéo:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Erreur API update-video:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
