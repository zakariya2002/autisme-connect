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
            marginBottom: '32px',
          }}
        >
          <div
            style={{
              fontSize: 120,
              background: 'white',
              color: '#3b82f6',
              padding: '24px 48px',
              borderRadius: '24px',
              fontWeight: 'bold',
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
          }}
        >
          Autisme Connect
        </div>
        <div
          style={{
            fontSize: 36,
            color: 'rgba(255,255,255,0.9)',
            textAlign: 'center',
            maxWidth: '900px',
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
