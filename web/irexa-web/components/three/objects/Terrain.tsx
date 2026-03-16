import { useRef } from 'react';
import { Mesh } from 'three';

export function Terrain() {
  const meshRef = useRef<Mesh>(null);

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
      <planeGeometry args={[20, 20, 10, 10]} />
      <meshBasicMaterial color="#111111" wireframe />
    </mesh>
  );
}