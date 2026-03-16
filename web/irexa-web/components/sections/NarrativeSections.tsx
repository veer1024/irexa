"use client";

import { motion } from 'framer-motion';

const sections = [
  {
    id: 'stage-1',
    title: 'terrain analysis',
    description: 'high-resolution elevation mapping generates real-time contour intelligence — every ridge, valley, and gradient captured with sub-meter precision.',
    coord: 'elevation model · active',
    tag: '01 / terrain',
    align: 'left',
  },
  {
    id: 'stage-2',
    title: 'structure detection',
    description: 'ai algorithms scan the terrain layer, isolating building footprints from noise. each polygon is verified and tagged for volumetric reconstruction.',
    coord: 'footprint detection · scanning',
    tag: '02 / detection',
    align: 'right',
  },
  {
    id: 'stage-3',
    title: '3d intelligence',
    description: 'footprints are extruded into full 3d models with height attribution. the resulting urban mesh becomes the foundation for mission planning and spatial analysis.',
    coord: 'mesh generation · complete',
    tag: '03 / intelligence',
    align: 'left',
  },
];

export function NarrativeSections({ activeStage }: { activeStage: number }) {
  return (
    <div className="relative z-10">
      {sections.map((section, index) => {
        // Stage 0 is Hero. Stage 1 is Section 0, and so on.
        const isVisible = activeStage === index + 1;
        
        return (
          <section
            key={index}
            id={section.id}
            className="min-h-screen flex items-center px-12 py-24 pointer-events-none"
          >
            <motion.div
              className={`max-w-lg ${section.align === 'right' ? 'ml-auto' : ''} fixed inset-0 flex flex-col justify-center px-12 pointer-events-none`}
              initial={{ opacity: 0, y: 30 }}
              animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: -30 }}
              transition={{ 
                duration: 1.2, 
                ease: [0.16, 1, 0.3, 1],
                delay: isVisible ? 0.3 : 0 // Delay entry to let map animate first
              }}
              style={{ display: isVisible ? 'flex' : 'none' }}
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
                {section.coord.toLowerCase()}
              </span>
            </div>
          </motion.div>
        </section>
      );
      })}
    </div>
  );
}