"use client";

import { HeroSection } from '../components/hero/HeroSection';
import { NarrativeSections } from '../components/sections/NarrativeSections';
import { Navbar } from '../components/ui/Navbar';
import { Footer } from '../components/ui/Footer';
import dynamic from 'next/dynamic';

const MapScene = dynamic(() => import('../components/map/MapScene').then(mod => mod.MapScene), {
  ssr: false,
  loading: () => <div className="fixed inset-0 flex items-center justify-center bg-white z-0"><div className="text-black">Loading 3D Intelligence...</div></div>
});

import { useState } from 'react';
import { ErrorBoundary } from '../components/ErrorBoundary';

export default function Home() {
  const [activeStage, setActiveStage] = useState(0);

  return (
    <main className="bg-white text-black relative w-full h-full min-h-screen">
      <Navbar />

      {/* Fixed Map Background */}
      <div className="fixed inset-0 z-0 bg-white">
        <ErrorBoundary>
          <MapScene onStageChange={setActiveStage} />
        </ErrorBoundary>
      </div>

      {/* Scrollable Overlay Components */}
      <div className="relative z-10 w-full">
        <HeroSection />
        <NarrativeSections activeStage={activeStage} />
      </div>

      <Footer />
    </main>
  );
}
