"use client";

import { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';

import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';

interface BuildingFeature {
  properties: { height: number; type: string; name: string };
  geometry: { coordinates: number[][][] };
}

interface BuildingLayerProps {
  data: {
    buildings?: { features: BuildingFeature[] };
  } | null;
  stage: number;
  scrollProgress: number;
}

// Build toon gradient for buildings
function makeBuildingToonGradient(): THREE.DataTexture {
  const data = new Uint8Array([30, 30, 30, 255, 160, 160, 160, 255, 245, 245, 245, 255]);
  const tex = new THREE.DataTexture(data, 3, 1, THREE.RGBAFormat);
  tex.needsUpdate = true;
  return tex;
}

function getBounds(coords: number[][]): { cx: number; cz: number; width: number; depth: number } {
  let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
  coords.forEach((c) => {
    minX = Math.min(minX, c[0]); maxX = Math.max(maxX, c[0]);
    minZ = Math.min(minZ, c[1]); maxZ = Math.max(maxZ, c[1]);
  });
  return { cx: (minX + maxX) / 2, cz: (minZ + maxZ) / 2, width: Math.max(maxX - minX, 4), depth: Math.max(maxZ - minZ, 4) };
}

export function BuildingLayer({ data, stage, scrollProgress }: BuildingLayerProps) {
  const { size } = useThree();
  const instancedRef = useRef<THREE.InstancedMesh>(null);
  const footprintGroupRef = useRef<THREE.Group>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const gradientMap = useMemo(() => makeBuildingToonGradient(), []);

  const features = data?.buildings?.features || [];
  const count = features.length;

  const buildingData = useMemo(() => {
    return features.map((f, i) => {
      const bounds = getBounds(f.geometry.coordinates[0]);
      return { ...bounds, targetHeight: f.properties.height, currentHeight: 0.05, delay: i / Math.max(features.length, 1) };
    });
  }, [features]);

  // Thick footprint Line2 outlines (stage 2)
  const footprintLines = useMemo(() => {
    if (!size.width) return [];
    return features.map((f) => {
      const coords = f.geometry.coordinates[0];
      const positions: number[] = [];
      // close the ring
      const ring = [...coords, coords[0]];
      ring.forEach((c) => positions.push(c[0], 0.3, c[1]));

      const geo = new LineGeometry();
      geo.setPositions(positions);

      const mat = new LineMaterial({
        color: 0x00ff9c,
        linewidth: 3.0,
        resolution: new THREE.Vector2(size.width, size.height),
        transparent: true,
        opacity: 0,
      });

      const line = new Line2(geo, mat);
      line.computeLineDistances();
      return line;
    });
  }, [features, size.width, size.height]);

  // Solid building material (toon)
  const solidMaterial = useMemo(() => new THREE.MeshToonMaterial({
    color: '#f8f8f8',
    gradientMap,
    transparent: true,
    opacity: 0,
  }), [gradientMap]);

  useEffect(() => {
    if (!footprintGroupRef.current) return;
    footprintLines.forEach((l) => footprintGroupRef.current!.add(l));
    return () => footprintLines.forEach((l) => footprintGroupRef.current?.remove(l));
  }, [footprintLines]);

  useFrame(({ clock }) => {
    const pulse = 0.7 + Math.sin(clock.elapsedTime * 3.5) * 0.3;

    // ── Stage 2: glowing footprints ─────────────────────────────
    footprintLines.forEach((line, i) => {
      const mat = line.material as LineMaterial;
      if (stage === 2) {
        const stageP = Math.max(0, Math.min(1, (scrollProgress - 0.5) / 0.25));
        const threshold = buildingData[i].delay * 0.65;
        const reveal = Math.max(0, Math.min(1, (stageP - threshold) / 0.35));
        mat.opacity = reveal * pulse * 0.95;
      } else {
        mat.opacity = THREE.MathUtils.lerp(mat.opacity, 0, 0.07);
      }
    });

    // ── Stage 3: 3D extrusion ───────────────────────────────────
    if (!instancedRef.current || count === 0) return;

    if (stage >= 3) {
      const stageP = Math.max(0, Math.min(1, (scrollProgress - 0.75) / 0.25));
      solidMaterial.opacity = THREE.MathUtils.lerp(solidMaterial.opacity, stageP > 0.05 ? 1 : 0, 0.06);

      buildingData.forEach((b, i) => {
        const delayed = Math.max(0, Math.min(1, (stageP - b.delay * 0.5) / 0.5));
        const targetH = Math.max(0.05, b.targetHeight * delayed);
        b.currentHeight += (targetH - b.currentHeight) * 0.09;

        dummy.position.set(b.cx, b.currentHeight / 2, b.cz);
        dummy.scale.set(b.width, b.currentHeight, b.depth);
        dummy.updateMatrix();
        instancedRef.current!.setMatrixAt(i, dummy.matrix);
      });
      instancedRef.current.instanceMatrix.needsUpdate = true;
    } else {
      solidMaterial.opacity = THREE.MathUtils.lerp(solidMaterial.opacity, 0, 0.07);
      buildingData.forEach((b, i) => {
        b.currentHeight = THREE.MathUtils.lerp(b.currentHeight, 0.05, 0.07);
        dummy.position.set(b.cx, b.currentHeight / 2, b.cz);
        dummy.scale.set(b.width, b.currentHeight, b.depth);
        dummy.updateMatrix();
        if (instancedRef.current) instancedRef.current.setMatrixAt(i, dummy.matrix);
      });
      if (instancedRef.current) instancedRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  if (count === 0) return null;

  return (
    <>
      <group ref={footprintGroupRef} />
      <instancedMesh
        ref={instancedRef}
        args={[new THREE.BoxGeometry(1, 1, 1), solidMaterial, count]}
        castShadow
        receiveShadow
      />
    </>
  );
}
