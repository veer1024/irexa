"use client";

import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface ContourLayerProps {
  data: any;
}

export function ContourLayer({ data }: ContourLayerProps) {
  const lineMaterial = useRef<THREE.LineBasicMaterial>(null);

  // Parse lines from geojson
  const lines = useMemo(() => {
    if (!data?.contours?.features) return [];
    
    return data.contours.features.map((feature: any) => {
      const coords = feature.geometry.coordinates;
      const points = coords.map((c: number[]) => new THREE.Vector3(c[0], 0, c[1]));
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      return geometry;
    });
  }, [data]);

  // Animation effect for lines
  useFrame(({ clock }) => {
    if (lineMaterial.current) {
      // Subtle pulsing opacity
      lineMaterial.current.opacity = 0.3 + Math.sin(clock.elapsedTime) * 0.1;
    }
  });

  return (
    <group>
      {lines.map((geom: THREE.BufferGeometry, i: number) => (
        // @ts-ignore - React 19 type clashes with SVG tags
        <line key={i} geometry={geom}>
          {/* @ts-ignore */}
          <lineBasicMaterial
            ref={i === 0 ? lineMaterial : undefined}
            color="#ffffff"
            transparent
            opacity={0.3}
            linewidth={1}
          />
        </line>
      ))}
    </group>
  );
}
