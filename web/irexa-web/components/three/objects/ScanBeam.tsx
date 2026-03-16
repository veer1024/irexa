import { useRef } from 'react';
import { Mesh, ShaderMaterial } from 'three';
import { useFrame } from '@react-three/fiber';

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform float time;
  varying vec2 vUv;

  void main() {
    float scan = sin(vUv.y * 10.0 + time * 2.0) * 0.5 + 0.5;
    gl_FragColor = vec4(0.0, 1.0, 0.6, scan * 0.3);
  }
`;

export function ScanBeam() {
  const meshRef = useRef<Mesh>(null);
  const materialRef = useRef<ShaderMaterial>(null);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = state.clock.elapsedTime;
    }
  });

  return (
    // @ts-ignore - Three.js JSX types
    <mesh ref={meshRef} position={[0, 2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      {/* @ts-ignore */}
      <planeGeometry args={[20, 20]} />
      {/* @ts-ignore */}
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{
          time: { value: 0 },
        }}
        transparent
      />
    {/* @ts-ignore */}
    </mesh>
  );
}