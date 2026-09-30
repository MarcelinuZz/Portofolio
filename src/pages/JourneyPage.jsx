import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Menu, X } from 'lucide-react';
import Journey from '../components/Journey';
import Projects from '../components/Projects';
import Contact from '../components/Contact';
import Footer from '../components/Footer';

const navSections = [
  { id: 'journey', label: 'Journey' },
  { id: 'projects', label: 'Projects' },
  { id: 'contact', label: 'Contact' }
];

export default function JourneyPage() {
  const [activeSection, setActiveSection] = useState('journey');
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);

    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };
    if (isMobileMenuOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileMenuOpen]);

  // Close mobile menu when screen expands to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const sectionIds = ['journey', 'projects', 'contact'];
    const observers = [];

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveSection(id);
            }
          });
        },
        { threshold: 0.25 }
      );

      observer.observe(el);
      observers.push(observer);
    });

    return () => {
      observers.forEach((obs) => obs.disconnect());
    };
  }, []);

  const handleScrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="journey-page relative min-h-screen text-[#f0f2f8] overflow-x-clip">
      {/* Top ambient warm amber halo */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] sm:w-[1100px] h-[340px] sm:h-[460px] pointer-events-none -z-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, rgba(232, 166, 72, 0.24), rgba(232, 166, 72, 0.08) 45%, transparent 75%)',
          filter: 'blur(36px)'
        }}
        aria-hidden="true"
      />

      {/* Navigation Header */}
      <header className="fixed top-0 left-0 right-0 z-40 pointer-events-none">
        
        {/* DESKTOP NAVIGATION: Centered Floating Pill */}
        <div className="hidden md:flex justify-center items-center py-5 px-4">
          <nav
            aria-label="Journey desktop navigation"
            className={`pointer-events-auto flex items-center gap-2 sm:gap-3 px-4 py-2 rounded-full transition-all duration-300 ${
              scrolled
                ? 'bg-[#12151e]/90 backdrop-blur-md border border-white/10 shadow-[0_8px_24px_rgba(0,0,0,0.6)]'
                : 'bg-[#12151e]/60 backdrop-blur-sm border border-white/[0.08]'
            }`}
          >
            {/* Back to About Page Button */}
            <Link
              to="/"
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-slate-200 hover:text-white hover:bg-white/[0.08] transition-colors"
              aria-label="Back to About Page"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#e5ad68]" />
              <span>Back to About</span>
            </Link>

            <div className="h-3.5 w-px bg-white/15" />

            {/* Section Jump Links */}
            <ul className="flex items-center gap-1 list-none m-0 p-0">
              {navSections.map((item) => {
                const isActive = activeSection === item.id;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => handleScrollTo(item.id)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer ${
                        isActive
                          ? 'bg-white/15 text-white font-semibold'
                          : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                      }`}
                    >
                      {item.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        {/* MOBILE NAVIGATION: Top-Right Hamburger Toggle Button */}
        <div className="md:hidden flex justify-end items-center p-4">
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            aria-expanded={isMobileMenuOpen}
            aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className={`pointer-events-auto relative w-11 h-11 flex items-center justify-center rounded-full transition-all duration-300 cursor-pointer ${
              scrolled || isMobileMenuOpen
                ? 'bg-[#12151e]/90 backdrop-blur-md border border-white/15 shadow-[0_4px_20px_rgba(0,0,0,0.5)] text-white'
                : 'bg-[#12151e]/70 backdrop-blur-sm border border-white/10 text-slate-200'
            }`}
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5 text-[#e5ad68]" />
            ) : (
              <Menu className="w-5 h-5 text-slate-200" />
            )}
          </button>
        </div>
      </header>

      {/* MOBILE DROPDOWN MENU */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-40 bg-[#0a0c10]/60 backdrop-blur-xs md:hidden"
              aria-hidden="true"
            />

            {/* Menu Panel in Top-Right Corner */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: -10 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="fixed top-16 right-4 z-50 w-56 rounded-2xl bg-[#12151e]/95 backdrop-blur-xl border border-white/15 shadow-[0_12px_40px_rgba(0,0,0,0.7)] p-2.5 md:hidden"
            >
              <div className="flex flex-col gap-1">
                {/* Back to About Link */}
                <Link
                  to="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-200 hover:text-white hover:bg-white/[0.08] active:bg-white/10 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 text-[#e5ad68]" />
                  <span>Back to About</span>
                </Link>

                <div className="h-px bg-white/10 my-1 mx-2" />

                {/* Section Navigation Links */}
                {navSections.map((item) => {
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        handleScrollTo(item.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors text-left cursor-pointer ${
                        isActive
                          ? 'bg-white/15 text-white font-semibold'
                          : 'text-slate-300 hover:text-white hover:bg-white/[0.06] active:bg-white/10'
                      }`}
                    >
                      <span>{item.label}</span>
                      {isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#e5ad68]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="relative z-10 w-full flex flex-col">
        <Journey />
        <Projects />
        <Contact />
      </main>

      <Footer />
    </div>
  );
}
