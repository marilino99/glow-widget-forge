import React, { useRef, useEffect, useState } from 'react';

interface VoiceBlob3DProps {
  status: 'connecting' | 'listening' | 'processing';
  muted?: boolean;
  baseColor?: string;
}

function useGlowIntensity(status: string, muted: boolean) {
  const [intensity, setIntensity] = useState(0.3);
  const targetRef = useRef(0.3);

  useEffect(() => {
    targetRef.current = muted ? 0.1 :
      status === 'connecting' ? 0.15 :
      status === 'processing' ? 0.7 :
      0.3;
  }, [status, muted]);

  useEffect(() => {
    let raf: number;
    const animate = () => {
      setIntensity(prev => {
        const diff = targetRef.current - prev;
        if (Math.abs(diff) < 0.001) return targetRef.current;
        return prev + diff * 0.05;
      });
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, []);

  return intensity;
}

const VoiceBlob3D: React.FC<VoiceBlob3DProps> = ({ status, muted = false, baseColor = '#3B82F6' }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const glowIntensity = useGlowIntensity(status, muted);
  const glowSize = 30 + glowIntensity * 40;
  const glowOpacity = 0.3 + glowIntensity * 0.4;

  useEffect(() => {
    if (!videoRef.current) return;
    const targetRate = muted ? 0.5 :
      status === 'connecting' ? 0.5 :
      status === 'processing' ? 2.0 :
      1.0;
    videoRef.current.playbackRate = targetRate;
  }, [status, muted]);

  return (
    <div style={{ width: 200, height: 200, position: 'relative' }}>
      <video
        ref={videoRef}
        src="/videos/voice-blob.webm"
        autoPlay
        loop
        muted
        playsInline
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          position: 'relative',
          zIndex: 1,
          background: 'transparent',
        }}
      />
    </div>
  );
};

export default VoiceBlob3D;
