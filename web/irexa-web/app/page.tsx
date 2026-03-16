"use client";

import { HeroSection } from '../components/hero/HeroSection';
import { NarrativeSections } from '../components/sections/NarrativeSections';
import dynamic from 'next/dynamic';

const MapScene = dynamic(() => import('../components/map/MapScene').then(mod => mod.MapScene), {
  ssr: false,
});

export default function Home() {
  return (
    <main className="bg-black text-white relative w-full h-full">
      {/* Fixed Map Background */}
      <div className="fixed inset-0 z-0">
        <MapScene scrollProgress={0} /> {/* Scroll progress will now be managed internally by MapScene via GSAP */}
      </div>

      {/* Scrollable Overlay Components */}
      <div className="relative z-10 w-full">
        <HeroSection />
        <NarrativeSections />
      </div>
    </main>
  );
}
