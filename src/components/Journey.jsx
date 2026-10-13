import { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { journeyExperiences } from '../data/journey';
import JourneyPanel from './JourneyPanel';
import JourneyGridBackground from './JourneyGridBackground';
import JourneyPlanetOrbitCanvas from './JourneyPlanetOrbitCanvas';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Journey({
  activeStep: externalActiveStep,
  setActiveStep: externalSetActiveStep,
  isProjectsActive = false,
  onOpenProjects
}) {
  const sectionRef = useRef(null);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 1024 : false
  );
  const [internalActiveStep, setInternalActiveStep] = useState(0);
  const [slideDirection, setSlideDirection] = useState('next');

  const activeStep = externalActiveStep !== undefined ? externalActiveStep : internalActiveStep;
  const setActiveStep = externalSetActiveStep || setInternalActiveStep;

  const isLockedRef = useRef(false);
  const activeStepRef = useRef(0);
  const isTransitioningRef = useRef(false);

  useEffect(() => {
    activeStepRef.current = activeStep;
  }, [activeStep]);

  const totalPanels = journeyExperiences.length;
  const currentExp = journeyExperiences[activeStep] || journeyExperiences[0];

  const goToNextStep = useCallback(() => {
    if (isTransitioningRef.current) return;
    if (activeStepRef.current < totalPanels - 1) {
      isTransitioningRef.current = true;
      setSlideDirection('next');
      setActiveStep((prev) => Math.min(prev + 1, totalPanels - 1));
      setTimeout(() => {
        isTransitioningRef.current = false;
      }, 350);
    }
  }, [totalPanels, setActiveStep]);

  const goToPrevStep = useCallback(() => {
    if (isTransitioningRef.current) return;
    if (activeStepRef.current > 0) {
      isTransitioningRef.current = true;
      setSlideDirection('prev');
      setActiveStep((prev) => Math.max(prev - 1, 0));
      setTimeout(() => {
        isTransitioningRef.current = false;
      }, 350);
    }
  }, [setActiveStep]);

  const goToStep = useCallback(
    (index) => {
      if (isTransitioningRef.current || index === activeStepRef.current) return;
      isTransitioningRef.current = true;
      setSlideDirection(index > activeStepRef.current ? 'next' : 'prev');
      setActiveStep(index);
      setTimeout(() => {
        isTransitioningRef.current = false;
      }, 350);
    },
    [setActiveStep]
  );

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const scrollToProjects = useCallback(() => {
    if (onOpenProjects) {
      onOpenProjects();
    } else {
      const el = document.getElementById('projects');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [onOpenProjects]);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || isMobile) return;

    let wheelAccumulator = 0;
    let wheelTimer = null;

    const handleWheel = (e) => {
      if (isProjectsActive) return;

      const rect = el.getBoundingClientRect();
      const inJourneyViewport = rect.top <= 40 && rect.bottom >= window.innerHeight - 40;

      if (!inJourneyViewport) {
        return;
      }

      const current = activeStepRef.current;

      if (e.deltaY > 0) {
        if (current < totalPanels - 1) {
          e.preventDefault();

          if (isLockedRef.current) return;

          wheelAccumulator += e.deltaY;
          if (wheelAccumulator > 30) {
            isLockedRef.current = true;
            setActiveStep((prev) => Math.min(prev + 1, totalPanels - 1));
            wheelAccumulator = 0;

            setTimeout(() => {
              isLockedRef.current = false;
            }, 320);
          }

          clearTimeout(wheelTimer);
          wheelTimer = setTimeout(() => {
            wheelAccumulator = 0;
          }, 180);
        } else {
          if (window.scrollY <= 30) {
            e.preventDefault();
            if (isLockedRef.current) return;

            wheelAccumulator += e.deltaY;
            if (wheelAccumulator > 40) {
              isLockedRef.current = true;
              scrollToProjects();
              wheelAccumulator = 0;

              setTimeout(() => {
                isLockedRef.current = false;
              }, 150);
            }
          }
        }
      } else if (e.deltaY < 0) {
        if (window.scrollY <= 30) {
          if (current > 0) {
            e.preventDefault();

            if (isLockedRef.current) return;

            wheelAccumulator += e.deltaY;
            if (wheelAccumulator < -30) {
              isLockedRef.current = true;
              setActiveStep((prev) => Math.max(prev - 1, 0));
              wheelAccumulator = 0;

              setTimeout(() => {
                isLockedRef.current = false;
              }, 320);
            }

            clearTimeout(wheelTimer);
            wheelTimer = setTimeout(() => {
              wheelAccumulator = 0;
            }, 180);
          }
        }
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      el.removeEventListener('wheel', handleWheel);
      clearTimeout(wheelTimer);
    };
  }, [isMobile, totalPanels, isProjectsActive, scrollToProjects, setActiveStep]);

  useEffect(() => {
    if (isProjectsActive) return;

    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;

      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const inView = rect.top <= 80 && rect.bottom >= 200;
      if (!inView) return;

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        if (activeStep < totalPanels - 1) {
          e.preventDefault();
          goToNextStep();
        } else if (activeStep === totalPanels - 1) {
          e.preventDefault();
          scrollToProjects();
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        if (activeStep > 0) {
          e.preventDefault();
          goToPrevStep();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeStep, totalPanels, isProjectsActive, scrollToProjects, goToNextStep, goToPrevStep]);

  const canvasTouchStartRef = useRef({ x: 0, y: 0, time: 0 });
  const cardDragStartRef = useRef(0);

  const handleCanvasTouchStart = (e) => {
    if (e.touches.length !== 1) return;
    canvasTouchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      time: Date.now()
    };
  };

  const handleCanvasTouchEnd = (e) => {
    if (!canvasTouchStartRef.current.time) return;
    const touch = e.changedTouches[0];
    if (!touch) return;

    const deltaX = canvasTouchStartRef.current.x - touch.clientX;
    const deltaY = canvasTouchStartRef.current.y - touch.clientY;
    const duration = Date.now() - canvasTouchStartRef.current.time;
    canvasTouchStartRef.current.time = 0;

    if (duration >= 450) return;

    if (Math.abs(deltaX) <= Math.abs(deltaY) * 1.8) return;

    if (Math.abs(deltaX) < 65) return;

    if (deltaX > 0) {
      goToNextStep();
    } else {
      goToPrevStep();
    }
  };

  return (
    <section
      id="journey"
      ref={sectionRef}
      className="relative w-full bg-transparent overflow-hidden"
    >
      <JourneyGridBackground />

      {!isMobile ? (
        <div className="relative z-10 w-full min-h-screen lg:h-screen min-h-[700px] flex flex-col justify-between pt-16 sm:pt-20 pb-6 sm:pb-8 overflow-hidden">
          <div className="hidden lg:block absolute inset-0 w-full h-full z-10 pointer-events-auto">
            <JourneyPlanetOrbitCanvas
              activeStep={activeStep}
              setActiveStep={setActiveStep}
              className="w-full h-full"
            />
          </div>

          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-7xl mx-auto px-6 sm:px-10 z-20 pb-2 pointer-events-none"
          >
            <div className="pointer-events-auto border-b border-white/[0.06] pb-3 inline-block">
              <h2 className="text-2xl sm:text-3xl lg:text-3xl font-extrabold text-white tracking-tight whitespace-nowrap">
                My Journey in BINUS University
              </h2>
            </div>
          </motion.div>

          <div className="relative w-full flex-1 flex items-center min-h-[460px] z-20 pointer-events-none my-auto">
            <div className="w-full max-w-7xl mx-auto px-6 sm:px-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-10 xl:col-span-9 2xl:col-span-9 max-w-6xl flex flex-col justify-center pointer-events-auto">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentExp.id}
                    initial={{ opacity: 0, y: 14, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -14, scale: 0.97 }}
                    transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
                    className="w-full"
                  >
                    <JourneyPanel experience={currentExp} />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full max-w-xl mx-auto px-4 pt-20 pb-12 space-y-6"
        >
          <div className="border-b border-white/[0.06] pb-4">
            <h2 className="text-2xl font-extrabold text-white">
              My Journey in BINUS University
            </h2>
          </div>

          <div
            onTouchStart={handleCanvasTouchStart}
            onTouchEnd={handleCanvasTouchEnd}
            className="w-full h-[300px] sm:h-[340px] rounded-2xl bg-[#0d1017]/90 border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.7)] overflow-hidden relative touch-pan-y"
          >
            <JourneyPlanetOrbitCanvas
              activeStep={activeStep}
              setActiveStep={setActiveStep}
              className="w-full h-full"
            />
          </div>

          <div className="relative w-full overflow-hidden">
            <AnimatePresence mode="wait" custom={slideDirection}>
              <motion.div
                key={currentExp.id}
                custom={slideDirection}
                initial={{ opacity: 0, x: slideDirection === 'next' ? 45 : -45 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: slideDirection === 'next' ? -45 : 45 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                drag="x"
                dragDirectionLock
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                dragMomentum={false}
                onDragStart={() => {
                  cardDragStartRef.current = Date.now();
                }}
                onDragEnd={(e, { offset, velocity }) => {
                  const duration = Date.now() - (cardDragStartRef.current || 0);
                  const isLongHold = duration > 450;

                  if (isLongHold) {
                    // Finger held down: ignore velocity noise and only slide on large deliberate drag
                    if (offset.x < -90) {
                      goToNextStep();
                    } else if (offset.x > 90) {
                      goToPrevStep();
                    }
                  } else {
                    // Intentional flick or swipe (duration <= 450ms)
                    const isSwipeNext = offset.x < -65 || (offset.x < -30 && velocity.x < -450);
                    const isSwipePrev = offset.x > 65 || (offset.x > 30 && velocity.x > 450);

                    if (isSwipeNext) {
                      goToNextStep();
                    } else if (isSwipePrev) {
                      goToPrevStep();
                    }
                  }
                }}
                className="touch-pan-y cursor-grab active:cursor-grabbing select-none"
              >
                <JourneyPanel experience={currentExp} />
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="pt-2">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-[#0c1017]/90 backdrop-blur-xl border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.6)]">
              <button
                type="button"
                onClick={goToPrevStep}
                disabled={activeStep === 0}
                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 border select-none ${
                  activeStep === 0
                    ? 'opacity-25 border-white/5 bg-white/[0.02] text-slate-500 cursor-not-allowed'
                    : 'bg-[#151926] hover:bg-[#1c2235] active:scale-90 border-white/20 text-white shadow-lg cursor-pointer'
                }`}
                aria-label="Previous Journey Stage"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <div className="flex flex-col items-center gap-2">
                <span className="font-mono text-xs font-bold tracking-wider text-slate-200 px-3 py-1 rounded-full bg-white/[0.06] border border-white/10">
                  0{activeStep + 1} <span className="text-slate-500 font-normal">/</span> 0{totalPanels}
                </span>

                <div className="flex items-center gap-1.5">
                  {journeyExperiences.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => goToStep(i)}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        activeStep === i
                          ? 'w-7 bg-[#e5ad68] shadow-[0_0_8px_rgba(229,173,104,0.6)]'
                          : 'w-2 bg-white/25 hover:bg-white/40'
                      }`}
                      aria-label={`Go to stage ${i + 1}`}
                    />
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={goToNextStep}
                disabled={activeStep === totalPanels - 1}
                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 border select-none ${
                  activeStep === totalPanels - 1
                    ? 'opacity-25 border-white/5 bg-white/[0.02] text-slate-500 cursor-not-allowed'
                    : 'bg-[#151926] hover:bg-[#1c2235] active:scale-90 border-white/20 text-white shadow-lg cursor-pointer'
                }`}
                aria-label="Next Journey Stage"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </section>
  );
}
