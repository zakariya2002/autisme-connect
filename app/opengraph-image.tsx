import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'Autisme Connect - Professionnels TND & Autisme'
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
          background: 'linear-gradient(135deg, #0d9488 0%, #0891b2 50%, #6366f1 100%)',
          fontSize: 60,
          fontWeight: 700,
          padding: '40px',
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '24px',
            marginBottom: '30px',
          }}
        >
          <div
            style={{
              fontSize: 100,
              background: 'white',
              color: '#0d9488',
              width: '160px',
              height: '160px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              fontWeight: 'bold',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.25)',
            }}
          >
            AC
          </div>
        </div>

        {/* Titre principal */}
        <div
          style={{
            fontSize: 64,
            color: 'white',
            textAlign: 'center',
            marginBottom: '12px',
            fontWeight: 'bold',
            textShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
          }}
        >
          Autisme Connect
        </div>

        {/* Sous-titre TND */}
        <div
          style={{
            fontSize: 32,
            color: 'rgba(255,255,255,0.95)',
            textAlign: 'center',
            marginBottom: '30px',
            fontWeight: '600',
          }}
        >
          Professionnels TND & Autisme
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
                padding: '10px 24px',
                borderRadius: '50px',
                fontSize: 22,
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
            marginTop: '30px',
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
