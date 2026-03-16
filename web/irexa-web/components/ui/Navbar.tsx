"use client";

import { useState } from 'react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';

export function Navbar() {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() || 0;
    if (latest > previous && latest > 150) {
      // Scrolling down and past initial threshold
      setHidden(true);
    } else if (latest < previous) {
      // Scrolling up
      setHidden(false);
    }
  });

  return (
    <motion.nav
      variants={{
        visible: { y: 0 },
        hidden: { y: "-100%" },
      }}
      animate={hidden ? "hidden" : "visible"}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className="fixed top-0 inset-x-0 z-50 px-6 py-4 flex items-center justify-between bg-white/80 backdrop-blur-md border-b border-black/10"
    >
      {/* Logo: ir e^x a */}
      <div className="w-1/4">
        <div className="font-headline font-bold text-xl tracking-tight flex items-baseline cursor-pointer">
          ir<span className="text-[#87C643]">e<sup>x</sup></span>a
        </div>
      </div>

      {/* Centered Links */}
      <div className="hidden md:flex flex-1 justify-center space-x-12 font-label text-sm font-medium">
        <a href="#stage-1" className="hover:text-accent transition-colors">home</a>
        <a href="#stage-2" className="hover:text-accent transition-colors">product</a>
        <a href="#stage-3" className="hover:text-accent transition-colors">about</a>
      </div>

      {/* Right side alignment */}
      <div className="w-1/4 flex justify-end">
        <button className="hidden md:block hover:text-accent transition-colors font-label text-sm uppercase tracking-wider">
          contact
        </button>
        <button className="md:hidden font-label text-sm uppercase tracking-wider">
          menu
        </button>
      </div>
    </motion.nav>
  );
}
