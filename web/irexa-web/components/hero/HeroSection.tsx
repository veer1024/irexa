"use client";

import { motion } from 'framer-motion';
import { CoordinateIndicator } from '../ui/CoordinateIndicator';

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-6 pointer-events-none">
      {/* Subtle grid overlay */}
      {/* <div className="absolute inset-0 opacity-10">
        <div
          className="w-full h-full"
          style={{
            backgroundImage:
              'linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </div> */}

      {/* Center content */}
      <div className="relative z-10 text-center">
        <motion.div
          className="font-label text-xs tracking-[0.4em] text-black/40 mb-6 uppercase"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          Spatial Intelligence Platform
        </motion.div>

        <motion.h1
          className="text-7xl md:text-9xl font-headline font-bold tracking-tighter leading-none flex items-baseline justify-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          ir<span className="text-[#87C643]">e<sup>x</sup></span>a
        </motion.h1>

        <motion.p
          className="text-lg md:text-xl font-body text-black/60 mt-6 max-w-md mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          from raw elevation data to full 3D urban intelligence — in real time.
        </motion.p>

        {/* Scroll cue */}
        <motion.div
          className="mt-16 flex flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
        >
          <span className="font-label text-xs tracking-widest text-black/30 uppercase text-lowercase">scroll to explore</span>
          <div className="w-px h-12 bg-linear-to-b from-black/20 to-transparent" />
        </motion.div>
      </div>

      {/* Corner labels */}
      <div className="absolute top-8 left-8 space-y-2">
        <CoordinateIndicator coord="coord" value="40.7128°n 74.0060°w" />
        <CoordinateIndicator coord="status" value="active" />
      </div>

      <div className="absolute bottom-8 right-8 space-y-2 text-right">
        <CoordinateIndicator coord="ai model" value="irexa v2.1" />
        <CoordinateIndicator coord="data stream" value="live" />
      </div>
    </section>
  );
}