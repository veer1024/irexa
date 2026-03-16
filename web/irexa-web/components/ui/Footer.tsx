"use client";

export function Footer() {
  return (
    <footer id="contact" className="relative w-full flex flex-col justify-between text-black pointer-events-auto mt-[-1px]">
      {/* Backdrop blur gradient container */}
      <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-white backdrop-blur-[20px] mask-[linear-gradient(to_top,black_70%,transparent)]" />
      </div>

      <div className="absolute -top-64 left-0 w-full h-64 pointer-events-none z-0" />

      <div className="relative z-10 w-full min-h-[70vh] flex flex-col justify-between px-6 py-12">
        <div className="max-w-7xl mx-auto w-full flex justify-between items-start pt-20">
          <div className="space-y-4 font-body max-w-sm">
            <p className="font-bold text-lg">Contact Us</p>
            <p className="text-black/70">
              Reach out to configure your custom defense intelligence spatial analysis.
            </p>
            <p className="font-label uppercase track-wider pt-4 text-sm text-black/50">info@irexa.ai</p>
          </div>

          <div className="flex space-x-12 font-label text-sm font-medium">
            <div className="flex flex-col space-y-3">
              <span className="text-black/50 mb-2">Platform</span>
              <a href="#" className="hover:text-accent transition-colors">Terrain</a>
              <a href="#" className="hover:text-accent transition-colors">Cities</a>
              <a href="#" className="hover:text-accent transition-colors">API</a>
            </div>
            <div className="flex flex-col space-y-3">
              <span className="text-black/50 mb-2">Company</span>
              <a href="#" className="hover:text-accent transition-colors">About</a>
              <a href="#" className="hover:text-accent transition-colors">Careers</a>
              <a href="#" className="hover:text-accent transition-colors">Security</a>
            </div>
          </div>
        </div>

        <div className="w-full relative mt-auto pt-12 overflow-hidden flex items-end justify-center">
          <h1 className="font-label font-bold text-[35vw] leading-none tracking-tighter m-0 p-0 select-none">
            IREXA
          </h1>
        </div>
      </div>
    </footer>
  );
}
