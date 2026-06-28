import { useMemo } from 'react';

interface ParallaxStarsProps {
  viewport: { x: number, y: number, scale: number };
}

export function ParallaxStars({ viewport }: ParallaxStarsProps) {
  const bgStarsLayer1 = useMemo(() => {
    return Array.from({ length: 150 }).map((_, i) => ({
      id: `bg1-${i}`,
      x: (Math.random() - 0.5) * 4000,
      y: (Math.random() - 0.5) * 3000,
      size: Math.random() * 2 + 1,
      opacity: Math.random() * 0.5 + 0.3
    }));
  }, []);

  const bgStarsLayer2 = useMemo(() => {
    return Array.from({ length: 200 }).map((_, i) => ({
      id: `bg2-${i}`,
      x: (Math.random() - 0.5) * 4000,
      y: (Math.random() - 0.5) * 3000,
      size: Math.random() * 3 + 1.5,
      opacity: Math.random() * 0.6 + 0.4
    }));
  }, []);

  return (
    <>
      {/* Parallax Layer 1: Distant Stars (moves very slow) */}
      <div 
        style={{ 
          position: 'absolute', top: '50%', left: '50%', width: 0, height: 0,
          transform: `translate(${viewport.x * 0.15}px, ${viewport.y * 0.15}px) scale(${viewport.scale})`,
          pointerEvents: 'none'
        }}
      >
        {bgStarsLayer1.map(star => (
          <div key={star.id} style={{
            position: 'absolute', left: `${star.x}px`, top: `${star.y}px`, width: `${star.size}px`, height: `${star.size}px`,
            borderRadius: '50%', backgroundColor: '#fff', opacity: star.opacity,
            boxShadow: `0 0 ${star.size * 2}px rgba(255,255,255,0.8)`
          }} />
        ))}
      </div>

      {/* Parallax Layer 2: Mid-ground Stars (moves medium slow) */}
      <div 
        style={{ 
          position: 'absolute', top: '50%', left: '50%', width: 0, height: 0,
          transform: `translate(${viewport.x * 0.4}px, ${viewport.y * 0.4}px) scale(${viewport.scale})`,
          pointerEvents: 'none'
        }}
      >
        {bgStarsLayer2.map(star => (
          <div key={star.id} style={{
            position: 'absolute', left: `${star.x}px`, top: `${star.y}px`, width: `${star.size}px`, height: `${star.size}px`,
            borderRadius: '50%', backgroundColor: '#80d4ff', opacity: star.opacity,
            boxShadow: `0 0 ${star.size * 3}px rgba(128,212,255,0.8)`
          }} />
        ))}
      </div>
    </>
  );
}
