"use client";

import { useEffect, useState, useRef, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import { TerrainLayer } from './TerrainLayer';
import { ContourLayer } from './ContourLayer';
import { BuildingLayer } from './BuildingLayer';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as THREE from 'three';

gsap.registerPlugin(ScrollTrigger);

interface MapSceneProps {
  scrollProgress?: number;
  onStageChange?: (stage: number) => void;
}

// Fixed cinematic camera keyframes — NO random targets
const CAMERA_KEYFRAMES = [
  // Stage 0: Hero — top-down overview
  { pos: new THREE.Vector3(0, 350, 0),    lookAt: new THREE.Vector3(0, 0, 0) },
  // Stage 1: Terrain — slight tilt to see ridges
  { pos: new THREE.Vector3(-15, 160, 70), lookAt: new THREE.Vector3(0, 15, 0) },
  // Stage 2: Detection — straight top-down, closer
  { pos: new THREE.Vector3(0, 200, 0),    lookAt: new THREE.Vector3(0, 0, 0) },
  // Stage 3: 3D intel — centered lateral perspective
  { pos: new THREE.Vector3(0, 90, 160),   lookAt: new THREE.Vector3(0, 20, 0) },
];

interface SceneInternalProps {
  data: Record<string, unknown> | null;
  stage: number;
  scrollProgress: number;
}

function SceneInternal({ data, stage, scrollProgress }: SceneInternalProps) {
  const { camera } = useThree();
  const currentLookAt = useRef(new THREE.Vector3(0, 0, 0));
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0));

  useFrame(() => {
    const kf = CAMERA_KEYFRAMES[Math.min(stage, CAMERA_KEYFRAMES.length - 1)];
    camera.position.lerp(kf.pos, 0.035);
    targetLookAt.current.copy(kf.lookAt);
    currentLookAt.current.lerp(targetLookAt.current, 0.035);
    camera.lookAt(currentLookAt.current);
  });

  return (
    <>
      <ambientLight intensity={0.8} color="#ffffff" />
      <directionalLight
        position={[80, 150, 60]}
        intensity={1.8}
        color="#ffffff"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={700}
        shadow-camera-left={-160}
        shadow-camera-right={160}
        shadow-camera-top={160}
        shadow-camera-bottom={-160}
      />
      <hemisphereLight args={['#e8eaff', '#d8d8d8', 0.3]} />

      <TerrainLayer
        data={data as Parameters<typeof TerrainLayer>[0]['data']}
        stage={stage}
        scrollProgress={scrollProgress}
      />
      <ContourLayer
        data={data as Parameters<typeof ContourLayer>[0]['data']}
        stage={stage}
        scrollProgress={scrollProgress}
      />
      <BuildingLayer
        data={data as Parameters<typeof BuildingLayer>[0]['data']}
        stage={stage}
        scrollProgress={scrollProgress}
      />
    </>
  );
}

export function MapScene({ scrollProgress: _ext, onStageChange }: MapSceneProps) {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [stage, setStage] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const triggerRef = useRef<ScrollTrigger | null>(null);

  const handleStage = useCallback((s: number) => {
    setStage(s);
    onStageChange?.(s);
  }, [onStageChange]);

  useEffect(() => {
    fetch('/maps/scene-data.json')
      .then((r) => r.json())
      .then(setData)
      .catch((e) => console.error('Map data load failed', e));
  }, []);

  useEffect(() => {
    // Wait for full DOM paint before creating trigger
    const init = () => {
      // Kill any previous trigger
      triggerRef.current?.kill();

      triggerRef.current = ScrollTrigger.create({
        trigger: document.documentElement,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.2,
        onUpdate: (self) => {
          const p = self.progress;
          setScrollProgress(p);
          if (p < 0.25) handleStage(0);
          else if (p < 0.5) handleStage(1);
          else if (p < 0.75) handleStage(2);
          else handleStage(3);
        },
      });

      ScrollTrigger.refresh();
    };

    // Double requestAnimationFrame ensures DOM is fully painted
    requestAnimationFrame(() => requestAnimationFrame(init));

    return () => {
      triggerRef.current?.kill();
    };
  }, [handleStage]);

  return (
    <Canvas
      shadows
      className="w-full h-full pointer-events-none"
      gl={{ antialias: true, alpha: false }}
      onCreated={({ gl }) => {
        gl.setClearColor('#ffffff', 1);
      }}
    >
      <PerspectiveCamera makeDefault position={[0, 350, 0]} fov={42} near={1} far={2000} />
      <SceneInternal data={data} stage={stage} scrollProgress={scrollProgress} />
    </Canvas>
  );
}