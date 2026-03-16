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
  for (let i = 0; i < 5; i++) {
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
  const outlineRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshToonMaterial>(null);
  const outlineMatRef = useRef<THREE.MeshBasicMaterial>(null);

  const { geometry, outlineGeo } = useMemo(() => {
    const segments = 100;
    const size = 220;
    const geo = new THREE.PlaneGeometry(size, size, segments, segments);
    geo.rotateX(-Math.PI / 2);

    const positions = geo.attributes.position;

    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i) / 60;
      const z = positions.getZ(i) / 60;
      const elevation = fbm(x, z);
      // Multi-layer: large ridges + fine detail
      const height = elevation * 28 + valueNoise(x * 3, z * 3) * 5;
      positions.setY(i, height);
    }

    geo.computeVertexNormals();

    // Outline geo = same geometry, slightly scaled up for toon outline
    const outGeo = geo.clone();
    return { geometry: geo, outlineGeo: outGeo };
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
    if (outlineRef.current) {
      outlineRef.current.scale.y = meshRef.current.scale.y;
      outlineRef.current.visible = meshRef.current.scale.y > 0.05;
    }

    const vis = meshRef.current.scale.y;
    materialRef.current.opacity = THREE.MathUtils.lerp(materialRef.current.opacity, vis > 0.02 ? 1 : 0, 0.06);
    if (outlineMatRef.current) {
      outlineMatRef.current.opacity = materialRef.current.opacity;
    }
  });

  return (
    <group>
      {/* Always-visible base grid — subtle */}
      <gridHelper args={[220, 55, '#d0d0d0', '#e8e8e8']} position={[0, 0.1, 0]} />

      {/* Toon-shaded terrain */}
      <mesh ref={meshRef} geometry={geometry} scale={[1, 0, 1]} receiveShadow castShadow>
        <meshToonMaterial
          ref={materialRef}
          color="#e0e0e0"
          gradientMap={gradientMap}
          transparent
          opacity={0}
          side={THREE.FrontSide}
        />
      </mesh>

      {/* Toon outline — back-face scaled trick */}
      <mesh ref={outlineRef} geometry={outlineGeo} scale={[1.012, 0, 1.012]}>
        <meshBasicMaterial
          ref={outlineMatRef}
          color="#111111"
          side={THREE.BackSide}
          transparent
          opacity={0}
        />
      </mesh>
    </group>
  );
}
