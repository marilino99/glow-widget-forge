import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface VoiceBlob3DProps {
  status: 'connecting' | 'listening' | 'processing';
  muted?: boolean;
  baseColor?: string;
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [
    parseInt(h.substring(0, 2), 16) / 255,
    parseInt(h.substring(2, 4), 16) / 255,
    parseInt(h.substring(4, 6), 16) / 255,
  ];
}

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
  uniform float uReactivity;
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying float vDisplacement;

  ${noiseGLSL}

  void main() {
    float pulse = sin(uTime * 0.5) * 0.08;

    float n0 = snoise(position * 0.6 + uTime * 0.15 * uReactivity) * 1.2 * uReactivity;
    float n1 = snoise(position * 1.5 + uTime * 0.3 * uReactivity) * 0.4 * uReactivity;
    float n2 = snoise(position * 3.0 + uTime * 0.5 * uReactivity) * 0.1 * uReactivity;

    float displacement = (n0 + n1 + n2) + pulse;
    vDisplacement = displacement;

    vec3 newPosition = position + normal * displacement;

    vec4 mvPosition = modelViewMatrix * vec4(newPosition, 1.0);
    vViewPosition = -mvPosition.xyz;

    float eps = 0.01;
    float dx = snoise((position + vec3(eps,0,0)) * 1.5 + uTime * 0.3 * uReactivity)
             - snoise((position - vec3(eps,0,0)) * 1.5 + uTime * 0.3 * uReactivity);
    float dy = snoise((position + vec3(0,eps,0)) * 1.5 + uTime * 0.3 * uReactivity)
             - snoise((position - vec3(0,eps,0)) * 1.5 + uTime * 0.3 * uReactivity);
    float dz = snoise((position + vec3(0,0,eps)) * 1.5 + uTime * 0.3 * uReactivity)
             - snoise((position - vec3(0,0,eps)) * 1.5 + uTime * 0.3 * uReactivity);
    vec3 perturbedNormal = normalize(normal + vec3(dx, dy, dz) * uReactivity * 1.5);
    vNormal = normalize(normalMatrix * perturbedNormal);

    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = `
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying float vDisplacement;
  uniform vec3 uBaseColor;
  uniform float uTime;

  void main() {
    vec3 viewDir = normalize(vViewPosition);
    vec3 normal = normalize(vNormal);

    // Fresnel — glossy white edge
    float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 3.5);

    // Base color is dominant
    vec3 color = uBaseColor * 0.9;

    // Subtle shading from light direction
    vec3 lightDir = normalize(vec3(1.0, 2.0, 1.5));
    float diffuse = max(dot(normal, lightDir), 0.0) * 0.3 + 0.7;
    color *= diffuse;

    // Single white specular highlight
    float spec = pow(max(dot(reflect(-lightDir, normal), viewDir), 0.0), 40.0);
    color += vec3(1.0) * spec * 0.5;

    // Secondary soft spec
    vec3 lightDir2 = normalize(vec3(-1.0, 0.5, -1.0));
    float spec2 = pow(max(dot(reflect(-lightDir2, normal), viewDir), 0.0), 25.0);
    color += vec3(1.0) * spec2 * 0.15;

    // White glossy rim from fresnel
    color = mix(color, vec3(1.0), fresnel * 0.4);

    // Valley darkening for depth
    float valley = smoothstep(-0.1, 0.15, vDisplacement);
    color *= mix(0.7, 1.0, valley);

    gl_FragColor = vec4(color, 1.0);
  }
`;

function BlobMesh({ status, muted, baseColor }: VoiceBlob3DProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uReactivity: { value: 0.3 },
    uBaseColor: { value: new THREE.Vector3(0.23, 0.51, 0.96) },
  }), []);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    uniforms.uTime.value += delta;

    if (baseColor) {
      const [r, g, b] = hexToRgb(baseColor);
      uniforms.uBaseColor.value.set(r, g, b);
    }

    const targetReactivity = muted ? 0.05 :
      status === 'connecting' ? 0.1 :
      status === 'processing' ? 0.8 :
      0.35;

    uniforms.uReactivity.value += (targetReactivity - uniforms.uReactivity.value) * delta * 1.5;

    meshRef.current.rotation.y += delta * 0.08;
    meshRef.current.rotation.x = Math.sin(uniforms.uTime.value * 0.2) * 0.05;

    const breathe = 1.0 + Math.sin(uniforms.uTime.value * 0.5) * 0.02;
    meshRef.current.scale.setScalar(breathe);
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.55, 128, 128]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
}

function useGlowIntensity(status: string, muted: boolean) {
  const [intensity, setIntensity] = useState(0.3);
  const targetRef = useRef(0.3);

  React.useEffect(() => {
    targetRef.current = muted ? 0.1 :
      status === 'connecting' ? 0.15 :
      status === 'processing' ? 0.7 :
      0.3;
  }, [status, muted]);

  React.useEffect(() => {
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
  const glowIntensity = useGlowIntensity(status, muted);
  const glowSize = 30 + glowIntensity * 40;
  const glowOpacity = 0.3 + glowIntensity * 0.4;

  return (
    <div style={{ width: 160, height: 160, position: 'relative' }}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: baseColor,
          opacity: glowOpacity,
          filter: `blur(${glowSize}px)`,
          transform: 'scale(0.6)',
          transition: 'opacity 0.3s ease',
          pointerEvents: 'none',
        }}
      />
      <Canvas
        camera={{ position: [0, 0, 2.8], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent', position: 'relative', zIndex: 1 }}
      >
        <BlobMesh status={status} muted={muted} baseColor={baseColor} />
      </Canvas>
    </div>
  );
};

export default VoiceBlob3D;
