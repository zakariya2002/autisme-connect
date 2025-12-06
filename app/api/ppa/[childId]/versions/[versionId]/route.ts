import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// GET - Récupérer une version spécifique du PPA
export async function GET(
  request: NextRequest,
  { params }: { params: { childId: string; versionId: string } }
) {
  try {
    const { childId, versionId } = params;

    const { data: version, error } = await supabase
      .from('child_ppa_versions')
      .select('*')
      .eq('id', versionId)
      .eq('child_id', childId)
      .single();

    if (error) {
      console.error('Error fetching PPA version:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!version) {
      return NextResponse.json({ error: 'Version non trouvée' }, { status: 404 });
    }

    return NextResponse.json({ version });
  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Supprimer une version
export async function DELETE(
  request: NextRequest,
  { params }: { params: { childId: string; versionId: string } }
) {
  try {
    const { childId, versionId } = params;

    const { error } = await supabase
      .from('child_ppa_versions')
      .delete()
      .eq('id', versionId)
      .eq('child_id', childId);

    if (error) {
      console.error('Error deleting PPA version:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Version supprimée' });
  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
