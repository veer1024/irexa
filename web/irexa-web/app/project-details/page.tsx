"use client";

import { Navbar } from '../../components/ui/Navbar';
import { Footer } from '../../components/ui/Footer';

export default function ProjectDetails() {
  return (
    <main className="relative min-h-screen bg-white text-black overflow-x-hidden">
      {/* 1. THE AESTHETIC BACKGROUND LAYER */}
      <div className="fixed inset-0 z-0">
        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.03] [background-image:linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] [background-size:40px_40px]"></div>
        
        {/* THE FOCAL BLUR LAYER (0% at edges, 10px at center) */}
        <div 
          className="absolute inset-0 backdrop-blur-[10px] pointer-events-none"
          style={{
            maskImage: 'linear-gradient(to bottom, transparent 0%, black 40%, black 60%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 40%, black 60%, transparent 100%)'
          }}
        />
      </div>

      {/* 2. CONTENT LAYER */}
      <div className="relative z-10">
        <Navbar />

        <section className="pt-32 pb-20 px-6">
          <div className="max-w-4xl mx-auto">
            {/* Header with a little more "Tech" flair */}
            <div className="mb-16">
              <span className="text-accent font-mono text-xs tracking-[0.3em] uppercase mb-4 block">Documentation // v2.1</span>
              <h1 className="text-5xl md:text-7xl font-headline font-bold tracking-tighter">
                Project Details
              </h1>
              <div className="h-1 w-20 bg-black mt-6"></div>
            </div>

            <div className="space-y-20">
              {/* Our Solution */}
              <section>
                <h2 className="text-sm font-mono uppercase tracking-widest text-gray-400 mb-6">01. Our Solution</h2>
                <div className="grid md:grid-cols-5 gap-8">
                  <div className="md:col-span-3">
                    <p className="text-xl text-black/80 leading-relaxed font-medium">
                      IREXA provides cutting-edge spatial intelligence through lightweight, highly accurate file formats that transform raw elevation data into actionable 3D urban intelligence.
                    </p>
                  </div>
                  <div className="md:col-span-2 text-sm text-black/60 border-l border-black/10 pl-6 flex items-center">
                    Proprietary processing delivers ~95% accuracy while maintaining file sizes under 2MB.
                  </div>
                </div>
              </section>

              {/* File Formats - Glassmorphism style */}
              <section>
                <h2 className="text-sm font-mono uppercase tracking-widest text-gray-400 mb-6">02. Optimized Formats</h2>
                <div className="grid md:grid-cols-2 gap-8">
                  {[
                    { title: "GeoJSON", desc: "Standard geospatial data containing terrain contours and building footprints.", specs: ["Size: <2MB", "Accuracy: ~95%", "Format: JSON-based"] },
                    { title: "GLB", desc: "Binary glTF format for 3D models, containing optimized mesh data.", specs: ["Size: <2MB", "Accuracy: ~95%", "Format: Binary 3D"] }
                  ].map((item) => (
                    <div key={item.title} className="p-8 rounded-2xl border border-black/5 bg-white/40 backdrop-blur-sm hover:border-black/20 transition-colors">
                      <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                      <p className="text-black/70 mb-6 text-sm leading-relaxed">{item.desc}</p>
                      <div className="flex flex-wrap gap-3">
                        {item.specs.map(spec => (
                          <span key={spec} className="px-3 py-1 bg-black text-white text-[10px] font-mono uppercase tracking-tighter">
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Key Benefits - Minimal icons */}
              <section className="py-12 border-y border-black/5">
                <div className="grid md:grid-cols-3 gap-12">
                  {[
                    { icon: "⚡", label: "Lightning Fast", sub: "Sub-2MB files load instantly" },
                    { icon: "🎯", label: "High Accuracy", sub: "95% precision in spatial data" },
                    { icon: "🌐", label: "Universal", sub: "Compatible with all platforms" }
                  ].map(benefit => (
                    <div key={benefit.label} className="group">
                      <div className="text-2xl mb-4 group-hover:scale-110 transition-transform duration-300 inline-block">{benefit.icon}</div>
                      <h3 className="font-bold mb-1 text-lg">{benefit.label}</h3>
                      <p className="text-sm text-black/50">{benefit.sub}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Technical Specifications */}
              <section className="bg-black text-white p-10 rounded-3xl">
                <h2 className="text-2xl font-bold mb-8">Technical Specifications</h2>
                <div className="grid sm:grid-cols-2 gap-y-6 gap-x-12">
                  {[
                    { k: "Processing Time", v: "Real-time conversion" },
                    { k: "Compression", v: "Advanced proprietary algorithms" },
                    { k: "Compatibility", v: "WebGL, Three.js, GIS" },
                    { k: "Security", v: "Enterprise-grade encryption" }
                  ].map(spec => (
                    <div key={spec.k} className="border-b border-white/10 pb-4">
                      <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1">{spec.k}</p>
                      <p className="font-medium">{spec.v}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </main>
  );
}