import { useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ExternalLink, Shield } from 'lucide-react';

export default function CollectibleProjectCard({
  project,
  index = 0,
  isActive,
  onSelect
}) {
  const [isHovered, setIsHovered] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { stiffness: 240, damping: 22, mass: 0.35 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);

  const tiltRotateX = useTransform(springY, [-0.5, 0.5], [8, -8]);
  const tiltRotateY = useTransform(springX, [-0.5, 0.5], [-10, 10]);

  const glareOpacity = useTransform(springX, [-0.5, 0, 0.5], [0.15, 0.35, 0.15]);
  const glareBackground = useTransform(
    [springX, springY],
    ([x, y]) =>
      `radial-gradient(circle at ${(x + 0.5) * 100}% ${(y + 0.5) * 100}%, rgba(255,245,220,0.38) 0%, rgba(229,173,104,0.12) 45%, transparent 75%)`
  );

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div
      className="w-full flex flex-col items-center select-none cursor-pointer group active:scale-[0.97] transition-transform duration-150"
      onClick={() => onSelect(project)}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(project);
        }
      }}
      aria-label={`Inspect historical archive folio for ${project.title}`}
    >
      <div
        className="relative w-full flex justify-center will-change-transform"
        style={{
          perspective: 1400,
          transformStyle: 'preserve-3d'
        }}
      >
        <motion.div
          style={{
            rotateX: isHovered ? tiltRotateX : 0,
            rotateY: isHovered ? tiltRotateY : 0,
            transformStyle: 'preserve-3d'
          }}
          animate={{
            scale: isActive ? 1.0 : 0.9,
            opacity: isActive ? 1 : 0.55,
            y: isActive ? (isHovered ? -6 : 0) : 10
          }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-[280px] xs:w-[310px] sm:w-[340px] lg:w-[360px] max-w-full aspect-[16/14] rounded-2xl will-change-transform shrink-0"
        >
          <div
            className={`absolute inset-0 w-full h-full rounded-2xl p-[2.5px] transition-all duration-500 backface-hidden ${
              isActive
                ? 'bg-gradient-to-b from-[#fae8c8] via-[#cda250] to-[#5d3f18] shadow-[0_20px_55px_rgba(0,0,0,0.92),0_0_40px_rgba(205,162,80,0.25)]'
                : 'bg-gradient-to-b from-white/20 via-[#cda250]/40 to-white/10 shadow-[0_12px_35px_rgba(0,0,0,0.8)]'
            }`}
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden'
            }}
          >
            <span className="absolute top-1.5 left-1.5 w-1.5 h-1.5 rounded-full bg-[#3d2b13] border border-[#d4af37]/70 shadow-xs z-30 pointer-events-none" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#3d2b13] border border-[#d4af37]/70 shadow-xs z-30 pointer-events-none" />
            <span className="absolute bottom-1.5 left-1.5 w-1.5 h-1.5 rounded-full bg-[#3d2b13] border border-[#d4af37]/70 shadow-xs z-30 pointer-events-none" />
            <span className="absolute bottom-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#3d2b13] border border-[#d4af37]/70 shadow-xs z-30 pointer-events-none" />

            <div className="w-full h-full rounded-[14px] bg-[#120d08] flex flex-col justify-between p-3 sm:p-3.5 relative overflow-hidden border border-[#5d3f18]/40">
              <div
                className="absolute inset-0 opacity-[0.06] pointer-events-none"
                style={{
                  backgroundImage:
                    'radial-gradient(circle at 50% 50%, #cda250 1px, transparent 1px), radial-gradient(circle at 50% 50%, #cda250 1px, transparent 1px)',
                  backgroundSize: '24px 24px',
                  backgroundPosition: '0 0, 12px 12px'
                }}
              />

              <motion.div
                className="absolute inset-0 pointer-events-none z-20 transition-opacity duration-200"
                style={{
                  background: glareBackground,
                  opacity: isHovered ? glareOpacity : 0.12
                }}
              />

              <div className="relative z-10 w-full flex-1 aspect-video rounded-xl overflow-hidden border border-[#cda250]/35 bg-[#090604] flex items-center justify-center group-hover:border-[#cda250]/80 transition-colors shadow-inner my-auto">
                <span className="absolute top-1.5 left-1.5 w-2.5 h-2.5 border-t-2 border-l-2 border-[#fde6b8]/80 z-20 pointer-events-none" />
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 border-t-2 border-r-2 border-[#fde6b8]/80 z-20 pointer-events-none" />
                <span className="absolute bottom-1.5 left-1.5 w-2.5 h-2.5 border-b-2 border-l-2 border-[#fde6b8]/80 z-20 pointer-events-none" />
                <span className="absolute bottom-1.5 right-1.5 w-2.5 h-2.5 border-b-2 border-r-2 border-[#fde6b8]/80 z-20 pointer-events-none" />

                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover object-center brightness-[0.96] contrast-[1.04]"
                  loading="lazy"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#120d08]/90 via-transparent to-black/35 pointer-events-none" />

                <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-md bg-[#181109]/85 backdrop-blur-xs border border-[#cda250]/40 text-[9.5px] font-mono tracking-wider text-[#fae8c8] opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1.5 shadow-lg">
                  <span>INSPECT</span>
                  <ExternalLink className="w-2.5 h-2.5 text-[#e5ad68]" />
                </div>
              </div>

              <div className="relative z-10 p-2.5 rounded-lg bg-gradient-to-r from-[#1c140c] via-[#241a0f] to-[#1c140c] border border-[#cda250]/35 flex items-center justify-between shadow-sm mt-2">
                <div className="w-full min-w-0">
                  <div className="font-serif text-xs sm:text-sm font-black tracking-wider text-[#fdfaf3] uppercase truncate drop-shadow-xs">
                    {project.title}
                  </div>
                  <div className="text-[10px] font-mono tracking-wider text-[#d4af37] truncate mt-0.5 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#e5ad68]" />
                    <span>{project.category}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <div
            className="absolute inset-0 w-full h-full rounded-2xl p-[2.5px] bg-gradient-to-b from-[#fae8c8] via-[#cda250] to-[#5d3f18] shadow-[0_20px_55px_rgba(0,0,0,0.95)]"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)'
            }}
          >
            <div className="w-full h-full rounded-[14px] bg-[#120d08] flex flex-col items-center justify-between p-6 text-center relative overflow-hidden border border-[#5d3f18]/40">
              <div
                className="absolute inset-0 opacity-[0.08] pointer-events-none"
                style={{
                  backgroundImage:
                    'radial-gradient(#cda250 1px, transparent 1px), radial-gradient(#cda250 1px, #120d08 1px)',
                  backgroundSize: '16px 16px',
                  backgroundPosition: '0 0, 8px 8px'
                }}
              />

              <div className="relative z-10 w-full flex items-center justify-center pb-2 border-b border-[#cda250]/30">
                <span className="font-serif text-[10px] font-bold text-[#e5ad68] tracking-[0.2em] uppercase">
                  ARCHIVUM HISTORICUM // 0{index + 1}
                </span>
              </div>

              <div className="relative z-10 flex flex-col items-center my-auto space-y-3">
                <div className="w-16 h-16 rounded-full bg-gradient-to-b from-[#fae8c8] via-[#cda250] to-[#7d531a] p-[2px] shadow-[0_0_28px_rgba(205,162,80,0.35)]">
                  <div className="w-full h-full rounded-full bg-[#161009] flex items-center justify-center border border-[#cda250]/30">
                    <Shield className="w-7 h-7 text-[#e5ad68]" />
                  </div>
                </div>

                <div>
                  <div className="font-serif font-black text-sm text-[#fffdf9] tracking-[0.2em] uppercase">
                    MARCELINUS
                  </div>
                  <div className="font-mono text-[9.5px] text-[#e5ad68] tracking-[0.2em] uppercase mt-0.5">
                    EXPEDITION SERIES · MMXXVI
                  </div>
                </div>
              </div>

              <div className="relative z-10 w-full pt-2 border-t border-[#cda250]/30 flex items-center justify-center text-[9.5px] font-mono text-[#c9b9a6] tracking-wider">
                ROYAL FOLIO ARCHIVE // BINUS 2026
              </div>

            </div>
          </div>

        </motion.div>
      </div>

      <motion.div
        animate={{
          opacity: isActive ? 1 : 0.45,
          y: isActive ? 0 : 4
        }}
        transition={{ duration: 0.3 }}
        className="mt-3.5 sm:mt-5 text-center flex flex-col items-center max-w-[290px] sm:max-w-[310px] space-y-1 sm:space-y-1.5 px-2"
      >
        <h3 className="font-serif text-base sm:text-lg font-black tracking-wider text-[#fffdf9] uppercase group-hover:text-[#e5ad68] transition-colors">
          {project.title}
        </h3>

        <div className="font-mono text-[11px] tracking-[0.18em] text-[#e5ad68] uppercase font-semibold">
          {project.category}
        </div>

        <p className="text-xs text-[#c9b9a6] line-clamp-2 leading-relaxed">
          {project.shortDescription}
        </p>
      </motion.div>
    </div>
  );
}
