import { motion } from 'framer-motion';

export function ScanAnimation() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <motion.div
        className="absolute top-0 left-0 w-full h-0.5 bg-accent"
        initial={{ y: '-100%' }}
        animate={{ y: '100vh' }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'linear',
        }}
        style={{ opacity: 0.3 }}
      />
    </div>
  );
}