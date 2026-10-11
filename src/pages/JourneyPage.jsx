import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import PortalEntryTransition from '../components/PortalEntryTransition';
import Journey from '../components/Journey';
import Projects from '../components/Projects';

export default function JourneyPage() {
  const location = useLocation();
  const [isProjectsActive, setIsProjectsActive] = useState(false);
  const [activeJourneyStep, setActiveJourneyStep] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="journey-page relative min-h-screen text-[#f0f2f8] overflow-x-clip">
      <PortalEntryTransition fromPortal={Boolean(location.state?.fromPortal)} />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.0, delay: 0.1, ease: 'easeOut' }}
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] sm:w-[1100px] h-[340px] sm:h-[460px] pointer-events-none -z-0"
        style={{
          background:
            'radial-gradient(ellipse at 50% 0%, rgba(232, 166, 72, 0.24), rgba(232, 166, 72, 0.08) 45%, transparent 75%)',
          filter: 'blur(36px)'
        }}
        aria-hidden="true"
      />

      <motion.div
        className="fixed top-5 right-5 sm:top-6 sm:right-8 z-40"
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
      >
        <AnimatePresence mode="wait">
          {!isProjectsActive ? (
            <motion.div
              key="back-to-about"
              initial={{ opacity: 0, y: -4, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.96 }}
              transition={{ duration: 0.2 }}
            >
              <Link
                to="/"
                className="group flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-full bg-[#12151e]/85 hover:bg-[#181d2a] backdrop-blur-md border border-white/10 hover:border-[#e5ad68]/60 shadow-[0_4px_24px_rgba(0,0,0,0.6)] text-slate-300 hover:text-white transition-all duration-200 active:scale-95 cursor-pointer"
                aria-label="Back to About Page"
              >
                <ArrowLeft className="w-4 h-4 text-[#e5ad68] transition-transform duration-200 group-hover:-translate-x-1" />
                <span className="text-xs sm:text-sm font-semibold tracking-wide">
                  Back to About
                </span>
              </Link>
            </motion.div>
          ) : (
            <motion.div
              key="back-to-journey"
              initial={{ opacity: 0, y: -4, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2"
            >
              <button
                type="button"
                onClick={() => setIsProjectsActive(false)}
                className="group flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-full bg-[#12151e]/85 hover:bg-[#181d2a] backdrop-blur-md border border-[#e5ad68]/40 hover:border-[#e5ad68]/80 shadow-[0_4px_24px_rgba(0,0,0,0.6)] text-white transition-all duration-200 active:scale-95 cursor-pointer"
                aria-label="Back to Journey"
              >
                <ArrowLeft className="w-4 h-4 text-[#e5ad68] transition-transform duration-200 group-hover:-translate-x-1" />
                <span className="text-xs sm:text-sm font-semibold tracking-wide">
                  Back to Journey
                </span>
              </button>
              <Link
                to="/"
                className="flex items-center gap-1.5 px-3 py-2 sm:py-2.5 rounded-full bg-[#12151e]/60 hover:bg-[#181d2a] backdrop-blur-md border border-white/10 hover:border-white/20 text-slate-400 hover:text-white text-xs font-medium transition-all active:scale-95"
                aria-label="Back to About"
              >
                <span>About</span>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <motion.main
        className="relative z-10 w-full flex flex-col"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.05, ease: 'easeOut' }}
      >
        <Journey
          activeStep={activeJourneyStep}
          setActiveStep={setActiveJourneyStep}
          isProjectsActive={isProjectsActive}
          onOpenProjects={() => {
            setIsProjectsActive(true);
          }}
        />

        <Projects
          isOpen={isProjectsActive}
          onClose={() => {
            setIsProjectsActive(false);
          }}
        />
      </motion.main>
    </div>
  );
}
