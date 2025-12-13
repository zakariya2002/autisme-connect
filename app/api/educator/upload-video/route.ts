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

    // Vérifier l'authentification de l'utilisateur
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      console.error('Erreur auth:', userError);
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Récupérer le formData
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const educatorId = formData.get('educatorId') as string;

    if (!file || !educatorId) {
      return NextResponse.json({ error: 'Fichier ou ID manquant' }, { status: 400 });
    }

    // Vérifier que l'utilisateur est bien le propriétaire du profil
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('educator_profiles')
      .select('id, user_id, video_presentation_url')
      .eq('id', educatorId)
      .single();

    if (profileError || !profile) {
      console.error('Erreur profil:', profileError);
      return NextResponse.json({ error: 'Profil non trouvé' }, { status: 404 });
    }

    if (profile.user_id !== user.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    // Supprimer l'ancienne vidéo si elle existe
    if (profile.video_presentation_url) {
      const urlParts = profile.video_presentation_url.split('/educator-videos/');
      if (urlParts.length > 1) {
        const oldFilePath = urlParts[1];
        await supabaseAdmin.storage.from('educator-videos').remove([oldFilePath]);
      }
    }

    // Générer un nom de fichier unique
    const fileExt = file.name.split('.').pop();
    const fileName = `${educatorId}/presentation-${Date.now()}.${fileExt}`;

    // Convertir le fichier en ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // Upload vers Supabase Storage avec le client admin
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('educator-videos')
      .upload(fileName, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) {
      console.error('Erreur upload:', uploadError);
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    // Obtenir l'URL publique
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('educator-videos')
      .getPublicUrl(fileName);

    return NextResponse.json({
      success: true,
      url: publicUrl,
      path: fileName
    });
  } catch (error: any) {
    console.error('Erreur API upload-video:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
