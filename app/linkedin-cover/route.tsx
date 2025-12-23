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
          background: 'linear-gradient(135deg, #025959 0%, #027e7e 50%, #039999 100%)',
          padding: '40px 80px',
        }}
      >
        {/* Partie gauche - Logo */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            alignSelf: 'flex-start',
            marginTop: '10px',
          }}
        >
          {/* Logo neurocare avec icône */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <div
              style={{
                display: 'flex',
                fontSize: 52,
                letterSpacing: '-1px',
              }}
            >
              <span style={{ color: 'white', fontWeight: '300' }}>neuro</span>
              <span style={{ color: 'white', fontWeight: '500' }}>care</span>
            </div>
            {/* Icône cercles interconnectés */}
            <svg
              viewBox="0 0 50 50"
              width="40"
              height="40"
              fill="none"
            >
              <circle cx="15" cy="15" r="6" stroke="white" strokeWidth="2" fill="none" />
              <circle cx="35" cy="13" r="5" stroke="white" strokeWidth="2" fill="none" />
              <circle cx="12" cy="35" r="5" stroke="white" strokeWidth="2" fill="none" />
              <circle cx="38" cy="35" r="6" stroke="white" strokeWidth="2" fill="none" />
              <circle cx="25" cy="26" r="4" stroke="white" strokeWidth="2" fill="none" />
              <line x1="20" y1="17" x2="30" y2="13" stroke="white" strokeWidth="1.5" />
              <line x1="14" y1="21" x2="22" y2="23" stroke="white" strokeWidth="1.5" />
              <line x1="15" y1="30" x2="22" y2="27" stroke="white" strokeWidth="1.5" />
              <line x1="29" y1="27" x2="34" y2="30" stroke="white" strokeWidth="1.5" />
              <line x1="38" y1="20" x2="30" y2="24" stroke="white" strokeWidth="1.5" />
            </svg>
          </div>
          <div
            style={{
              fontSize: 12,
              color: '#b8e6e6',
              fontWeight: '500',
              letterSpacing: '3px',
              marginTop: '4px',
            }}
          >
            CONNECT • CARE • GROW
          </div>
        </div>

        {/* Partie centrale - Message principal */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '24px',
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
                fontSize: 30,
                color: 'white',
                fontWeight: '300',
              }}
            >
              Professionnels du
            </div>
            <div
              style={{
                fontSize: 42,
                color: 'white',
                fontWeight: '600',
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
                background: 'rgba(253, 249, 244, 0.95)',
                color: '#027e7e',
                padding: '10px 22px',
                borderRadius: '50px',
                fontSize: 16,
                fontWeight: '600',
              }}
            >
              Psychologues
            </div>
            <div
              style={{
                display: 'flex',
                background: 'rgba(253, 249, 244, 0.95)',
                color: '#027e7e',
                padding: '10px 22px',
                borderRadius: '50px',
                fontSize: 16,
                fontWeight: '600',
              }}
            >
              Orthophonistes
            </div>
            <div
              style={{
                display: 'flex',
                background: 'rgba(253, 249, 244, 0.95)',
                color: '#027e7e',
                padding: '10px 22px',
                borderRadius: '50px',
                fontSize: 16,
                fontWeight: '600',
              }}
            >
              Psychomotriciens
            </div>
            <div
              style={{
                display: 'flex',
                background: 'rgba(253, 249, 244, 0.95)',
                color: '#027e7e',
                padding: '10px 22px',
                borderRadius: '50px',
                fontSize: 16,
                fontWeight: '600',
              }}
            >
              Ergothérapeutes
            </div>
          </div>
        </div>

        {/* Partie droite - CTA */}
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
              background: '#fdf9f4',
              color: '#027e7e',
              padding: '16px 32px',
              borderRadius: '12px',
              fontSize: 20,
              fontWeight: '700',
            }}
          >
            Rejoignez-nous
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 17,
              color: 'rgba(255, 255, 255, 0.9)',
              fontWeight: '400',
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
