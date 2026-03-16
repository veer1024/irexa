"use client";

import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { ScanAnimation } from '../ui/ScanAnimation';
import { CoordinateIndicator } from '../ui/CoordinateIndicator';
import { useScrollProgress } from '../../lib/hooks/useScrollProgress';

// Dynamically import MapScene to avoid React Three Fiber module evaluation issues
const MapScene = dynamic(() => import('../map/MapScene').then(mod => mod.MapScene), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-black" />
});

export function HeroSection() {
  const scrollProgress = useScrollProgress();

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden px-6 pointer-events-none">
      {/* Grid Overlay */}
      <div className="absolute inset-0 opacity-20">
        <div className="w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj4KPGcgZmlsbD0iI2ZmZmZmZmIiIGZpbGwtb3BhY2l0eT0iMC4xIj4KPHBhdGggZD0iTTQwIDBMMCAwaDAgNDB6Ii8+CjwvZz4KPC9nPgo8L3N2Zz4K')] bg-repeat"></div>
      </div>

      {/* Scanning Animation */}
      <ScanAnimation />

      {/* Content */}
      <div className="relative z-10 text-center px-6">
        <motion.h1
          className="text-6xl md:text-8xl font-headline font-bold mb-6 tracking-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          IREXA
        </motion.h1>
        <motion.p
          className="text-xl md:text-2xl font-label max-w-2xl mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          Spatial Intelligence Interface
        </motion.p>
        <motion.div
          className="mt-8 text-accent font-label text-sm tracking-wider"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
        >
          INITIALIZING SYSTEM...
        </motion.div>
      </div>

      {/* System Labels */}
      <div className="absolute top-8 left-8 space-y-2">
        <CoordinateIndicator coord="COORD" value="40.7128°N 74.0060°W" />
        <CoordinateIndicator coord="STATUS" value="ACTIVE" />
      </div>

      <div className="absolute bottom-8 right-8 space-y-2">
        <CoordinateIndicator coord="AI MODEL" value="IREXA v2.1" />
        <CoordinateIndicator coord="DATA STREAM" value="LIVE" />
      </div>
    </section>
  );
}