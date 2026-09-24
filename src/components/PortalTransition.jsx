import { useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PortalTransition({ isActive, onComplete }) {
  useEffect(() => {
    if (isActive) {
      // 1.35s: Rich, cinematic celestial gate activation without being overlong
      const timer = setTimeout(() => {
        if (onComplete) onComplete();
      }, 1350);
      return () => clearTimeout(timer);
    }
  }, [isActive, onComplete]);

  // Pre-generate radial stardust streak particles
  const particles = useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => {
      const angle = (i / 24) * 2 * Math.PI + (i % 2 === 0 ? 0.08 : -0.08);
      const distance = 320 + (i % 3) * 160 + (i % 2) * 80;
      const size = (i % 4) * 0.7 + 1.8;
      const delay = (i % 5) * 0.03;
      return {
        id: i,
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        size,
        delay
      };
    });
  }, []);

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.35, ease: 'easeOut' } }}
        >
          {/* Deep cinematic backdrop dissolve into #0a0c10 (Journey background) */}
          <motion.div
            className="absolute inset-0 bg-[#0a0c10]"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.3, 0.75, 1] }}
            transition={{ duration: 1.35, ease: 'easeInOut' }}
          />

          {/* Cinematic dark edge vignette closing in */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              boxShadow: 'inset 0 0 120px rgba(0, 0, 0, 0.85)'
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.6, 1] }}
            transition={{ duration: 1.35, ease: 'easeOut' }}
          />

          {/* Central soft warm amber glow core (NO blinding white) */}
          <motion.div
            className="absolute rounded-full pointer-events-none"
            style={{
              background:
                'radial-gradient(circle, rgba(229,173,104,0.35) 0%, rgba(229,173,104,0.14) 35%, rgba(10,12,16,0) 70%)',
              filter: 'blur(35px)'
            }}
            initial={{ width: 140, height: 140, scale: 0.7, opacity: 0 }}
            animate={{
              width: ['140px', '800px', '2600px'],
              height: ['140px', '800px', '2600px'],
              scale: [0.7, 1.8, 3.4],
              opacity: [0, 0.85, 0.3, 0]
            }}
            transition={{
              duration: 1.35,
              ease: [0.16, 1, 0.3, 1]
            }}
          />

          {/* Celestial Astrolabe Ring 1: Clockwise rotating compass ring */}
          <motion.div
            className="absolute rounded-full border border-[#e5ad68]/50 flex items-center justify-center pointer-events-none"
            style={{
              boxShadow: '0 0 25px rgba(229, 173, 104, 0.35)'
            }}
            initial={{ width: 120, height: 120, scale: 0.6, rotate: 0, opacity: 0 }}
            animate={{
              width: ['120px', '600px', '2200px'],
              height: ['120px', '600px', '2200px'],
              scale: [0.6, 1.5, 3.2],
              rotate: [0, 75, 150],
              opacity: [0, 0.9, 0]
            }}
            transition={{
              duration: 1.35,
              ease: [0.16, 1, 0.3, 1]
            }}
          >
            {/* Cardinal tick accents on the ring */}
            <div className="absolute top-0 w-1.5 h-1.5 rounded-full bg-[#e5ad68]" />
            <div className="absolute bottom-0 w-1.5 h-1.5 rounded-full bg-[#e5ad68]" />
            <div className="absolute left-0 w-1.5 h-1.5 rounded-full bg-[#e5ad68]" />
            <div className="absolute right-0 w-1.5 h-1.5 rounded-full bg-[#e5ad68]" />
          </motion.div>

          {/* Celestial Astrolabe Ring 2: Counter-clockwise dashed ring */}
          <motion.div
            className="absolute rounded-full border border-dashed border-[#e5ad68]/35 pointer-events-none"
            initial={{ width: 180, height: 180, scale: 0.5, rotate: 0, opacity: 0 }}
            animate={{
              width: ['180px', '850px', '2800px'],
              height: ['180px', '850px', '2800px'],
              scale: [0.5, 1.6, 3.6],
              rotate: [0, -60, -120],
              opacity: [0, 0.75, 0]
            }}
            transition={{
              duration: 1.35,
              delay: 0.08,
              ease: [0.22, 1, 0.36, 1]
            }}
          />

          {/* Radiating Stardust Warp Particles */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {particles.map((p) => (
              <motion.div
                key={p.id}
                className="absolute rounded-full bg-[#f5d7aa]"
                style={{
                  width: `${p.size}px`,
                  height: `${p.size}px`,
                  boxShadow: '0 0 10px rgba(229, 173, 104, 0.8)'
                }}
                initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
                animate={{
                  x: [0, p.x * 0.4, p.x],
                  y: [0, p.y * 0.4, p.y],
                  opacity: [0, 0.95, 0.7, 0],
                  scale: [0, 1.8, 0.6]
                }}
                transition={{
                  duration: 1.25,
                  delay: p.delay,
                  ease: [0.16, 1, 0.3, 1]
                }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
