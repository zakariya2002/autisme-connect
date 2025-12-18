import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 30%, #4c1d95 60%, #5b21b6 100%)',
          padding: '40px 80px',
        }}
      >
        {/* Partie gauche - Logo et nom (aligné en haut) */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'flex-start',
            alignSelf: 'flex-start',
            gap: '20px',
            marginTop: '10px',
          }}
        >
          {/* Logo en haut */}
          <div
            style={{
              width: '100px',
              height: '100px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '20px',
              border: '2px solid rgba(255,255,255,0.2)',
            }}
          >
            <svg
              viewBox="0 0 40 40"
              width="65"
              height="65"
              fill="none"
            >
              <circle
                cx="20"
                cy="20"
                r="16"
                stroke="#a78bfa"
                strokeWidth="3.5"
                fill="none"
              />
              <path
                d="M9 20 L12 20 Q14 20 15 12 Q16 8 17 12 L20 20 L23 28 Q24 32 25 28 Q26 20 28 20 L31 20"
                stroke="#60a5fa"
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
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}
          >
            <div
              style={{
                fontSize: 56,
                color: 'white',
                fontWeight: 'bold',
                letterSpacing: '-2px',
              }}
            >
              neurocare
            </div>
            <div
              style={{
                fontSize: 16,
                color: '#a78bfa',
                fontWeight: '600',
                letterSpacing: '3px',
              }}
            >
              CONNECT • CARE • GROW
            </div>
          </div>
        </div>

        {/* Partie centrale - Message principal (centré) */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                fontSize: 36,
                color: 'white',
                fontWeight: '700',
              }}
            >
              Professionnels du
            </div>
            <div
              style={{
                fontSize: 46,
                color: '#a78bfa',
                fontWeight: '800',
              }}
            >
              Neuro Développement
            </div>
          </div>

          {/* Badges des professionnels */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              gap: '12px',
            }}
          >
            <div
              style={{
                display: 'flex',
                background: 'rgba(139, 92, 246, 0.3)',
                color: 'white',
                padding: '10px 20px',
                borderRadius: '50px',
                fontSize: 18,
                fontWeight: '600',
                border: '1px solid rgba(139, 92, 246, 0.5)',
              }}
            >
              Psychologues
            </div>
            <div
              style={{
                display: 'flex',
                background: 'rgba(59, 130, 246, 0.3)',
                color: 'white',
                padding: '10px 20px',
                borderRadius: '50px',
                fontSize: 18,
                fontWeight: '600',
                border: '1px solid rgba(59, 130, 246, 0.5)',
              }}
            >
              Orthophonistes
            </div>
            <div
              style={{
                display: 'flex',
                background: 'rgba(6, 182, 212, 0.3)',
                color: 'white',
                padding: '10px 20px',
                borderRadius: '50px',
                fontSize: 18,
                fontWeight: '600',
                border: '1px solid rgba(6, 182, 212, 0.5)',
              }}
            >
              Psychomotriciens
            </div>
            <div
              style={{
                display: 'flex',
                background: 'rgba(16, 185, 129, 0.3)',
                color: 'white',
                padding: '10px 20px',
                borderRadius: '50px',
                fontSize: 18,
                fontWeight: '600',
                border: '1px solid rgba(16, 185, 129, 0.5)',
              }}
            >
              Ergothérapeutes
            </div>
          </div>
        </div>

        {/* Partie droite - CTA (centré) */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: '14px',
          }}
        >
          <div
            style={{
              display: 'flex',
              background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
              color: 'white',
              padding: '18px 36px',
              borderRadius: '14px',
              fontSize: 22,
              fontWeight: '700',
            }}
          >
            Rejoignez-nous
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 20,
              color: 'rgba(255,255,255,0.7)',
              fontWeight: '500',
            }}
          >
            neuro-care.fr
          </div>
        </div>
      </div>
    ),
    {
      width: 1584,
      height: 396,
    }
  )
}
