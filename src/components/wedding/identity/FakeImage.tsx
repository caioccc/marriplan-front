import React from 'react';

interface FakeImageProps {
  color?: string;
  imageUrl?: string;
  emoji: string;
  h?: number;
  aspectRatio?: string;
  label?: string;
  style?: React.CSSProperties;
}

const FakeImage: React.FC<FakeImageProps> = ({ color, imageUrl, emoji, h, aspectRatio, label, style = {} }) => (
  <div
    style={{
      background: color ?? 'linear-gradient(135deg, #f5ede5 0%, #ede0d0 100%)',
      height: h,
      aspectRatio,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 32,
      gap: 6,
      position: 'relative',
      overflow: 'hidden',
      width: '100%',
      ...style,
    }}
  >
    {imageUrl && (
      <>
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${imageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.14) 100%)',
          }}
        />
      </>
    )}
    <span>{emoji}</span>
    {label && <span style={{ fontSize: 10, color: 'rgba(44,36,32,0.4)', fontWeight: 600, letterSpacing: 1 }}>{label}</span>}
  </div>
);

export default FakeImage;
