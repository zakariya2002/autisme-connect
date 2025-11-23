import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'Autisme Connect - Éducateurs Spécialisés en Autisme'
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
          background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
          fontSize: 60,
          fontWeight: 700,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '24px',
            marginBottom: '40px',
          }}
        >
          <div
            style={{
              fontSize: 120,
              background: 'white',
              color: '#3b82f6',
              width: '200px',
              height: '200px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              fontWeight: 'bold',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)',
            }}
          >
            AC
          </div>
        </div>
        <div
          style={{
            fontSize: 72,
            color: 'white',
            textAlign: 'center',
            marginBottom: '16px',
            fontWeight: 'bold',
          }}
        >
          Autisme Connect
        </div>
        <div
          style={{
            fontSize: 36,
            color: 'rgba(255,255,255,0.95)',
            textAlign: 'center',
            maxWidth: '900px',
            fontWeight: '500',
          }}
        >
          Trouvez un éducateur spécialisé en autisme près de chez vous
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
