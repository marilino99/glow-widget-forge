import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface VoiceBlob3DProps {
  status: 'connecting' | 'listening' | 'processing';
  muted?: boolean;
}

// Simplex-like noise functions embedded
const noiseGLSL = `
  vec3 mod289(vec3 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
  
  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
  }
`;

const vertexShader = `
  uniform float uTime;
  uniform float uIntensity;
  uniform float uSpeed;
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying float vDisplacement;
  
  ${noiseGLSL}
  
  void main() {
    vNormal = normal;
    vPosition = position;
    
    float noise1 = snoise(position * 1.5 + uTime * uSpeed * 0.4) * uIntensity;
    float noise2 = snoise(position * 3.0 + uTime * uSpeed * 0.6) * uIntensity * 0.3;
    float noise3 = snoise(position * 0.8 + uTime * uSpeed * 0.2) * uIntensity * 0.5;
    
    float displacement = noise1 + noise2 + noise3;
    vDisplacement = displacement;
    
    vec3 newPosition = position + normal * displacement;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`;

const fragmentShader = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying float vDisplacement;
  uniform float uTime;
  
  void main() {
    // Orange gradient based on position and normal
    vec3 color1 = vec3(1.0, 0.549, 0.259);  // #FF8C42
    vec3 color2 = vec3(1.0, 0.420, 0.208);  // #FF6B35
    vec3 color3 = vec3(1.0, 0.604, 0.361);  // #FF9A5C
    
    float mixFactor = (vPosition.y + 1.0) * 0.5;
    vec3 baseColor = mix(color2, color1, mixFactor);
    
    // Add highlight based on normal direction
    float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 2.0);
    baseColor = mix(baseColor, color3, fresnel * 0.6);
    
    // Subtle shimmer
    float shimmer = sin(vDisplacement * 10.0 + uTime * 2.0) * 0.05 + 0.95;
    baseColor *= shimmer;
    
    gl_FragColor = vec4(baseColor, 1.0);
  }
`;

function BlobMesh({ status, muted }: VoiceBlob3DProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uIntensity: { value: 0.15 },
    uSpeed: { value: 1.0 },
  }), []);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    
    uniforms.uTime.value += delta;
    
    // Adjust based on status
    const targetIntensity = muted ? 0.05 : 
      status === 'connecting' ? 0.1 :
      status === 'processing' ? 0.35 :
      0.2; // listening
    
    const targetSpeed = muted ? 0.3 :
      status === 'connecting' ? 0.6 :
      status === 'processing' ? 2.0 :
      1.2; // listening
    
    uniforms.uIntensity.value += (targetIntensity - uniforms.uIntensity.value) * delta * 3;
    uniforms.uSpeed.value += (targetSpeed - uniforms.uSpeed.value) * delta * 3;
    
    // Slow rotation
    meshRef.current.rotation.y += delta * 0.15;
    meshRef.current.rotation.x = Math.sin(uniforms.uTime.value * 0.3) * 0.1;
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1, 128, 128]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
}

const VoiceBlob3D: React.FC<VoiceBlob3DProps> = ({ status, muted = false }) => {
  return (
    <div style={{ width: 160, height: 160 }}>
      <Canvas
        camera={{ position: [0, 0, 2.8], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 5, 5]} intensity={0.5} />
        <BlobMesh status={status} muted={muted} />
      </Canvas>
    </div>
  );
};

export default VoiceBlob3D;
