import { NextRequest, NextResponse } from 'next/server';
import { assertAdmin } from '@/lib/assert-admin';
import Anthropic from '@anthropic-ai/sdk';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // AI generation can take up to 60s

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

/**
 * Search Pexels for a relevant landscape image.
 * Falls back to null if the key is missing or the search fails.
 */
async function searchImage(query: string): Promise<string | null> {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape&size=large`,
      { headers: { Authorization: apiKey } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.photos?.[0]?.src?.large2x || data.photos?.[0]?.src?.large || null;
  } catch {
    return null;
  }
}

const SYSTEM_PROMPT = `Tu es un rédacteur SEO expert en neurodéveloppement (autisme, TDAH, DYS). Tu écris des articles pour NeuroCare, une plateforme française qui met en relation les familles d'enfants neuroatypiques avec des professionnels spécialisés (éducateurs spécialisés, psychologues, orthophonistes, etc.).

## STYLE ET TON
- Français courant, accessible aux parents non-spécialistes
- Ton bienveillant, informatif et rassurant
- Ne jamais donner de conseils médicaux directs, toujours orienter vers des professionnels

## STRUCTURE HTML OBLIGATOIRE
Tu DOIS produire du HTML bien structuré et lisible. Voici les règles :

1. **Paragraphe d'introduction** : un <p> d'accroche en gras ou plus grand qui résume l'article (150-200 mots)
2. **Sections principales** : chaque grande partie utilise un <h2>
3. **Sous-sections** : utilise des <h3> à l'intérieur des sections
4. **Listes à puces** : utilise <ul><li> pour toute énumération (JAMAIS de listes en texte brut)
5. **Mise en valeur** : utilise <strong> pour les termes importants
6. **Encadrés informatifs** : utilise ce format pour les points clés ou conseils :
   <div style="background-color: #f0fdfa; border-left: 4px solid #0d9488; padding: 16px 20px; border-radius: 8px; margin: 24px 0;">
     <p style="font-weight: 600; color: #0f766e; margin: 0 0 8px;">Titre de l'encadré</p>
     <p style="color: #115e59; margin: 0;">Contenu de l'encadré</p>
   </div>
7. **Liens vers des sources officielles** : inclus 2-4 liens vers des sites certifiés français. Utilise ce format :
   <a href="URL" target="_blank" rel="noopener noreferrer" style="color: #0d9488; text-decoration: underline;">texte du lien</a>
   Sources recommandées :
   - HAS (Haute Autorité de Santé) : https://www.has-sante.fr
   - Service-public.fr : https://www.service-public.fr
   - CNSA : https://www.cnsa.fr
   - Autisme Info Service : https://www.autismeinfoservice.fr
   - MDPH : https://mdphenligne.cnsa.fr
   - Ameli.fr : https://www.ameli.fr
   - Education.gouv.fr : https://www.education.gouv.fr
   - Handicap.gouv.fr : https://handicap.gouv.fr

## CONTENU
- Environ 1200 mots (articles denses et utiles)
- Optimisé SEO pour le mot-clé cible
- Mentionner NeuroCare naturellement 1-2 fois max
- Inclure des informations factuelles et vérifiables
- Terminer par une conclusion avec un CTA vers NeuroCare

IMPORTANT : Réponds UNIQUEMENT avec un objet JSON valide, sans texte avant ou après :
{
  "title": "Titre SEO optimisé (max 60 caractères)",
  "metaDescription": "Meta description engageante (max 155 caractères)",
  "keywords": ["mot-clé 1", "mot-clé 2", "mot-clé 3", "mot-clé 4", "mot-clé 5"],
  "content": "<p>Introduction...</p><h2>...</h2>...",
  "imagePrompt": "Description en anglais d'une image illustrative"
}`;

export async function POST(request: NextRequest) {
  const { error: authError } = await assertAdmin();
  if (authError) return authError;

  try {
    const { topic, keyword, secondaryKeywords } = await request.json();

    if (!topic || !keyword) {
      return NextResponse.json(
        { error: 'Le sujet et le mot-clé sont requis' },
        { status: 400 }
      );
    }

    const userPrompt = `Rédige un article SEO complet sur le sujet suivant :

Sujet : ${topic}
Mot-clé principal : ${keyword}
${secondaryKeywords?.length ? `Mots-clés secondaires : ${secondaryKeywords.join(', ')}` : ''}

CONSIGNES :
- Environ 1200 mots, bien structuré avec h2, h3, listes <ul><li>, encadrés colorés
- Inclus 2-4 liens vers des sources officielles françaises (HAS, service-public.fr, ameli.fr, etc.)
- Un encadré "À savoir" ou "Bon à savoir" avec un conseil clé
- Optimisé SEO pour "${keyword}"
- Termine par une conclusion avec mention naturelle de NeuroCare

Réponds UNIQUEMENT avec un objet JSON valide.`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [
        { role: 'user', content: userPrompt },
      ],
    });

    const textContent = response.content.find(
      (block) => block.type === 'text'
    );

    if (!textContent || textContent.type !== 'text') {
      return NextResponse.json(
        { error: 'Aucune réponse textuelle de l\'IA' },
        { status: 500 }
      );
    }

    // Parse the JSON response - handle potential markdown code block wrapping
    let rawText = textContent.text.trim();
    // Remove markdown code fences if present
    if (rawText.startsWith('```')) {
      rawText = rawText.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
    }

    let generated;
    try {
      generated = JSON.parse(rawText);
    } catch {
      console.error('Failed to parse AI response:', rawText.substring(0, 200));
      return NextResponse.json(
        { error: 'Erreur lors du parsing de la réponse IA', raw: rawText.substring(0, 500) },
        { status: 500 }
      );
    }

    // Validate required fields
    if (!generated.title || !generated.content) {
      return NextResponse.json(
        { error: 'Réponse IA incomplète (titre ou contenu manquant)' },
        { status: 500 }
      );
    }

    // Search for a relevant image using keywords
    const imageQuery = generated.keywords?.slice(0, 3).join(' ') || keyword;
    const imageUrl = await searchImage(imageQuery);

    return NextResponse.json({
      title: generated.title,
      metaDescription: generated.metaDescription || '',
      keywords: generated.keywords || [],
      content: generated.content,
      imagePrompt: generated.imagePrompt || '',
      imageUrl: imageUrl || null,
    });
  } catch (error: unknown) {
    console.error('AI generation error:', error);
    const message = error instanceof Error ? error.message : 'Erreur lors de la génération';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
