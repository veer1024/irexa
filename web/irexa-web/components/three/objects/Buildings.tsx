import { useRef } from 'react';
import { InstancedMesh, Object3D } from 'three';
import { useFrame } from '@react-three/fiber';

const buildingData = [
  { position: [-2, 0, -2] as [number, number, number], height: 2, color: '#00FF9C' },
  { position: [1, 0, -1] as [number, number, number], height: 1.5, color: '#00FF9C' },
  { position: [3, 0, 2] as [number, number, number], height: 3, color: '#00FF9C' },
  { position: [-3, 0, 1] as [number, number, number], height: 1, color: '#00FF9C' },
];

interface BuildingsProps {
  scrollProgress: number;
}

export function Buildings({ scrollProgress }: BuildingsProps) {
  const meshRef = useRef<InstancedMesh>(null);
  const tempObject = new Object3D();

  useFrame(() => {
    if (meshRef.current) {
      buildingData.forEach((building, i) => {
        const extrusionProgress = Math.min(scrollProgress * 2, 1);
        const currentHeight = building.height * extrusionProgress;

        tempObject.position.set(...building.position);
        tempObject.scale.set(0.5, currentHeight, 0.5);
        tempObject.updateMatrix();
        meshRef.current!.setMatrixAt(i, tempObject.matrix);
      });
      meshRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, buildingData.length]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color="#00FF9C" transparent opacity={0.7} />
    </instancedMesh>
  );
}