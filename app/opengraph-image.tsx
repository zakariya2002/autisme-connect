import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'neurocare - Professionnels du Neuro Développement'
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 50%, #3b82f6 100%)',
          padding: '40px',
        }}
      >
        {/* Logo avec texte */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            marginBottom: '40px',
          }}
        >
          {/* Logo SVG - onde neurologique */}
          <div
            style={{
              width: '120px',
              height: '120px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg
              viewBox="0 0 40 40"
              width="120"
              height="120"
              fill="none"
            >
              {/* Cercle externe */}
              <circle
                cx="20"
                cy="20"
                r="16"
                stroke="white"
                strokeWidth="3.5"
                fill="none"
              />
              {/* Onde neurologique */}
              <path
                d="M9 20 L12 20 Q14 20 15 12 Q16 8 17 12 L20 20 L23 28 Q24 32 25 28 Q26 20 28 20 L31 20"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          </div>

          {/* Texte neurocare */}
          <div
            style={{
              fontSize: 80,
              color: 'white',
              fontWeight: 'bold',
              letterSpacing: '-2px',
            }}
          >
            neurocare
          </div>
        </div>

        {/* Sous-titre */}
        <div
          style={{
            fontSize: 38,
            color: 'rgba(255,255,255,0.95)',
            textAlign: 'center',
            marginBottom: '40px',
            fontWeight: '600',
          }}
        >
          Professionnels du Neuro Développement
        </div>

        {/* Liste des professionnels */}
        <div
          style={{
            display: 'flex',
            gap: '16px',
            flexWrap: 'wrap',
            justifyContent: 'center',
            maxWidth: '1000px',
          }}
        >
          {['Psychologues', 'Psychomotriciens', 'Orthophonistes', 'Ergothérapeutes', 'Éducateurs'].map((pro) => (
            <div
              key={pro}
              style={{
                background: 'rgba(255,255,255,0.2)',
                color: 'white',
                padding: '12px 28px',
                borderRadius: '50px',
                fontSize: 24,
                fontWeight: '600',
                border: '2px solid rgba(255,255,255,0.3)',
              }}
            >
              {pro}
            </div>
          ))}
        </div>

        {/* Slogan */}
        <div
          style={{
            fontSize: 26,
            color: 'rgba(255,255,255,0.9)',
            textAlign: 'center',
            marginTop: '40px',
            fontWeight: '500',
          }}
        >
          Trouvez des professionnels diplômés et vérifiés près de chez vous
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
