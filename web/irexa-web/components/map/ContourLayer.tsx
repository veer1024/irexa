"use client";

import { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';

// Line2 from three/examples for thick GPU lines
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';

interface ContourFeature {
  properties: { elevation: number };
  geometry: { coordinates: number[][] };
}

interface ContourLayerProps {
  data: {
    contours?: { features: ContourFeature[] };
  } | null;
  stage: number;
  scrollProgress: number;
}

export function ContourLayer({ data, stage, scrollProgress }: ContourLayerProps) {
  const { size } = useThree();
  const groupRef = useRef<THREE.Group>(null);

  // Build sorted line objects
  const lines = useMemo(() => {
    if (!data?.contours?.features) return [];

    const sorted = [...data.contours.features].sort(
      (a, b) => a.properties.elevation - b.properties.elevation
    );

    return sorted.map((feature, i) => {
      const elevation = feature.properties.elevation;
      const coords = feature.geometry.coordinates;
      const isMajor = elevation % 20 === 0;

      // LineGeometry expects flat [x,y,z, x,y,z, ...] array
      const positions: number[] = [];
      coords.forEach((c) => {
        positions.push(c[0], (elevation / 80) * 18, c[1] || 0);
      });

      const geo = new LineGeometry();
      geo.setPositions(positions);

      const mat = new LineMaterial({
        color: isMajor ? 0x111111 : 0x333333,
        linewidth: isMajor ? 4.0 : 2.2, // world-space px
        resolution: new THREE.Vector2(size.width, size.height),
        transparent: true,
        opacity: 0,
      });

      const line = new Line2(geo, mat);
      line.computeLineDistances();
      return { line, elevation, isMajor, index: i };
    });
  }, [data, size.width, size.height]);

  const totalLines = lines.length;

  useEffect(() => {
    if (!groupRef.current) return;
    lines.forEach(({ line }) => groupRef.current!.add(line));
    return () => {
      if (groupRef.current) {
        lines.forEach(({ line }) => groupRef.current!.remove(line));
      }
    };
  }, [lines]);

  useFrame(({ clock }) => {
    lines.forEach(({ line, index }) => {
      const mat = line.material as LineMaterial;
      if (stage === 1) {
        const stageP = Math.max(0, Math.min(1, (scrollProgress - 0.25) / 0.25));
        // each line reveals in sequence: threshold from 0..0.7
        const threshold = (index / totalLines) * 0.7;
        const reveal = Math.max(0, Math.min(1, (stageP - threshold) / 0.3));
        const osc = reveal > 0.5 ? Math.sin(clock.elapsedTime * 2.5 + index * 0.4) * 0.06 : 0;
        const base = lines[index].isMajor ? 0.9 : 0.5;
        mat.opacity = reveal * base + osc;
      } else if (stage === 0) {
        mat.opacity = THREE.MathUtils.lerp(mat.opacity, 0, 0.06);
      } else {
        // stage 2+: fade out
        mat.opacity = THREE.MathUtils.lerp(mat.opacity, 0, 0.07);
      }
    });
  });

  return <group ref={groupRef} />;
}
