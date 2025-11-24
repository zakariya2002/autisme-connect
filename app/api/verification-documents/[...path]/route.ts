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

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    // Reconstruire le chemin complet du fichier (ex: "user_id/timestamp.pdf")
    const filePath = params.path.join('/');

    // Télécharger le fichier depuis Supabase Storage avec les droits admin
    const { data, error } = await supabaseAdmin.storage
      .from('verification-documents')
      .download(filePath);

    if (error) {
      console.error('Storage download error:', error);
      return NextResponse.json(
        { error: 'Failed to download file', details: error },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    // Déterminer le type MIME
    const contentType = data.type || 'application/octet-stream';

    // Extraire le nom du fichier pour l'en-tête Content-Disposition
    const fileName = filePath.split('/').pop() || 'document';

    // Retourner le fichier
    return new NextResponse(data, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error },
      { status: 500 }
    );
  }
}
