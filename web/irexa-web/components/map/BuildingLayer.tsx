"use client";

import { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface BuildingLayerProps {
  data: any;
  stage: number; // 0, 1, 2 representing the 3 stages
  progress: number;
}

export function BuildingLayer({ data, stage, progress }: BuildingLayerProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  // Materials
  const defaultMaterial = useMemo(() => new THREE.MeshBasicMaterial({ 
    color: '#ffffff', 
    wireframe: true,
    transparent: true,
    opacity: 0.15
  }), []);

  const highlightMaterial = useMemo(() => new THREE.MeshBasicMaterial({
    color: '#00FF9C',
    wireframe: false,
    transparent: true,
    opacity: 0.8
  }), []);

  const features = data?.buildings?.features || [];
  const count = features.length;

  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  // Pre-calculate positions and heights
  const buildingData = useMemo(() => {
    return features.map((f: any) => {
      // Very simplified centroid logic since our mock data has basic rectangles
      const coords = f.geometry.coordinates[0];
      let cx = 0, cy = 0;
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

      coords.forEach((c: number[]) => { 
        cx += c[0]; cy += c[1]; 
        minX = Math.min(minX, c[0]);
        maxX = Math.max(maxX, c[0]);
        minY = Math.min(minY, c[1]);
        maxY = Math.max(maxY, c[1]);
      });
      cx /= coords.length;
      cy /= coords.length;
      
      const width = maxX - minX;
      const depth = maxY - minY;

      return {
        x: cx,
        z: cy,
        width: Math.max(width, 5),
        depth: Math.max(depth, 5),
        targetHeight: f.properties.height || 10,
        currentHeight: 0.1 // Starts practically flat
      };
    });
  }, [features]);

  // Update instanced mesh
  useFrame((state, delta) => {
    if (!meshRef.current || count === 0) return;

    buildingData.forEach((b: any, i: number) => {
      // Stage 3 (index 2) activates 3D Extrusion
      const isExtruding = stage >= 2;
      const targetH = isExtruding ? b.targetHeight * progress : 0.1;
      
      // Interpolate height
      b.currentHeight += (targetH - b.currentHeight) * 5 * delta;
      
      // Position and scale dummy using actual bounding shape
      dummy.position.set(b.x, b.currentHeight / 2, b.z);
      dummy.scale.set(b.width, b.currentHeight, b.depth); 
      dummy.updateMatrix();
      
      meshRef.current!.setMatrixAt(i, dummy.matrix);
      
      // Stage 2 (index 1) handles highlighting from scan (we simulate it global for now)
      if (stage >= 1) {
        meshRef.current!.setColorAt(i, new THREE.Color('#00FF9C'));
      } else {
        meshRef.current!.setColorAt(i, new THREE.Color('#ffffff'));
      }
    });
    
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
  });

  if (count === 0) return null;

  return (
    <instancedMesh
      ref={meshRef}
      args={[new THREE.BoxGeometry(1, 1, 1), defaultMaterial, count]}
    >
      {/* Fallback to default material, logic in frame overrides colors */}
    </instancedMesh>
  );
}
