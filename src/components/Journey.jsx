import { useRef, useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { journeyExperiences } from '../data/journey';
import JourneyPanel from './JourneyPanel';
import JourneyGridBackground from './JourneyGridBackground';
import { ArrowDown, ChevronRight, ChevronLeft } from 'lucide-react';

export default function Journey() {
  const sectionRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const isLockedRef = useRef(false);
  const activeStepRef = useRef(0);

  useEffect(() => {
    activeStepRef.current = activeStep;
  }, [activeStep]);

  const totalPanels = journeyExperiences.length;

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const scrollToProjects = useCallback(() => {
    const el = document.getElementById('projects');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  // Intercept wheel events while in Journey to navigate horizontally panel by panel
  // Only allows vertical scroll down to Projects after the last panel is reached
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || isMobile) return;

    let wheelAccumulator = 0;
    let wheelTimer = null;

    const handleWheel = (e) => {
      const rect = el.getBoundingClientRect();
      const inJourneyViewport = rect.top <= 40 && rect.bottom >= window.innerHeight - 40;

      if (!inJourneyViewport) {
        return;
      }

      const current = activeStepRef.current;

      if (e.deltaY > 0) {
        // Scrolling down: advance panels horizontally
        if (current < totalPanels - 1) {
          e.preventDefault();

          if (isLockedRef.current) return;

          wheelAccumulator += e.deltaY;
          if (wheelAccumulator > 25) {
            isLockedRef.current = true;
            setActiveStep((prev) => Math.min(prev + 1, totalPanels - 1));
            wheelAccumulator = 0;

            setTimeout(() => {
              isLockedRef.current = false;
            }, 600);
          }

          clearTimeout(wheelTimer);
          wheelTimer = setTimeout(() => {
            wheelAccumulator = 0;
          }, 200);
        } else {
          // Final panel viewed: smooth scroll to Projects
          if (window.scrollY <= 30) {
            e.preventDefault();
            if (isLockedRef.current) return;

            wheelAccumulator += e.deltaY;
            if (wheelAccumulator > 25) {
              isLockedRef.current = true;
              scrollToProjects();
              wheelAccumulator = 0;

              setTimeout(() => {
                isLockedRef.current = false;
              }, 800);
            }
          }
        }
      } else if (e.deltaY < 0) {
        // Scrolling up: step backwards across panels if at the top of the page
        if (window.scrollY <= 30) {
          if (current > 0) {
            e.preventDefault();

            if (isLockedRef.current) return;

            wheelAccumulator += e.deltaY;
            if (wheelAccumulator < -25) {
              isLockedRef.current = true;
              setActiveStep((prev) => Math.max(prev - 1, 0));
              wheelAccumulator = 0;

              setTimeout(() => {
                isLockedRef.current = false;
              }, 600);
            }

            clearTimeout(wheelTimer);
            wheelTimer = setTimeout(() => {
              wheelAccumulator = 0;
            }, 200);
          }
        }
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      el.removeEventListener('wheel', handleWheel);
      clearTimeout(wheelTimer);
    };
  }, [isMobile, totalPanels, scrollToProjects]);

  // Keyboard navigation for accessibility
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;

      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const inView = rect.top <= 80 && rect.bottom >= 200;
      if (!inView) return;

      if (e.key === 'ArrowRight') {
        if (activeStep < totalPanels - 1) {
          e.preventDefault();
          setActiveStep((prev) => prev + 1);
        }
      } else if (e.key === 'ArrowLeft') {
        if (activeStep > 0) {
          e.preventDefault();
          setActiveStep((prev) => prev - 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeStep, totalPanels]);

  // Touch swipe support for touch-enabled devices
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    const deltaX = touchStartX.current - e.changedTouches[0].clientX;
    const deltaY = touchStartY.current - e.changedTouches[0].clientY;

    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 40) {
      if (deltaX > 0 && activeStep < totalPanels - 1) {
        setActiveStep((prev) => prev + 1);
      } else if (deltaX < 0 && activeStep > 0) {
        setActiveStep((prev) => prev - 1);
      }
    }
  };

  return (
    <section
      id="journey"
      ref={sectionRef}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative w-full bg-transparent overflow-hidden"
    >
      {/* Animated interactive architectural grid background */}
      <JourneyGridBackground />

      {!isMobile ? (
        <div className="relative z-10 w-full h-screen min-h-[640px] flex flex-col justify-between pt-20 pb-8 overflow-hidden">
          
          {/* Top Header */}
          <div className="w-full max-w-6xl mx-auto px-6 sm:px-12 z-20 border-b border-white/[0.06] pb-4">
             <div className="text-xs uppercase tracking-widest font-semibold text-[#e5ad68]">
              Explore
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
              My Journey in BINUS University
            </h2>
          </div>

          {/* Horizontal Track Slider */}
          <div className="relative w-full h-[62vh] flex items-center overflow-hidden">
            <motion.div
              animate={{ x: `-${activeStep * 100}%` }}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
              className="flex h-full w-full will-change-transform"
            >
              {journeyExperiences.map((experience) => (
                <div
                  key={experience.id}
                  className="w-full shrink-0 h-full flex items-center justify-center"
                >
                  <JourneyPanel
                    experience={experience}
                    total={totalPanels}
                  />
                </div>
              ))}
            </motion.div>
          </div>

          {/* Bottom Progress Bar, Step Indicator & Action Controls */}
          <div className="w-full max-w-6xl mx-auto px-6 sm:px-12 z-20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-48 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-[#e5ad68] rounded-full"
                  animate={{ width: `${((activeStep + 1) / totalPanels) * 100}%` }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                />
              </div>
              <span className="text-xs font-mono text-slate-400">
                {activeStep + 1} of {totalPanels}
              </span>
            </div>

            {/* Interactive Navigation Controls */}
            <div className="flex items-center gap-3">
              {activeStep > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveStep((prev) => Math.max(0, prev - 1))}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
                  aria-label="Previous milestone"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>
              )}

              {activeStep < totalPanels - 1 ? (
                <button
                  type="button"
                  onClick={() => setActiveStep((prev) => Math.min(totalPanels - 1, prev + 1))}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium text-slate-200 bg-white/[0.08] hover:bg-white/[0.14] hover:text-white border border-white/10 transition-colors cursor-pointer"
                  aria-label="Next milestone"
                >
                  <span>Next milestone</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#e5ad68]" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={scrollToProjects}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-950 bg-[#e5ad68] hover:bg-[#ebbb7e] transition-colors cursor-pointer"
                  aria-label="Continue to Projects"
                >
                  <span>View Projects</span>
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* MOBILE RESPONSIVE VERTICAL TIMELINE */
        <div className="relative z-10 w-full max-w-3xl mx-auto px-6 py-12 space-y-6">
          <div className="border-b border-white/[0.06] pb-4">
            <div className="text-xs uppercase tracking-widest font-semibold text-[#e5ad68] mb-1">
              Chronicles
            </div>
            <h2 className="text-2xl font-extrabold text-white">
              My Journey in BINUS University
            </h2>
          </div>

          {journeyExperiences.map((experience) => (
            <div
              key={experience.id}
              className="bg-[#12151e]/95 backdrop-blur-md border border-[#e5ad68]/30 shadow-[0_0_25px_rgba(229,173,104,0.12),0_8px_24px_rgba(0,0,0,0.6)] p-6 rounded-xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="font-mono text-lg font-bold text-[#e5ad68]">
                  {experience.stepNumber}
                </span>
                <span className="font-mono text-xs text-slate-400">
                  {experience.period}
                </span>
              </div>

              <div>
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">
                  {experience.theme}
                </span>
                <h3 className="text-xl font-bold text-white">
                  {experience.title}
                </h3>
              </div>

              {experience.milestone && (
                <div className="text-xs p-2.5 rounded-lg bg-white/[0.04] border border-white/10 text-slate-200 font-medium">
                  {experience.milestone}
                </div>
              )}

              <div className="rounded-lg overflow-hidden border border-[#e5ad68]/35 shadow-[0_0_16px_rgba(229,173,104,0.18)] bg-[#0a0c10] aspect-video">
                <img
                  src={experience.image}
                  alt={experience.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <p className="text-sm text-slate-300 leading-relaxed">
                {experience.description}
              </p>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {experience.technologies.map((t) => (
                  <span
                    key={t}
                    className="font-mono text-xs px-2.5 py-1 rounded bg-white/[0.04] border border-white/10 text-slate-300"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
