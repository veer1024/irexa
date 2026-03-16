"use client";

import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface TerrainLayerProps {
  data: {
    contours?: { features: Array<{ properties: { elevation: number }; geometry: { coordinates: number[][] } }> };
  } | null;
  stage: number;
  scrollProgress: number;
}

// Simplex-style noise using single-octave value noise (no deps)
function valueNoise(x: number, z: number): number {
  const ix = Math.floor(x);
  const iz = Math.floor(z);
  const fx = x - ix;
  const fz = z - iz;
  const ux = fx * fx * (3 - 2 * fx);
  const uz = fz * fz * (3 - 2 * fz);

  const rand = (a: number, b: number) => {
    const n = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
    return n - Math.floor(n);
  };

  return (
    rand(ix, iz) * (1 - ux) * (1 - uz) +
    rand(ix + 1, iz) * ux * (1 - uz) +
    rand(ix, iz + 1) * (1 - ux) * uz +
    rand(ix + 1, iz + 1) * ux * uz
  );
}

function fbm(x: number, z: number): number {
  let value = 0;
  let amplitude = 0.5;
  let frequency = 1;
  for (let i = 0; i < 8; i++) {
    value += valueNoise(x * frequency, z * frequency) * amplitude;
    amplitude *= 0.5;
    frequency *= 2.1;
  }
  return value;
}

// Build 2-step toon gradient map texture
function makeToonGradient(): THREE.DataTexture {
  const data = new Uint8Array([40, 40, 40, 255, 220, 220, 220, 255, 255, 255, 255, 255]);
  const tex = new THREE.DataTexture(data, 3, 1, THREE.RGBAFormat);
  tex.needsUpdate = true;
  return tex;
}

export function TerrainLayer({ data: _data, stage, scrollProgress }: TerrainLayerProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshLambertMaterial>(null);

  const geometry = useMemo(() => {
    const segments = 256;
    const size = 220;
    const geo = new THREE.PlaneGeometry(size, size, segments, segments);
    geo.rotateX(-Math.PI / 2);

    const positions = geo.attributes.position;
    const colors = [];

    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i) / 60;
      const z = positions.getZ(i) / 60;
      const elevation = fbm(x, z);
      // Multi-layer: large ridges + fine detail
      const height = elevation * 40 + valueNoise(x * 3, z * 3) * 8;
      positions.setY(i, height);

      // Height-based coloring: low = dark gray, high = light gray
      const shade = THREE.MathUtils.clamp((height + 20) / 40, 0, 1); // normalize height
      const gray = 0.3 + shade * 0.7; // from 0.3 to 1.0
      colors.push(gray, gray, gray);
    }

    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    geo.computeVertexNormals();
    return geo;
  }, []);

  const gradientMap = useMemo(() => makeToonGradient(), []);

  useFrame(() => {
    if (!meshRef.current || !materialRef.current) return;

    // Stage 1: terrain rises; stage 0: flat; stage 2+: scale down
    let targetScaleY = 0;
    if (stage === 1) {
      const p = Math.max(0, Math.min(1, (scrollProgress - 0.25) / 0.25));
      targetScaleY = p;
    } else if (stage >= 2) {
      targetScaleY = Math.max(0, 1 - (scrollProgress - 0.5) / 0.15);
    }

    meshRef.current.scale.y = THREE.MathUtils.lerp(meshRef.current.scale.y, targetScaleY, 0.07);

    const vis = meshRef.current.scale.y;
    materialRef.current.opacity = THREE.MathUtils.lerp(materialRef.current.opacity, vis > 0.02 ? 1 : 0, 0.06);
  });

  return (
    <group>
      {/* Always-visible base grid — subtle */}
      <gridHelper args={[400, 100, '#d0d0d0', '#e8e8e8']} position={[0, 0.1, 0]} />

      {/* Terrain mesh */}
      <mesh geometry={geometry} scale={[1, 0, 1]} receiveShadow castShadow>
        <meshLambertMaterial
          ref={materialRef}
          vertexColors
          transparent
          opacity={0}
        />
      </mesh>
    </group>
  );
}
