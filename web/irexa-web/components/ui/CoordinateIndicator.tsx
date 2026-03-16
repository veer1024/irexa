import { motion } from 'framer-motion';

interface CoordinateIndicatorProps {
  coord: string;
  value: string;
}

export function CoordinateIndicator({ coord, value }: CoordinateIndicatorProps) {
  return (
    <motion.div
      className="font-label text-xs tracking-wider opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
      whileHover={{ scale: 1.05 }}
    >
      <div className="text-accent">{coord}:</div>
      <div>{value}</div>
    </motion.div>
  );
}