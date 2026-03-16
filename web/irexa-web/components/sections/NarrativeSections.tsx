"use client";

import { motion } from 'framer-motion';

const sections = [
  {
    id: 'stage-1',
    title: 'Terrain Analysis',
    description: 'High-resolution elevation mapping generates real-time contour intelligence — every ridge, valley, and gradient captured with sub-meter precision.',
    coord: 'ELEVATION MODEL · ACTIVE',
    tag: '01 / TERRAIN',
    align: 'left',
  },
  {
    id: 'stage-2',
    title: 'Structure Detection',
    description: 'AI algorithms scan the terrain layer, isolating building footprints from noise. Each polygon is verified and tagged for volumetric reconstruction.',
    coord: 'FOOTPRINT DETECTION · SCANNING',
    tag: '02 / DETECTION',
    align: 'right',
  },
  {
    id: 'stage-3',
    title: '3D Intelligence',
    description: 'Footprints are extruded into full 3D models with height attribution. The resulting urban mesh becomes the foundation for mission planning and spatial analysis.',
    coord: 'MESH GENERATION · COMPLETE',
    tag: '03 / INTELLIGENCE',
    align: 'left',
  },
];

export function NarrativeSections() {
  return (
    <div>
      {sections.map((section, index) => (
        <section
          key={index}
          id={section.id}
          className="min-h-screen flex items-center px-12 py-24 pointer-events-none"
        >
          <motion.div
            className={`max-w-lg ${section.align === 'right' ? 'ml-auto' : ''}`}
            initial={{ opacity: 0, x: section.align === 'right' ? 60 : -60 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true, amount: 0.4 }}
          >
            {/* Tag */}
            <div className="font-label text-xs tracking-[0.3em] text-black/40 mb-4 uppercase">
              {section.tag}
            </div>

            {/* Title */}
            <h2 className="text-4xl md:text-5xl font-headline font-bold mb-5 leading-tight">
              {section.title}
            </h2>

            {/* Description */}
            <p className="text-base md:text-lg font-body text-black/70 leading-relaxed mb-8">
              {section.description}
            </p>

            {/* Status line */}
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[#00FF9C] animate-pulse" />
              <span className="font-label text-xs tracking-widest text-black/50 uppercase">
                {section.coord}
              </span>
            </div>
          </motion.div>
        </section>
      ))}
    </div>
  );
}