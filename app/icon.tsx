import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const size = {
  width: 32,
  height: 32,
}

export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'white',
        }}
      >
        <div
          style={{
            fontSize: 18,
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            width: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            borderRadius: '50%',
            fontWeight: 'bold',
            boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
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
