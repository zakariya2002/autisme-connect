import { NextRequest, NextResponse } from 'next/server';
import { assertAdmin } from '@/lib/assert-admin';
import {
  getRelanceJ1Email,
  getRelanceJ3Email,
  getRelanceJ7Email,
} from '@/lib/email-templates/relance-documents';

export const dynamic = 'force-dynamic';

const templateFns: Record<string, (name: string, docs: number) => string> = {
  j1: getRelanceJ1Email,
  j3: getRelanceJ3Email,
  j7: getRelanceJ7Email,
};

export async function GET(request: NextRequest) {
  const { error: authError } = await assertAdmin();
  if (authError) return authError;

  const template = request.nextUrl.searchParams.get('template') || 'j1';
  const fn = templateFns[template];

  if (!fn) {
    return NextResponse.json({ error: 'Template invalide' }, { status: 400 });
  }

  // Generate preview with example data
  const html = fn('Prenom', 0);

  return NextResponse.json({ html });
}
