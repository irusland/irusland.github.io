// Vercel Edge Function to generate PNG
import { ImageResponse } from '@vercel/og';

export const config = {
  runtime: 'edge',
};

export default function handler() {
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
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          fontSize: 32,
          fontWeight: 600,
        }}
      >
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.15)',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '20px',
            padding: '40px 60px',
            textAlign: 'center',
            color: 'white',
            backdropFilter: 'blur(10px)',
          }}
        >
          <div style={{ fontSize: '42px', marginBottom: '10px' }}>
            🌐 irusland
          </div>
          <div style={{ fontSize: '22px', opacity: 0.9, marginBottom: '20px' }}>
            Portfolio & Projects
          </div>
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.25)',
              borderRadius: '25px',
              padding: '10px 20px',
              fontSize: '18px',
              fontWeight: 'bold',
            }}
          >
            irusland.github.io
          </div>
          <div style={{ fontSize: '16px', opacity: 0.8, marginTop: '15px' }}>
            Click to visit website
          </div>
        </div>
      </div>
    ),
    {
      width: 800,
      height: 400,
    }
  );
}