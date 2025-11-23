import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const size = {
  width: 180,
  height: 180,
}

export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
        }}
      >
        <div
          style={{
            fontSize: 90,
            background: 'white',
            width: '140px',
            height: '140px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#3b82f6',
            borderRadius: '50%',
            fontWeight: 'bold',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          }}
        >
          AC
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
