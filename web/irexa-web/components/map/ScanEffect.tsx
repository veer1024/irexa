"use client";

import { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface ScanEffectProps {
  stage: number;
}

export function ScanEffect({ stage }: ScanEffectProps) {
  const scanRef = useRef<THREE.Mesh>(null);
  
  useFrame(({ clock }) => {
    if (!scanRef.current) return;
    
    // Only visible and moving during Stage 2 (index 1) and beyond
    if (stage >= 1) {
      scanRef.current.visible = true;
      // Sweep back and forth
      scanRef.current.position.z = Math.sin(clock.elapsedTime * 0.5) * 80;
    } else {
      scanRef.current.visible = false;
    }
  });

  return (
    <mesh ref={scanRef} visible={false} position={[0, 1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[200, 2]} />
      <meshBasicMaterial 
        color="#00FF9C" 
        transparent 
        opacity={0.6}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
