import { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform, useMotionTemplate, animate } from 'framer-motion';
import { projectsData } from '../data/projects';
import CollectibleProjectCard from './CollectibleProjectCard';
import ProjectModal from './ProjectModal';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import CosmicSpaceBackground from './CosmicSpaceBackground';

function getCardEntranceCoords(width, height) {
  const startX = -(Math.max(320, Math.min(width * 0.42, 760)));
  const startY = Math.round(height * 0.48 - height / 2);
  return { startX, startY };
}

export default function Projects({
  isOpen = false,
  onClose
}) {
  const [activeProjectIndex, setActiveProjectIndex] = useState(0);
  const [activeModalProject, setActiveModalProject] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [entranceCoords, setEntranceCoords] = useState(() => {
    if (typeof window === 'undefined') {
      return { startX: -600, startY: -20 };
    }
    return getCardEntranceCoords(window.innerWidth, window.innerHeight);
  });

  const totalProjects = projectsData.length;

  const progressMotion = useMotionValue(0);
  const smoothProgress = useSpring(progressMotion, {
    stiffness: 140,
    damping: 24,
    mass: 0.35
  });

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      setIsMobile(w < 1024);
      setEntranceCoords(getCardEntranceCoords(w, h));
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const openCooldownRef = useRef(0);

  const cosmosExpansion = useMotionValue(0);
  const hasTriggeredCosmosRef = useRef(false);
  const cosmosAnimControlsRef = useRef(null);

  const prevIsOpenRef = useRef(isOpen);
  useEffect(() => {
    if (isOpen && !prevIsOpenRef.current) {
      progressMotion.set(0);
      hasTriggeredCosmosRef.current = false;
      if (cosmosAnimControlsRef.current) cosmosAnimControlsRef.current.stop();
      cosmosExpansion.set(0);
      openCooldownRef.current = Date.now() + 150;
    } else if (!isOpen && prevIsOpenRef.current) {
      progressMotion.set(0);
      hasTriggeredCosmosRef.current = false;
      if (cosmosAnimControlsRef.current) cosmosAnimControlsRef.current.stop();
      cosmosExpansion.set(0);
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen, progressMotion, cosmosExpansion]);

  useEffect(() => {
    const unsubscribe = smoothProgress.on('change', (val) => {
      if (val < 1) {
        setActiveProjectIndex(0);
      } else {
        const idx = Math.min(totalProjects - 1, Math.max(0, Math.round(val - 1)));
        setActiveProjectIndex(idx);
      }

      if (val >= 0.84) {
        if (!hasTriggeredCosmosRef.current) {
          hasTriggeredCosmosRef.current = true;
          if (cosmosAnimControlsRef.current) cosmosAnimControlsRef.current.stop();
          cosmosAnimControlsRef.current = animate(cosmosExpansion, 1, {
            duration: 3.6,
            ease: [0.16, 1, 0.3, 1]
          });
        } else if (val >= 1.4 && cosmosExpansion.get() < 0.85) {
          if (cosmosAnimControlsRef.current) cosmosAnimControlsRef.current.stop();
          cosmosAnimControlsRef.current = animate(cosmosExpansion, 1, {
            duration: 0.5,
            ease: 'easeOut'
          });
        }
      } else if (val < 0.78) {
        if (hasTriggeredCosmosRef.current) {
          hasTriggeredCosmosRef.current = false;
          if (cosmosAnimControlsRef.current) cosmosAnimControlsRef.current.stop();
          cosmosAnimControlsRef.current = animate(cosmosExpansion, 0, {
            duration: 0.32,
            ease: [0.22, 1, 0.36, 1]
          });
        }
      }
    });
    return () => {
      unsubscribe();
      if (cosmosAnimControlsRef.current) cosmosAnimControlsRef.current.stop();
    };
  }, [smoothProgress, totalProjects, cosmosExpansion]);

  useEffect(() => {
    if (!isOpen || isMobile || activeModalProject) return;

    const handleWheel = (e) => {
      if (activeModalProject) return;
      e.preventDefault();

      if (Date.now() < openCooldownRef.current) return;

      const clampedDeltaY = Math.sign(e.deltaY) * Math.min(Math.abs(e.deltaY), 90);
      const baseDelta = clampedDeltaY * 0.00065;
      const current = progressMotion.get();
      const multiplier = current < 0.75 ? 1.35 : current < 1.05 ? 0.85 : 1.0;
      const delta = baseDelta * multiplier;
      const next = Math.max(0, Math.min(totalProjects, current + delta));

      progressMotion.set(next);

      if (next <= 0.02 && delta < 0) {
        progressMotion.set(0);
        onClose?.();
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [isOpen, isMobile, activeModalProject, totalProjects, progressMotion, onClose]);

  useEffect(() => {
    if (!isOpen || activeModalProject) return;

    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        const current = progressMotion.get();
        if (current < 1) {
          progressMotion.set(1);
        } else {
          progressMotion.set(Math.min(totalProjects, Math.floor(current) + 1));
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const current = progressMotion.get();
        if (current > 1) {
          progressMotion.set(Math.max(1, Math.ceil(current) - 1));
        } else if (current > 0) {
          progressMotion.set(0);
        } else {
          onClose?.();
        }
      } else if (e.key === 'Escape') {
        onClose?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, activeModalProject, totalProjects, progressMotion, onClose]);

  const leftY = useTransform(
    smoothProgress,
    [0,   0.10, 0.40, 0.70, 0.85],
    [100, 85,   65,   35,   0]
  );

  const rightY = useTransform(
    smoothProgress,
    [0,   0.10, 0.35, 0.65, 0.85],
    [100, 80,   45,   10,   0]
  );

  const curtainClipPath = useMotionTemplate`polygon(0 ${leftY}%, 100% ${rightY}%, 100% 100%, 0 100%)`;

  const cardEntrance = useTransform(smoothProgress, [0, 0.85], [1, 0], { clamp: true });
  const card1X = useTransform(cardEntrance, (f) => entranceCoords.startX * f);
  const card1TargetY = -48;
  const card1Y = useTransform(cardEntrance, (f) => entranceCoords.startY * f + card1TargetY * (1 - f));

  const card1Scale = useTransform(smoothProgress, [0, 0.85], [0.52, 1.0], { clamp: true });

  const card1Opacity = useTransform(
    smoothProgress,
    [0, 0.03, 0.85],
    [0, 1.0, 1.0],
    { clamp: true }
  );

  const card1RotateY = useTransform(
    smoothProgress,
    [0, 0.42, 0.85],
    [0, -180, -360],
    { clamp: true }
  );

  const card1RotateZ = useTransform(
    smoothProgress,
    [0, 0.40, 0.70, 0.85],
    [-10, -5, 1, 0],
    { clamp: true }
  );

  const trackX = useTransform(
    smoothProgress,
    [1, totalProjects],
    ['0px', `-${(totalProjects - 1) * 456}px`],
    { clamp: true }
  );

  const controlsOpacity = useTransform(smoothProgress, [0.10, 0.55], [0, 1], {
    clamp: true
  });
  const otherCardsOpacity = useTransform(smoothProgress, [1.0, 1.25], [0, 1], {
    clamp: true
  });

  const cosmosRadius = useTransform(cosmosExpansion, [0, 1], [0, 160], { clamp: true });
  const cosmosClipPath = useMotionTemplate`circle(${cosmosRadius}% at 50% calc(50% - 48px))`;

  const shockwaveSize = useTransform(
    cosmosExpansion,
    [0, 1],
    ['0px', '230vmax'],
    { clamp: true }
  );

  const shockwaveOpacity = useTransform(
    cosmosExpansion,
    [0, 0.08, 0.55, 0.85, 1],
    [0, 1.0,  0.85, 0.30, 0],
    { clamp: true }
  );

  const auraScale = useTransform(cosmosExpansion, [0, 0.4, 1], [0.6, 1.4, 2.2], { clamp: true });
  const auraOpacity = useTransform(cosmosExpansion, [0, 0.12, 0.6, 1], [0, 0.75, 0.35, 0], { clamp: true });

  const titleOpacity = useTransform(
    [cosmosExpansion, smoothProgress],
    ([cosmos, prog]) => {
      let enter = 0;
      if (cosmos <= 0.30) enter = 0;
      else if (cosmos >= 0.80) enter = 1;
      else enter = (cosmos - 0.30) / 0.50;

      let scrollFade = 1;
      if (prog > 1.0) {
        scrollFade = Math.max(0, 1 - (prog - 1.0) / 0.7);
      }

      return enter * scrollFade;
    }
  );

  const titleSlideX = useTransform(
    cosmosExpansion,
    [0.30, 0.80],
    [-28, 0],
    { clamp: true }
  );

  const handleJumpToYard = (idx) => {
    progressMotion.set(1 + idx);
  };

  const handlePrevCard = () => {
    const current = progressMotion.get();
    if (current > 1.2) {
      progressMotion.set(Math.max(1, Math.round(current) - 1));
    } else {
      progressMotion.set(0);
      setTimeout(() => onClose?.(), 400);
    }
  };

  const handleNextCard = () => {
    const current = progressMotion.get();
    if (current < 1) {
      progressMotion.set(1);
    } else {
      progressMotion.set(Math.min(totalProjects, Math.round(current) + 1));
    }
  };

  const mobileCarouselRef = useRef(null);
  const isProgrammaticScrollRef = useRef(false);

  const handleMobileScroll = () => {
    if (isProgrammaticScrollRef.current) return;
    const container = mobileCarouselRef.current;
    if (!container) return;

    const scrollLeft = container.scrollLeft;
    const firstCard = container.firstElementChild;
    if (!firstCard) return;

    const cardWidth = firstCard.getBoundingClientRect().width;
    const gap = 32;
    const currentIndex = Math.round(scrollLeft / (cardWidth + gap));
    const clampedIndex = Math.max(0, Math.min(totalProjects - 1, currentIndex));

    if (clampedIndex !== activeProjectIndex) {
      setActiveProjectIndex(clampedIndex);
    }
  };

  const scrollToMobileProject = (index) => {
    const container = mobileCarouselRef.current;
    if (!container) return;

    const clampedIndex = Math.max(0, Math.min(totalProjects - 1, index));
    setActiveProjectIndex(clampedIndex);

    const firstCard = container.firstElementChild;
    if (!firstCard) return;

    const cardWidth = firstCard.getBoundingClientRect().width;
    const gap = 32;
    const targetLeft = clampedIndex * (cardWidth + gap);

    isProgrammaticScrollRef.current = true;
    container.scrollTo({ left: targetLeft, behavior: 'smooth' });

    setTimeout(() => {
      isProgrammaticScrollRef.current = false;
    }, 450);
  };

  const isDraggingCarouselRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartScrollLeftRef = useRef(0);
  const hasDraggedRef = useRef(false);

  const handleCarouselPointerDown = (e) => {
    const container = mobileCarouselRef.current;
    if (!container) return;
    isDraggingCarouselRef.current = true;
    hasDraggedRef.current = false;
    dragStartXRef.current = e.pageX || e.clientX;
    dragStartScrollLeftRef.current = container.scrollLeft;
  };

  const handleCarouselPointerMove = (e) => {
    if (!isDraggingCarouselRef.current) return;
    const container = mobileCarouselRef.current;
    if (!container) return;
    const currentX = e.pageX || e.clientX;
    const walk = currentX - dragStartXRef.current;
    if (Math.abs(walk) > 5) {
      hasDraggedRef.current = true;
      container.scrollLeft = dragStartScrollLeftRef.current - walk;
    }
  };

  const handleCarouselPointerUp = () => {
    if (!isDraggingCarouselRef.current) return;
    isDraggingCarouselRef.current = false;
    const container = mobileCarouselRef.current;
    if (!container) return;

    if (hasDraggedRef.current) {
      const firstCard = container.firstElementChild;
      if (firstCard) {
        const cardWidth = firstCard.getBoundingClientRect().width;
        const gap = 32;
        const targetIndex = Math.round(container.scrollLeft / (cardWidth + gap));
        scrollToMobileProject(targetIndex);
      }
      setTimeout(() => {
        hasDraggedRef.current = false;
      }, 50);
    }
  };

  if (!isMobile) {
    if (!isOpen) {
      return <div id="projects" className="hidden pointer-events-none" />;
    }

    return (
      <div
        id="projects"
        className="fixed inset-0 z-30 overflow-hidden pointer-events-auto"
        style={{
          perspective: 1600
        }}
      >
        <motion.div
          style={{
            clipPath: curtainClipPath
          }}
          className="fixed inset-0 w-full h-full bg-black pointer-events-none z-10 overflow-hidden will-change-transform"
        />

        <motion.div
          style={{
            clipPath: cosmosClipPath
          }}
          className="fixed inset-0 w-full h-full pointer-events-none z-15 overflow-hidden will-change-transform"
        >
          <CosmicSpaceBackground />
        </motion.div>

        <motion.div
          style={{
            scale: auraScale,
            opacity: auraOpacity,
            x: '-50%',
            y: '-50%',
            left: '50%',
            top: 'calc(50% - 48px)'
          }}
          className="fixed w-72 h-72 rounded-full pointer-events-none z-14 bg-[radial-gradient(circle,rgba(229,173,104,0.45)_0%,rgba(229,173,104,0.15)_45%,transparent_70%)] blur-2xl will-change-transform"
        />

        <motion.div
          style={{
            width: shockwaveSize,
            height: shockwaveSize,
            opacity: shockwaveOpacity,
            x: '-50%',
            y: '-50%',
            left: '50%',
            top: 'calc(50% - 48px)'
          }}
          className="fixed rounded-full pointer-events-none z-16 border-2 border-[#e5ad68]/85 shadow-[0_0_60px_15px_rgba(229,173,104,0.7),inset_0_0_40px_8px_rgba(229,173,104,0.45)] will-change-transform"
        />

        <div className="fixed inset-0 w-full h-full flex flex-col justify-between pt-10 pb-6 pointer-events-auto z-20 overflow-hidden">
          <div className="relative z-10 w-full flex-1 flex items-center overflow-hidden py-4">
            <motion.div
              style={{ opacity: controlsOpacity }}
              className="absolute left-6 top-1/2 -translate-y-1/2 z-30"
            >
              <button
                type="button"
                onClick={handlePrevCard}
                aria-label="Previous project card"
                className="w-11 h-11 rounded-full bg-[#181109]/90 hover:bg-[#251b0f] border border-[#cda250]/40 hover:border-[#fde6b8] text-[#fdfaf3] hover:text-[#e5ad68] flex items-center justify-center transition-all duration-200 shadow-[0_8px_25px_rgba(0,0,0,0.7)] backdrop-blur-xs cursor-pointer active:scale-95"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            </motion.div>

            <motion.div
              style={{ opacity: controlsOpacity }}
              className="absolute right-6 top-1/2 -translate-y-1/2 z-30"
            >
              <button
                type="button"
                onClick={handleNextCard}
                aria-label="Next project card"
                className="w-11 h-11 rounded-full bg-[#181109]/90 hover:bg-[#251b0f] border border-[#cda250]/40 hover:border-[#fde6b8] text-[#fdfaf3] hover:text-[#e5ad68] flex items-center justify-center transition-all duration-200 shadow-[0_8px_25px_rgba(0,0,0,0.7)] backdrop-blur-xs cursor-pointer active:scale-95"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </motion.div>

            <motion.div
              style={{
                x: trackX,
                paddingLeft: 'calc(50vw - 180px)',
                paddingRight: 'calc(50vw - 180px)'
              }}
              className="flex items-center gap-24 will-change-transform z-10"
            >
              {projectsData.map((project, index) => {
                const isActive = index === activeProjectIndex;
                const isRaised = index % 2 === 0;
                const restingY = isRaised ? -48 : 48;

                if (index === 0) {
                  return (
                    <div
                      key={project.id}
                      className="relative shrink-0 w-[300px] sm:w-[340px] lg:w-[360px]"
                    >
                      <motion.div
                        style={{
                          opacity: titleOpacity,
                          x: titleSlideX
                        }}
                        className="absolute right-[calc(100%+28px)] lg:right-[calc(100%+48px)] xl:right-[calc(100%+64px)] top-[-48px] w-[260px] sm:w-[300px] lg:w-[360px] xl:w-[420px] pointer-events-none z-20 text-left select-none"
                      >
                        <div className="flex items-center gap-2 mb-2 sm:mb-2.5">
                          <span className="w-2 h-2 rounded-full bg-[#e5ad68] shadow-[0_0_8px_rgba(229,173,104,0.9)]" />
                          <span className="font-mono text-[10px] sm:text-xs tracking-[0.26em] text-[#e5ad68] uppercase font-bold">
                            SHOWCASE OF MY
                          </span>
                        </div>

                        <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black uppercase tracking-tight leading-[0.92]">
                          <span className="block text-[#fffdfa] drop-shadow-[0_2px_16px_rgba(0,0,0,0.85)]">
                            MY
                          </span>
                          <span className="block bg-gradient-to-r from-[#fae8c8] via-[#e5ad68] to-[#cda250] bg-clip-text text-transparent drop-shadow-[0_4px_28px_rgba(205,162,80,0.45)]">
                            PROJECT
                          </span>
                        </h2>

                        <div className="mt-3.5 sm:mt-4 flex items-center gap-3">
                          <div className="w-8 lg:w-12 h-[1.5px] bg-gradient-to-r from-[#e5ad68] to-transparent shrink-0" />
                          <p className="font-serif italic text-xs sm:text-sm text-[#e8d8be]/80 tracking-wide leading-relaxed">
                            Made from 2024 until now
                          </p>
                        </div>
                      </motion.div>

                      <motion.div
                        style={{
                          x: card1X,
                          y: card1Y,
                          rotateY: card1RotateY,
                          rotateZ: card1RotateZ,
                          scale: card1Scale,
                          opacity: card1Opacity,
                          transformStyle: 'preserve-3d'
                        }}
                        className="relative w-full will-change-transform"
                      >
                        <CollectibleProjectCard
                          project={project}
                          index={index}
                          isActive={isActive}
                          onSelect={setActiveModalProject}
                        />
                      </motion.div>
                    </div>
                  );
                }

                return (
                  <motion.div
                    key={project.id}
                    style={{
                      y: restingY,
                      opacity: otherCardsOpacity,
                      transformStyle: 'preserve-3d'
                    }}
                    className="relative shrink-0 w-[300px] sm:w-[340px] lg:w-[360px]"
                  >
                    <CollectibleProjectCard
                      project={project}
                      index={index}
                      isActive={isActive}
                      onSelect={setActiveModalProject}
                    />
                  </motion.div>
                );
              })}
            </motion.div>
          </div>

          <motion.div
            style={{ opacity: controlsOpacity }}
            className="relative z-20 w-full max-w-6xl mx-auto px-6 sm:px-12 flex flex-col items-center"
          >
            <div className="relative w-full py-3">
              <div className="w-full h-px bg-white/15 relative">
                <div className="absolute -top-3 left-0 right-0 flex justify-between items-center px-4 sm:px-8">
                  {projectsData.map((p, idx) => {
                    const yard = (idx + 1) * 10;
                    const isCurrentYard = idx === activeProjectIndex;

                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleJumpToYard(idx)}
                        className="group flex flex-col items-center focus:outline-none cursor-pointer"
                        aria-label={`Jump to yard ${yard} - ${p.title}`}
                      >
                        <div
                          className={`w-0.5 transition-all duration-300 ${
                            isCurrentYard
                              ? 'h-3.5 bg-[#e5ad68]'
                              : 'h-2 bg-white/20 group-hover:bg-white/40'
                          }`}
                        />

                        <span
                          className={`font-mono text-xs sm:text-sm font-bold tracking-wider mt-1.5 transition-all duration-300 ${
                            isCurrentYard
                              ? 'text-[#e5ad68] scale-110 drop-shadow-[0_0_8px_rgba(229,173,104,0.6)] font-extrabold'
                              : 'text-slate-500 group-hover:text-slate-300'
                          }`}
                        >
                          {yard}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="w-full flex items-center justify-center pt-4 mt-2 border-t border-white/[0.06]">
              <div className="text-xs font-mono text-slate-400 flex items-center gap-2">
                <span className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-[10px]">
                  Scroll Wheel
                </span>
                <span>or</span>
                <span className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-[10px]">
                  Arrow Keys
                </span>
              </div>
            </div>

          </motion.div>
        </div>

        <ProjectModal
          project={activeModalProject}
          onClose={() => setActiveModalProject(null)}
        />
      </div>
    );
  }

  return (
    <section
      id="projects"
      className="relative w-full bg-[#0a0805] pt-10 sm:pt-14 pb-12 sm:pb-16 px-4 sm:px-6 overflow-hidden border-t border-[#e5ad68]/30"
    >
      <div className="absolute inset-0 pointer-events-none opacity-100">
        <CosmicSpaceBackground />
      </div>

      <div className="absolute inset-x-0 top-0 h-16 sm:h-24 bg-gradient-to-b from-[#080a0e] via-[#080a0e]/50 to-transparent pointer-events-none z-[2]" />
      <div className="absolute inset-x-0 bottom-0 h-16 sm:h-24 bg-gradient-to-t from-black via-black/50 to-transparent pointer-events-none z-[2]" />

      <div className="relative z-20 w-full max-w-3xl mx-auto space-y-5 sm:space-y-6">
        <div className="pt-2 border-b border-white/10 pb-3.5 sm:pb-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#e5ad68] mb-1 flex items-center gap-1.5 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-[#e5ad68]" />
              <span>SHOWCASE OF MY</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-black uppercase text-white tracking-tight">
              <span>MY </span>
              <span className="bg-gradient-to-r from-[#fae8c8] via-[#e5ad68] to-[#cda250] bg-clip-text text-transparent">PROJECT</span>
            </h2>
          </div>

          <div className="font-mono text-xs text-[#e5ad68] bg-[#181109] border border-[#cda250]/40 px-2.5 py-1 rounded-full shadow-xs">
            Yard {((activeProjectIndex + 1) * 10)}
          </div>
        </div>

        <div className="relative w-full">
          <button
            type="button"
            onClick={() => scrollToMobileProject(Math.max(0, activeProjectIndex - 1))}
            disabled={activeProjectIndex === 0}
            className={`absolute left-0 top-[38%] -translate-y-1/2 z-40 w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all duration-300 select-none active:scale-90 ${
              activeProjectIndex === 0
                ? 'opacity-0 pointer-events-none'
                : 'opacity-95 bg-[#181109]/90 backdrop-blur-md border border-[#e5ad68]/70 text-[#fae8c8] hover:text-[#fffdfa] shadow-[0_4px_16px_rgba(0,0,0,0.65),0_0_12px_rgba(229,173,104,0.25)] cursor-pointer'
            }`}
            aria-label="Previous project card"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.2]" />
          </button>

          <button
            type="button"
            onClick={() => scrollToMobileProject(Math.min(totalProjects - 1, activeProjectIndex + 1))}
            disabled={activeProjectIndex === totalProjects - 1}
            className={`absolute right-0 top-[38%] -translate-y-1/2 z-40 w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all duration-300 select-none active:scale-90 ${
              activeProjectIndex === totalProjects - 1
                ? 'opacity-0 pointer-events-none'
                : 'opacity-95 bg-[#181109]/90 backdrop-blur-md border border-[#e5ad68]/70 text-[#fae8c8] hover:text-[#fffdfa] shadow-[0_4px_16px_rgba(0,0,0,0.65),0_0_12px_rgba(229,173,104,0.25)] cursor-pointer'
            }`}
            aria-label="Next project card"
          >
            <ChevronRight className="w-5 h-5 stroke-[2.2]" />
          </button>

          <div
            ref={mobileCarouselRef}
            onScroll={handleMobileScroll}
            onPointerDown={handleCarouselPointerDown}
            onPointerMove={handleCarouselPointerMove}
            onPointerUp={handleCarouselPointerUp}
            onPointerCancel={handleCarouselPointerUp}
            className="flex gap-6 sm:gap-8 overflow-x-auto snap-x snap-mandatory py-4 sm:py-6 no-scrollbar -mx-4 px-6 touch-pan-x cursor-grab active:cursor-grabbing select-none items-center"
            style={{
              WebkitOverflowScrolling: 'touch'
            }}
          >
            {projectsData.map((project, index) => (
              <div
                key={project.id}
                className="shrink-0 snap-center w-[84vw] max-w-[320px] sm:max-w-[340px] flex justify-center"
              >
                <CollectibleProjectCard
                  project={project}
                  index={index}
                  isActive={index === activeProjectIndex}
                  onSelect={(p) => {
                    if (!hasDraggedRef.current) {
                      setActiveModalProject(p);
                    }
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="relative w-full py-2">
          <div className="w-full h-px bg-white/15 relative">
            <div className="absolute -top-3 left-0 right-0 flex justify-between items-center px-1 sm:px-4">
              {projectsData.map((p, idx) => {
                const yard = (idx + 1) * 10;
                const isCurrentYard = idx === activeProjectIndex;

                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => scrollToMobileProject(idx)}
                    className="group flex flex-col items-center focus:outline-none cursor-pointer py-1 px-1"
                    aria-label={`Jump to yard ${yard} - ${p.title}`}
                  >
                    <div
                      className={`w-0.5 transition-all duration-300 ${
                        isCurrentYard
                          ? 'h-3.5 bg-[#e5ad68]'
                          : 'h-2 bg-white/20 group-hover:bg-white/40'
                      }`}
                    />
                    <span
                      className={`font-mono text-xs font-bold tracking-wider mt-1.5 transition-all duration-300 ${
                        isCurrentYard
                          ? 'text-[#e5ad68] scale-110 drop-shadow-[0_0_8px_rgba(229,173,104,0.6)] font-extrabold'
                          : 'text-slate-500 group-hover:text-slate-300'
                      }`}
                    >
                      {yard}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      <ProjectModal
        project={activeModalProject}
        onClose={() => setActiveModalProject(null)}
      />
    </section>
  );
}
