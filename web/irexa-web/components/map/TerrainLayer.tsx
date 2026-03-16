"use client";

import { useMemo } from 'react';
import * as THREE from 'three';

interface SceneData {
  buildings: any;
  contours: any;
}

interface TerrainLayerProps {
  data: SceneData | null;
}

export function TerrainLayer({ data }: TerrainLayerProps) {
  // We represent the grid map dynamically via a lightweight plane and basic gridHelper
  return (
    <group position={[0, -0.1, 0]}>
      {/* Flat dark plane under the grid */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
      
      {/* Structural Minimal Grid */}
      <gridHelper args={[200, 50, '#1a1a1a', '#1a1a1a']} />
    </group>
  );
}
