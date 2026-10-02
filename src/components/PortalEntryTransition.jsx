import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * PortalEntryTransition
 * 
 * Provides the complementary celestial portal entry transition when arriving
 * at the Journey page from the About page.
 * 
 * Seamlessly resolves the warp effect initiated by PortalTransition:
 * - Begins with the deep backdrop (#14171D) at opacity 1 for 100% seamless continuity
 *   with the exit veil, completely eliminating any visual popping or brightness flash.
 * - Gentle, diffuse residual amber warp shockwave disperses outward into the cosmic void.
 * - Ethereal astrolabe dissipation wave finishes the orbital trajectory cleanly.
 * - Stardust particles drift outward and dissipate naturally into the Journey canvas embers.
 * - Deep veil smoothly dissolves with a bespoke cinematic easing curve ([0.22, 1, 0.36, 1]),
 *   unveiling the Journey page with pristine fluid grace.
 * 
 * Antislop principles maintained:
 * - R-19 (Motion & Purpose): Direct physical continuity with About's exit portal,
 *   zero flash, zero reflow, 60/120fps hardware acceleration.
 * - R-01 & R-29 (Color): Grounded strictly in warm amber (#e5ad68) and deep charcoal (#14171D).
 * - Non-blocking: Marked pointer-events-none; interaction is never hijacked.
 * - Reduced motion compliance: Instant gentle opacity dissolve when preferred.
 */
export default function PortalEntryTransition({ fromPortal = true, onComplete }) {
  const [isActive, setIsActive] = useState(true);

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    // 750ms for portal arrival, 300ms for direct navigation or reduced motion
    const duration = prefersReducedMotion || !fromPortal ? 300 : 750;
    const timer = setTimeout(() => {
      setIsActive(false);
      if (onComplete) onComplete();
    }, duration);

    return () => clearTimeout(timer);
  }, [fromPortal, onComplete, prefersReducedMotion]);

  // Pre-generate resolving stardust particles that disperse outward into the cosmos
  const particles = useMemo(() => {
    return Array.from({ length: 16 }, (_, i) => {
      const angle = (i / 16) * 2 * Math.PI + (i % 2 === 0 ? 0.06 : -0.06);
      const distance = 420 + (i % 3) * 160 + (i % 2) * 80;
      const size = (i % 3) * 0.7 + 1.5;
      return {
        id: i,
        startX: Math.cos(angle) * (distance * 0.5),
        startY: Math.sin(angle) * (distance * 0.5),
        endX: Math.cos(angle) * distance,
        endY: Math.sin(angle) * distance,
        size
      };
    });
  }, []);

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center overflow-hidden"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.3, ease: 'easeOut' } }}
          aria-hidden="true"
        >
          {/* 1. Deep cinematic backdrop veil dissolving out into the Journey background */}
          {/* Starts at opacity: 1, creating a 100% seamless handoff from About page's exit backdrop */}
          <motion.div
            className="absolute inset-0 bg-[#14171D] transform-gpu"
            style={{ willChange: 'opacity' }}
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{
              duration: prefersReducedMotion ? 0.3 : 0.75,
              ease: [0.22, 1, 0.36, 1]
            }}
          />

          {/* 2. Cinematic dark edge vignette dissolving */}
          <motion.div
            className="absolute inset-0 pointer-events-none transform-gpu"
            style={{
              boxShadow: 'inset 0 0 120px rgba(0, 0, 0, 0.85)',
              willChange: 'opacity'
            }}
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{
              duration: prefersReducedMotion ? 0.3 : 0.7,
              ease: 'easeOut'
            }}
          />

          {!prefersReducedMotion && fromPortal && (
            <>
              {/* 3. Residual warm amber warp shockwave dissipating into the canvas */}
              {/* Starts already wide and gently disperses outward without sudden flash or reflow */}
              <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] rounded-full pointer-events-none transform-gpu"
                style={{
                  background:
                    'radial-gradient(circle, rgba(229,173,104,0.30) 0%, rgba(229,173,104,0.10) 45%, rgba(10,12,16,0) 70%)',
                  filter: 'blur(36px)',
                  willChange: 'transform, opacity'
                }}
                initial={{
                  scale: 1.2,
                  opacity: 0.38
                }}
                animate={{
                  scale: 2.6,
                  opacity: 0
                }}
                transition={{
                  duration: 0.75,
                  ease: [0.16, 1, 0.3, 1]
                }}
              />

              {/* 4. Astrolabe Dissipation Wave: faint outer ring completing the expansion */}
              <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[540px] h-[540px] rounded-full border border-[#e5ad68]/30 flex items-center justify-center pointer-events-none transform-gpu"
                style={{
                  boxShadow: '0 0 25px rgba(229, 173, 104, 0.25)',
                  willChange: 'transform, opacity'
                }}
                initial={{
                  scale: 1.25,
                  rotate: 140,
                  opacity: 0.32
                }}
                animate={{
                  scale: 2.4,
                  rotate: 185,
                  opacity: 0
                }}
                transition={{
                  duration: 0.72,
                  ease: [0.16, 1, 0.3, 1]
                }}
              >
                <div className="absolute top-0 w-1.5 h-1.5 rounded-full bg-[#e5ad68]/80" />
                <div className="absolute bottom-0 w-1.5 h-1.5 rounded-full bg-[#e5ad68]/80" />
                <div className="absolute left-0 w-1.5 h-1.5 rounded-full bg-[#e5ad68]/80" />
                <div className="absolute right-0 w-1.5 h-1.5 rounded-full bg-[#e5ad68]/80" />
              </motion.div>

              {/* 5. Dissipating Stardust warp particles drifting outward */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {particles.map((p) => (
                  <motion.div
                    key={p.id}
                    className="absolute rounded-full bg-[#f5d7aa] transform-gpu"
                    style={{
                      width: `${p.size}px`,
                      height: `${p.size}px`,
                      boxShadow: '0 0 8px rgba(229, 173, 104, 0.6)',
                      willChange: 'transform, opacity'
                    }}
                    initial={{
                      x: p.startX,
                      y: p.startY,
                      opacity: 0.42,
                      scale: 1.0
                    }}
                    animate={{
                      x: p.endX,
                      y: p.endY,
                      opacity: 0,
                      scale: 0.3
                    }}
                    transition={{
                      duration: 0.7,
                      ease: [0.16, 1, 0.3, 1]
                    }}
                  />
                ))}
              </div>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
