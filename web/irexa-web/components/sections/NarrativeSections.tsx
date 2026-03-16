"use client";

import { motion } from 'framer-motion';

const sections = [
  {
    id: 'stage-1',
    title: 'Terrain Analysis',
    description: 'Initial spatial data processing and terrain mapping.',
    coord: 'COORD: 40.7128°N 74.0060°W',
  },
  {
    id: 'stage-2',
    title: 'AI Detection',
    description: 'Advanced algorithms identify structural patterns and anomalies.',
    coord: 'DETECTION: ACTIVE',
  },
  {
    id: 'stage-3',
    title: '3D Intelligence',
    description: 'Real-time extrusion and spatial intelligence generation.',
    coord: 'MODEL: IREXA v2.1',
  },
];

export function NarrativeSections() {
  return (
    <div className="py-20">
      {sections.map((section, index) => (
        <motion.section
          key={index}
          id={section.id}
          className="min-h-screen flex items-center justify-center px-6 pointer-events-none"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="max-w-4xl text-center">
            <div className="font-label text-accent text-sm mb-4 tracking-wider">
              {section.coord}
            </div>
            <h2 className="text-4xl md:text-6xl font-headline font-bold mb-6">
              {section.title}
            </h2>
            <p className="text-xl font-body leading-relaxed max-w-2xl mx-auto">
              {section.description}
            </p>
          </div>
        </motion.section>
      ))}
    </div>
  );
}