import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface VoiceBlob3DProps {
  status: 'connecting' | 'listening' | 'processing';
  muted?: boolean;
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
  uniform float uIntensity;
  uniform float uSpeed;
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying float vDisplacement;
  varying vec3 vViewPosition;
  varying vec3 vWorldNormal;
  
  ${noiseGLSL}
  
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;
    
    // Layer 1: large slow undulations (liquid viscous feel)
    float noise0 = snoise(position * 0.4 + uTime * uSpeed * 0.1) * uIntensity * 1.4;
    // Layer 2: medium organic movement
    float noise1 = snoise(position * 1.2 + uTime * uSpeed * 0.3) * uIntensity * 0.8;
    // Layer 3: detail ripples
    float noise2 = snoise(position * 2.5 + uTime * uSpeed * 0.5) * uIntensity * 0.3;
    // Layer 4: fine surface detail
    float noise3 = snoise(position * 4.0 + uTime * uSpeed * 0.7) * uIntensity * 0.12;
    
    float displacement = noise0 + noise1 + noise2 + noise3;
    vDisplacement = displacement;
    
    vec3 newPosition = position + normal * displacement;
    
    // Perturbed normal for reflections
    float eps = 0.01;
    float dx = snoise((position + vec3(eps,0,0)) * 1.2 + uTime * uSpeed * 0.3) - snoise((position - vec3(eps,0,0)) * 1.2 + uTime * uSpeed * 0.3);
    float dy = snoise((position + vec3(0,eps,0)) * 1.2 + uTime * uSpeed * 0.3) - snoise((position - vec3(0,eps,0)) * 1.2 + uTime * uSpeed * 0.3);
    float dz = snoise((position + vec3(0,0,eps)) * 1.2 + uTime * uSpeed * 0.3) - snoise((position - vec3(0,0,eps)) * 1.2 + uTime * uSpeed * 0.3);
    vec3 perturbedNormal = normalize(normal + vec3(dx, dy, dz) * uIntensity * 3.0);
    vWorldNormal = normalize(normalMatrix * perturbedNormal);
    
    vec4 mvPosition = modelViewMatrix * vec4(newPosition, 1.0);
    vViewPosition = -mvPosition.xyz;
    
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying float vDisplacement;
  varying vec3 vViewPosition;
  varying vec3 vWorldNormal;
  uniform float uTime;
  
  // Fake environment map - returns color based on reflection direction
  vec3 envMap(vec3 dir) {
    // Sky gradient: cool silver top, warm bottom
    float y = dir.y * 0.5 + 0.5;
    vec3 sky = mix(vec3(0.15, 0.15, 0.18), vec3(0.85, 0.88, 0.92), y);
    
    // Add warm orange accent from below (brand color reflection)
    float warmth = smoothstep(-0.3, -0.8, dir.y);
    sky = mix(sky, vec3(1.0, 0.55, 0.26), warmth * 0.4);
    
    // Bright specular band moving over time
    float band = smoothstep(0.95, 1.0, cos(dir.x * 3.0 + uTime * 0.5) * sin(dir.z * 2.0 + uTime * 0.3));
    sky += vec3(0.8, 0.82, 0.85) * band;
    
    return sky;
  }
  
  void main() {
    vec3 viewDir = normalize(vViewPosition);
    vec3 normal = normalize(vWorldNormal);
    
    // Reflection vector
    vec3 reflectDir = reflect(-viewDir, normal);
    
    // Environment reflection (chrome look)
    vec3 envColor = envMap(reflectDir);
    
    // Fresnel - stronger at edges for chrome effect
    float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 3.0);
    
    // Base metallic color (dark chrome)
    vec3 baseChrome = vec3(0.35, 0.36, 0.38);
    
    // Mix chrome base with environment reflections
    vec3 color = mix(baseChrome, envColor, 0.6 + fresnel * 0.4);
    
    // Add bright Fresnel rim with subtle orange tint
    vec3 rimColor = mix(vec3(0.9, 0.92, 0.95), vec3(1.0, 0.65, 0.35), 0.2);
    color = mix(color, rimColor, fresnel * 0.7);
    
    // Specular highlight (moving light source)
    vec3 lightDir = normalize(vec3(sin(uTime * 0.4) * 2.0, 2.0, cos(uTime * 0.3) * 2.0));
    float spec = pow(max(dot(reflect(-lightDir, normal), viewDir), 0.0), 64.0);
    color += vec3(1.0, 0.95, 0.9) * spec * 0.8;
    
    // Secondary specular from opposite side
    vec3 lightDir2 = normalize(vec3(-1.5, -0.5, 1.0));
    float spec2 = pow(max(dot(reflect(-lightDir2, normal), viewDir), 0.0), 32.0);
    color += vec3(1.0, 0.6, 0.3) * spec2 * 0.3;
    
    // Subtle displacement-based darkening in valleys
    float valley = smoothstep(-0.1, 0.1, vDisplacement);
    color *= mix(0.7, 1.0, valley);
    
    gl_FragColor = vec4(color, 1.0);
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
    
    const targetIntensity = muted ? 0.05 : 
      status === 'connecting' ? 0.08 :
      status === 'processing' ? 0.28 :
      0.15; // listening
    
    const targetSpeed = muted ? 0.2 :
      status === 'connecting' ? 0.4 :
      status === 'processing' ? 1.5 :
      0.8; // listening
    
    // Slower lerp for viscous liquid feel
    uniforms.uIntensity.value += (targetIntensity - uniforms.uIntensity.value) * delta * 1.5;
    uniforms.uSpeed.value += (targetSpeed - uniforms.uSpeed.value) * delta * 1.5;
    
    // Slow rotation
    meshRef.current.rotation.y += delta * 0.1;
    meshRef.current.rotation.x = Math.sin(uniforms.uTime.value * 0.2) * 0.08;
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1, 256, 256]} />
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
        <BlobMesh status={status} muted={muted} />
      </Canvas>
    </div>
  );
};

export default VoiceBlob3D;
