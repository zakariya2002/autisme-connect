import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { assertAdmin } from '@/lib/assert-admin';
import Anthropic from '@anthropic-ai/sdk';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const DOCUMENT_PROMPTS: Record<string, string> = {
  diploma: `Tu es un expert en vérification de documents officiels français.

Analyse ce document qui est censé être un DIPLÔME d'éducateur spécialisé, moniteur éducateur, psychologue, ou autre profession du secteur médico-social.

Fournis une analyse structurée :

1. **Type de document** : Est-ce bien un diplôme ? Si non, quel type de document est-ce ?
2. **Informations extraites** : Nom du titulaire, intitulé du diplôme, établissement, date de délivrance, numéro de diplôme (si visible)
3. **Authenticité** : Y a-t-il des signes suspects ?
   - Incohérences de police ou de mise en page
   - Zones floues ou retouchées suspectes
   - Qualité générale du document (scan, photo, copie)
   - Présence de tampons/signatures officiels
4. **Niveau de confiance** : Note de 1 à 10 (1 = très suspect, 10 = semble authentique)
5. **Recommandation** : VALIDER / VÉRIFIER MANUELLEMENT / REJETER
6. **Remarques** : Tout élément notable

Sois factuel et précis. En cas de doute, recommande une vérification manuelle.`,

  criminal_record: `Tu es un expert en vérification de documents officiels français.

Analyse ce document qui est censé être un CASIER JUDICIAIRE (bulletin n°3 - B3).

Fournis une analyse structurée :

1. **Type de document** : Est-ce bien un extrait de casier judiciaire B3 ? Présence du titre officiel "Bulletin n°3 du casier judiciaire" ?
2. **Informations extraites** : Nom, prénom, date de naissance, mention "NÉANT" ou contenu
3. **Date du document** : Est-il récent (moins de 3 mois) ?
4. **Authenticité** : Signes suspects ?
   - Format officiel respecté (en-tête République Française, Ministère de la Justice)
   - Incohérences visuelles
   - Présence du cachet/signature
5. **Niveau de confiance** : Note de 1 à 10
6. **Recommandation** : VALIDER / VÉRIFIER MANUELLEMENT / REJETER
7. **Remarques**`,

  id_card: `Tu es un expert en vérification de documents d'identité français.

Analyse ce document qui est censé être une PIÈCE D'IDENTITÉ (CNI ou passeport français).

Fournis une analyse structurée :

1. **Type de document** : CNI, passeport, titre de séjour, ou autre ?
2. **Informations extraites** : Nom, prénom, date de naissance, date d'expiration (si visible)
3. **Validité** : Le document semble-t-il en cours de validité ?
4. **Authenticité** : Signes suspects ?
   - Format officiel respecté
   - Photo cohérente
   - Zones modifiées visibles
   - Qualité du scan/photo
5. **Niveau de confiance** : Note de 1 à 10
6. **Recommandation** : VALIDER / VÉRIFIER MANUELLEMENT / REJETER
7. **Remarques**

IMPORTANT : Ne reproduis JAMAIS les numéros complets du document. Masque les données sensibles dans ta réponse (ex: numéro de CNI → "****1234").`,

  insurance: `Tu es un expert en vérification de documents professionnels français.

Analyse ce document qui est censé être une ATTESTATION D'ASSURANCE RESPONSABILITÉ CIVILE PROFESSIONNELLE (RC Pro).

Fournis une analyse structurée :

1. **Type de document** : Est-ce bien une attestation d'assurance RC Pro ?
2. **Informations extraites** : Assureur, numéro de contrat (partiellement masqué), période de validité, activité couverte
3. **Validité** : L'attestation est-elle en cours de validité ?
4. **Authenticité** : Signes suspects ?
   - Format professionnel d'assureur
   - Présence du logo de l'assureur
   - Cohérence des informations
5. **Niveau de confiance** : Note de 1 à 10
6. **Recommandation** : VALIDER / VÉRIFIER MANUELLEMENT / REJETER
7. **Remarques**`,
};

export async function POST(request: NextRequest) {
  const { error: authError } = await assertAdmin();
  if (authError) return authError;

  try {
    const { documentType, fileUrl } = await request.json();

    if (!documentType || !fileUrl) {
      return NextResponse.json({ error: 'documentType et fileUrl requis' }, { status: 400 });
    }

    // Download the file from Supabase storage
    const bucket = documentType === 'diploma' ? 'diplomas' : 'verification-documents';
    const { data: fileData, error: downloadError } = await supabase.storage
      .from(bucket)
      .download(fileUrl);

    if (downloadError || !fileData) {
      return NextResponse.json({ error: 'Impossible de télécharger le document' }, { status: 404 });
    }

    // Convert to base64
    const buffer = Buffer.from(await fileData.arrayBuffer());
    const base64 = buffer.toString('base64');

    // Determine media type
    const ext = fileUrl.split('.').pop()?.toLowerCase();
    let mediaType: 'image/jpeg' | 'image/png' | 'image/webp' | 'application/pdf' = 'image/jpeg';
    if (ext === 'png') mediaType = 'image/png';
    else if (ext === 'pdf') mediaType = 'application/pdf';
    else if (ext === 'webp') mediaType = 'image/webp';

    const prompt = DOCUMENT_PROMPTS[documentType] || DOCUMENT_PROMPTS.diploma;

    // Call Claude Vision
    const imageMediaType = mediaType === 'application/pdf' ? 'image/png' : mediaType;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: imageMediaType, data: base64 },
          },
          { type: 'text', text: prompt },
        ],
      }],
    });

    const analysisText = response.content
      .filter((block: any) => block.type === 'text')
      .map((block: any) => block.text)
      .join('\n');

    // Extract confidence score from the analysis
    const confidenceMatch = analysisText.match(/(?:confiance|note)\s*:?\s*(\d{1,2})\s*(?:\/\s*10|sur\s*10)/i);
    const confidenceScore = confidenceMatch ? parseInt(confidenceMatch[1]) : null;

    // Extract recommendation
    let recommendation: 'validate' | 'manual_check' | 'reject' = 'manual_check';
    if (/VALIDER/i.test(analysisText) && !/REJETER/i.test(analysisText)) {
      recommendation = 'validate';
    } else if (/REJETER/i.test(analysisText)) {
      recommendation = 'reject';
    }

    return NextResponse.json({
      analysis: analysisText,
      confidenceScore,
      recommendation,
      analyzedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Claude Vision analysis error:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de l\'analyse' },
      { status: 500 }
    );
  }
}
