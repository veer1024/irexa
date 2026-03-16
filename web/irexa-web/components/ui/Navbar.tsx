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
      <div className="font-headline font-bold text-xl tracking-tight">
        IREXA
      </div>
      <div className="hidden md:flex items-center space-x-8 font-label text-sm font-medium">
        <a href="#stage-1" className="hover:text-accent transition-colors">Home</a>
        <a href="#stage-2" className="hover:text-accent transition-colors">Product</a>
        <a href="#stage-3" className="hover:text-accent transition-colors">About</a>
        <a href="#contact" className="hover:text-accent transition-colors">Contact</a>
      </div>
      <button className="md:hidden font-label text-sm uppercase tracking-wider">
        Menu
      </button>
    </motion.nav>
  );
}
