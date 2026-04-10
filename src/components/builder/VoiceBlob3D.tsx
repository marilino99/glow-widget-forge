import React, { useRef, useEffect } from 'react';

interface VoiceBlob3DProps {
  status: 'connecting' | 'listening' | 'processing';
  muted?: boolean;
  baseColor?: string;
}

const VoiceBlob3D: React.FC<VoiceBlob3DProps> = ({ status, muted = false }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

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
