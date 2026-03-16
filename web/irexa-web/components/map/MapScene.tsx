"use client";

import { useEffect, useState, useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import { TerrainLayer } from './TerrainLayer';
import { ContourLayer } from './ContourLayer';
import { BuildingLayer } from './BuildingLayer';
import { ScanEffect } from './ScanEffect';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as THREE from 'three';

gsap.registerPlugin(ScrollTrigger);

interface MapSceneProps {
  scrollProgress?: number; // Kept for backwards compatibility but we rely on internal GSAP state
}

function SceneOrchestrator({ data, setStage, stage, setProgress }: any) {
  const { camera } = useThree();
  const [internalStage, setInternalStage] = useState(0);
  // Generate pseudo-random coordinates to zoom into during stages
  const target1 = useMemo(() => new THREE.Vector3(Math.random() * 200 - 100, 0, Math.random() * 200 - 100), []);
  const target2 = useMemo(() => new THREE.Vector3(Math.random() * 200 - 100, 0, Math.random() * 200 - 100), []);
  const target3 = useMemo(() => new THREE.Vector3(Math.random() * 200 - 100, 0, Math.random() * 200 - 100), []);

  const currentLookAt = useRef(new THREE.Vector3(0, 0, 0));

  useEffect(() => {
    // Starting camera position (Top down, zoomed out)
    camera.position.set(0, 350, 0);

    // Build the master ScrollTrigger timeline linked to body scroll
    const scrollTl = gsap.timeline({
      scrollTrigger: {
        trigger: document.body,
        start: "top top",
        end: "bottom bottom",
        scrub: 1, // Smooth scrubbing
        onUpdate: (self) => {
          setProgress(self.progress);
        }
      }
    });

    // Stage 1 -> 2: Camera pans, tilts, and zooms into target 1
    scrollTl.to(camera.position, {
      x: target1.x, y: 150, z: target1.z + 50, duration: 1,
      onStart: () => setStage(0),
      onComplete: () => { setStage(1); setInternalStage(1); }
    }, "0")
    
    // Stage 2 -> 3: Full Perspective, zoom close to target 2
    .to(camera.position, {
      x: target2.x, y: 70, z: target2.z + 100, duration: 2,
      onComplete: () => { setStage(2); setInternalStage(2); },
      onReverseComplete: () => { setStage(1); setInternalStage(1); }
    }, ">");

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, [camera, setStage, setProgress, target1, target2, target3]);

  useFrame((state, delta) => {
    // Dynamically update the LookAt target based on the stage
    let target = new THREE.Vector3(0, 0, 0);
    if (internalStage === 1) target = target1;
    if (internalStage === 2) target = target2;

    currentLookAt.current.lerp(target, 2 * delta);
    camera.lookAt(currentLookAt.current);
  });

  return (
    <>
      {/* @ts-ignore */}
      <ambientLight intensity={0.4} />
      {/* @ts-ignore */}
      <directionalLight position={[10, 50, 30]} intensity={1.5} color="#00FF9C" />

      {/* Layers */}
      <TerrainLayer data={data} />
      <ContourLayer data={data} />
      <BuildingLayer data={data} stage={stage} progress={ScrollTrigger.maxScroll(window) > 0 ? window.scrollY / ScrollTrigger.maxScroll(window) : 0} />
      <ScanEffect stage={stage} />
    </>
  );
}

export function MapScene({ scrollProgress }: MapSceneProps) {
  const [data, setData] = useState<{ buildings: any; contours: any } | null>(null);
  const [stage, setStage] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Fetch mock map data (GeoJSON interpreted as features)
    fetch('/maps/terrain.topo.json')
      .then(res => res.json())
      .then(json => setData(json))
      .catch(err => console.error("Could not load map data", err));
  }, []);

  return (
    // @ts-ignore
    <Canvas className="w-full h-full pointer-events-none">
      {/* @ts-ignore */}
      <PerspectiveCamera makeDefault position={[0, 120, 0]} fov={45} />
      
      {/* Dynamic Orchestrator handles camera state and animation logic */}
      <SceneOrchestrator 
        data={data} 
        setStage={setStage} 
        stage={stage} 
        setProgress={setProgress} 
      />
    </Canvas>
  );
}