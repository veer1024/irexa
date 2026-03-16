"use client";

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export function ProductShowcase() {
  const router = useRouter();

  return (
    <section className="relative w-full py-32 px-6 mt-32">
      <div className="relative z-10 max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-6xl font-headline font-bold tracking-tighter mb-6">
            Our Product
          </h2>
          <p className="text-lg md:text-xl text-black/60 max-w-3xl mx-auto leading-relaxed">
            Lightweight, time-saving, and highly accessible spatial intelligence files that deliver ~95% accuracy in map height rendering.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 mb-16">
          {/* GeoJSON Card */}
          <motion.div
            className="relative p-10 rounded-3xl border border-gray-200/50 bg-gradient-to-br from-white via-gray-50/50 to-white shadow-[inset_0_1px_0_rgba(255,255,255,0.9),inset_0_-1px_0_rgba(0,0,0,0.05),0_8px_32px_rgba(0,0,0,0.08),0_0_0_1px_rgba(255,255,255,0.05)] hover:shadow-[inset_0_2px_4px_rgba(255,255,255,0.8),inset_0_-2px_4px_rgba(0,0,0,0.1),0_12px_40px_rgba(0,0,0,0.12),0_0_0_1px_rgba(255,255,255,0.1)] transition-all duration-500 group"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 shadow-[inset_0_4px_8px_rgba(255,255,255,0.3),0_8px_16px_rgba(0,0,0,0.2)] flex items-center justify-center overflow-hidden">
                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-blue-600 font-bold text-2xl">GeoJSON</div>
              </div>
              <div className="w-full h-32 mb-6 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 shadow-[inset_0_2px_4px_rgba(255,255,255,0.5),inset_0_-2px_4px_rgba(0,0,0,0.1)] flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                  <svg width="100%" height="100%" viewBox="0 0 200 100" className="text-gray-400">
                    <text x="10" y="20" fontSize="12" fill="currentColor">&lbrace;</text>
                    <text x="20" y="35" fontSize="10" fill="currentColor">"type": "Feature"</text>
                    <text x="20" y="50" fontSize="10" fill="currentColor">"geometry": &lbrace;</text>
                    <text x="30" y="65" fontSize="10" fill="currentColor">"type": "Polygon"</text>
                    <text x="30" y="80" fontSize="10" fill="currentColor">"coordinates": [[[...]]]</text>
                    <text x="20" y="95" fontSize="12" fill="currentColor">&rbrace;</text>
                    <text x="10" y="110" fontSize="12" fill="currentColor">&rbrace;</text>
                  </svg>
                </div>
                <div className="text-gray-500 text-sm relative z-10">3D Terrain Rendering Preview</div>
              </div>
              <h3 className="text-2xl font-headline font-bold mb-4">GeoJSON</h3>
              <p className="text-black/70 mb-6">
                Structured geospatial data format for accurate terrain contours and features. Under 2MB for fast loading and processing.
              </p>
              <div className="text-sm text-black/50">
                <p>• Lightweight &lt;2MB</p>
                <p>• 95% height accuracy</p>
                <p>• Widely supported</p>
              </div>
            </div>
          </motion.div>

          {/* GLB Card */}
          <motion.div
            className="relative p-10 rounded-3xl border border-gray-200/50 bg-gradient-to-br from-white via-gray-50/50 to-white shadow-[inset_0_1px_0_rgba(255,255,255,0.9),inset_0_-1px_0_rgba(0,0,0,0.05),0_8px_32px_rgba(0,0,0,0.08),0_0_0_1px_rgba(255,255,255,0.05)] hover:shadow-[inset_0_2px_4px_rgba(255,255,255,0.8),inset_0_-2px_4px_rgba(0,0,0,0.1),0_12px_40px_rgba(0,0,0,0.12),0_0_0_1px_rgba(255,255,255,0.1)] transition-all duration-500 group"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-green-400 to-green-600 shadow-[inset_0_4px_8px_rgba(255,255,255,0.3),0_8px_16px_rgba(0,0,0,0.2)] flex items-center justify-center overflow-hidden">
                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-green-600 font-bold text-2xl">GLB</div>
              </div>
              <div className="w-full h-32 mb-6 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 shadow-[inset_0_2px_4px_rgba(255,255,255,0.5),inset_0_-2px_4px_rgba(0,0,0,0.1)] flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                  <svg width="100%" height="100%" viewBox="0 0 200 100" className="text-gray-400">
                    <polygon points="50,20 100,50 50,80 0,50" fill="none" stroke="currentColor" strokeWidth="1"/>
                    <polygon points="100,20 150,50 100,80 50,50" fill="none" stroke="currentColor" strokeWidth="1"/>
                    <line x1="75" y1="35" x2="75" y2="65" stroke="currentColor" strokeWidth="1"/>
                    <line x1="125" y1="35" x2="125" y2="65" stroke="currentColor" strokeWidth="1"/>
                  </svg>
                </div>
                <div className="text-gray-500 text-sm relative z-10">3D Building Rendering Preview</div>
              </div>
              <h3 className="text-2xl font-headline font-bold mb-4">GLB</h3>
              <p className="text-black/70 mb-6">
                Optimized 3D model format for rendering detailed urban environments. Compact size with high fidelity.
              </p>
              <div className="text-sm text-black/50">
                <p>• Lightweight &lt;2MB</p>
                <p>• 95% height accuracy</p>
                <p>• Universal compatibility</p>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
        >
          <button
            onClick={() => router.push('/project-details')}
            className="px-10 py-5 bg-gradient-to-r from-black to-gray-800 text-white font-label uppercase tracking-wider rounded-2xl shadow-[inset_0_2px_4px_rgba(255,255,255,0.1),0_8px_24px_rgba(0,0,0,0.3)] hover:shadow-[inset_0_4px_8px_rgba(255,255,255,0.2),0_12px_32px_rgba(0,0,0,0.4)] hover:scale-105 transition-all duration-300"
          >
            Learn More
          </button>
        </motion.div>
      </div>
    </section>
  );
}