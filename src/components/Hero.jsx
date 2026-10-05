import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { profileData } from '../data/profile';
import { useParallax } from '../hooks/useParallax';
import SocialLinks from './SocialLinks';
import BubbleButton from './BubbleButton';
import marcelinusImg from '../assets/marcelinus.png';

// Mask Gradasi Memudar Halus untuk Sisi Kiri & Kanan (Seamless Full-Height Flank Fades)
// Gambar atas dan bawah menyatu vertikal 100% tanpa celah di layar monitor,
// lalu memudar lembut secara horizontal ke arah tengah kosmik.
const FLANK_FADE_MASKS = {
  left: 'linear-gradient(to right, black 0%, black 40%, rgba(0, 0, 0, 0.75) 65%, rgba(0, 0, 0, 0.2) 85%, transparent 100%)',
  right: 'linear-gradient(to left, black 0%, black 40%, rgba(0, 0, 0, 0.75) 65%, rgba(0, 0, 0, 0.2) 85%, transparent 100%)',
};

export default function Hero({ onTriggerTransition }) {
  const parallax = useParallax(16);
  const [isActivating, setIsActivating] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [stage, setStage] = useState('about'); // 'about' | 'explore'
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 1024;
    }
    return false;
  });
  const isTransitioningRef = useRef(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Transisi mulus langsung ke Explore Journey (cukup 1 kali scroll / gesture)
  const goToExplore = () => {
    if (stage === 'explore' || isTransitioningRef.current) return;
    isTransitioningRef.current = true;
    setStage('explore');
    setShowIntro(false);
    setTimeout(() => {
      isTransitioningRef.current = false;
    }, 4000);
  };

  // Transisi mulus kembali ke About Page
  const goToAbout = () => {
    if (stage === 'about' || isTransitioningRef.current) return;
    isTransitioningRef.current = true;
    setStage('about');
    setTimeout(() => {
      isTransitioningRef.current = false;
    }, 1800);
  };

  // 1. Wheel Scroll Listener: 1 kali scroll langsung memicu transisi sinematik halus
  useEffect(() => {
    let accumulatedDelta = 0;
    let resetTimer = null;

    const handleWheel = (e) => {
      if (isActivating || isTransitioningRef.current) return;

      accumulatedDelta += e.deltaY;
      clearTimeout(resetTimer);
      resetTimer = setTimeout(() => {
        accumulatedDelta = 0;
      }, 200);

      // Ambang batas geseran roda mouse untuk mencegah ketidaksengajaan
      if (stage === 'about' && accumulatedDelta > 30) {
        accumulatedDelta = 0;
        goToExplore();
      } else if (stage === 'explore' && accumulatedDelta < -30) {
        accumulatedDelta = 0;
        goToAbout();
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    return () => {
      window.removeEventListener('wheel', handleWheel);
      clearTimeout(resetTimer);
    };
  }, [stage, isActivating]);

  // 2. Touch Swipe Listener untuk Pengguna Mobile & Tablet
  useEffect(() => {
    let touchStartY = 0;
    let touchStartX = 0;

    const handleTouchStart = (e) => {
      touchStartY = e.touches[0].clientY;
      touchStartX = e.touches[0].clientX;
    };

    const handleTouchEnd = (e) => {
      if (isActivating || isTransitioningRef.current) return;
      const touchEndY = e.changedTouches[0].clientY;
      const touchEndX = e.changedTouches[0].clientX;
      const diffY = touchStartY - touchEndY;
      const diffX = touchStartX - touchEndX;

      // Pastikan gerakan lebih dominan vertikal dibanding horizontal
      if (Math.abs(diffY) > Math.abs(diffX) && Math.abs(diffY) > 35) {
        // Swipe ke atas mengarah ke Explore Journey
        if (stage === 'about' && diffY > 0) {
          goToExplore();
        }
        // Swipe ke bawah mengarah kembali ke About
        else if (stage === 'explore' && diffY < 0) {
          goToAbout();
        }
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [stage, isActivating]);

  // 3. Keyboard Listener untuk Aksesibilitas (ArrowDown / PageDown / ArrowUp)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isActivating || isTransitioningRef.current) return;
      if (stage === 'about' && (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ')) {
        e.preventDefault();
        goToExplore();
      } else if (stage === 'explore' && (e.key === 'ArrowUp' || e.key === 'PageUp')) {
        e.preventDefault();
        goToAbout();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [stage, isActivating]);

  // Otomatis hilangkan instruksi overlay setelah 1.5 detik
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleButtonClick = () => {
    if (isActivating) return;
    setIsActivating(true);
    onTriggerTransition();
  };

  const handleDismissIntro = () => {
    goToExplore();
  };

  return (
    <section id="hero" className="relative w-full h-[100dvh] overflow-hidden select-none">
      {/* Viewport container memastikan objek dan pilar visual selalu pas di layar */}
      <div className="hero-sticky-viewport fixed inset-0 w-full h-full overflow-hidden flex flex-col justify-center items-center py-4 px-3 sm:py-6 sm:px-8 lg:px-12 xl:px-16 pointer-events-none">
        
        {/* Main Presentation: Mobile Stack (Foto Kompak di Atas + Bio di Bawah) & Desktop (2 Kolom Sejajar) */}
        <div className="hero-main-grid relative w-full max-w-[1240px] xl:max-w-[1320px] mx-auto flex flex-col lg:flex-row items-center justify-center lg:justify-between gap-3 xs:gap-4 sm:gap-6 lg:gap-14 xl:gap-20 my-auto z-10">
          
          {/* Portrait: Order 1 di Mobile (Tampil proporsional di atas), Order 2 di Desktop */}
          <motion.div
            initial={false}
            animate={{
              x: isMobile ? 0 : (stage === 'about' ? '0vw' : '65vw'),
              y: isMobile ? (stage === 'about' ? 0 : -35) : 0,
              opacity: isActivating ? 0.35 : stage === 'about' ? 1 : 0,
            }}
            transition={{ duration: stage === 'explore' ? 3.0 : 1.5, ease: [0.32, 0.0, 0.24, 1.0] }}
            style={{
              pointerEvents: stage === 'about' && !isActivating ? 'auto' : 'none',
            }}
            className="hero-portrait-wrapper w-full lg:w-auto flex-shrink-0 flex justify-center lg:justify-end items-center relative order-1 lg:order-2 pointer-events-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="hero-portrait-container relative z-10 w-full max-w-[120px] xs:max-w-[140px] sm:max-w-[190px] md:max-w-[240px] lg:max-w-[390px] xl:max-w-[430px]"
              style={{
                transform: `translate3d(${parallax.x * 0.12}px, ${parallax.y * 0.12}px, 0)`
              }}
            >
              <div className="relative overflow-visible flex justify-center">
                {/* Soft ambient backlight glow harmonizing with the nebula */}
                <div className="absolute -inset-6 sm:-inset-10 bg-radial from-[#e5ad68]/20 via-[#e5ad68]/5 to-transparent blur-2xl sm:blur-3xl pointer-events-none -z-10" />

                {/* Portrait with smooth transparency fade at the bottom edge */}
                <img
                  src={marcelinusImg}
                  alt="Portrait of Marcelinus"
                  className="w-full h-auto max-h-[135px] xs:max-h-[155px] sm:max-h-[220px] lg:max-h-none object-contain filter contrast-[1.03] drop-shadow-[0_12px_28px_rgba(0,0,0,0.4)]"
                  style={{
                    maskImage: 'linear-gradient(to bottom, black 70%, transparent 98%)',
                    WebkitMaskImage: 'linear-gradient(to bottom, black 70%, transparent 98%)'
                  }}
                  loading="eager"
                />
              </div>
            </motion.div>
          </motion.div>

          {/* Biography and Narrative: Order 2 di Mobile, Order 1 di Desktop */}
          <motion.div
            initial={false}
            animate={{
              x: isMobile ? 0 : (stage === 'about' ? '0vw' : '-65vw'),
              y: isMobile ? (stage === 'about' ? 0 : -35) : 0,
              opacity: isActivating ? 0.35 : stage === 'about' ? 1 : 0,
            }}
            transition={{ duration: stage === 'explore' ? 3.0 : 1.5, ease: [0.32, 0.0, 0.24, 1.0] }}
            style={{
              pointerEvents: stage === 'about' && !isActivating ? 'auto' : 'none',
            }}
            className="hero-bio-column w-full lg:w-auto lg:max-w-[480px] xl:max-w-[520px] 2xl:max-w-[560px] flex flex-col items-center lg:items-start text-center lg:text-left order-2 lg:order-1 pointer-events-auto"
          >
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center lg:items-start space-y-2.5 xs:space-y-3.5 sm:space-y-4 lg:space-y-6 w-full"
            >
              <div className="flex items-center justify-center lg:justify-start gap-2 text-[10px] xs:text-xs font-semibold tracking-wider uppercase text-[#e5ad68]">
                <span>{profileData.subtitle}</span>
                <span className="text-white/20">•</span>
                <span className="text-slate-400 font-normal">{profileData.university}</span>
              </div>

              <h1 className="text-2xl xs:text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold tracking-tight text-white leading-[1.12]">
                Marcelinus Wijaya Oey
              </h1>

              <p className="text-xs xs:text-sm sm:text-base leading-relaxed text-slate-300 font-normal max-w-sm sm:max-w-md lg:max-w-xl text-center lg:text-justify line-clamp-4 xs:line-clamp-none">
                {profileData.bio}
              </p>

              <div className="flex flex-wrap justify-center lg:justify-start gap-1.5 xs:gap-2 pt-0.5">
                {profileData.coreFocus.map((focus) => (
                  <span
                    key={focus}
                    className="text-[10px] xs:text-xs px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-md bg-white/[0.05] border border-white/10 text-slate-300 font-medium"
                  >
                    {focus}
                  </span>
                ))}
              </div>

              <div className="pt-1.5 xs:pt-2 w-full flex justify-center lg:justify-start">
                <SocialLinks variant="minimal" className="justify-center lg:justify-start" />
              </div>
            </motion.div>
          </motion.div>

        </div>


        {/* FLANK KIRI: Alam1.jpg (Atas) & Alam3.jpg (Bawah) - Menyatu Vertikal 100% Tanpa Celah */}
        <motion.div
          initial={false}
          animate={{
            opacity: stage === 'explore' ? 1 : 0,
            x: stage === 'explore' ? 0 : -35,
          }}
          transition={{
            duration: stage === 'explore' ? 3.6 : 1.4,
            delay: stage === 'explore' ? 0.25 : 0,
            ease: [0.32, 0.0, 0.24, 1.0],
          }}
          style={{
            pointerEvents: stage === 'explore' && !isActivating ? 'auto' : 'none',
          }}
          className="hidden md:flex flex-col absolute inset-y-0 left-0 w-[28vw] md:w-[30vw] lg:w-[32vw] xl:w-[33vw] max-w-[560px] z-20 overflow-hidden select-none"
        >
          <div
            className="relative w-full h-full flex flex-col"
            style={{
              WebkitMaskImage: FLANK_FADE_MASKS.left,
              maskImage: FLANK_FADE_MASKS.left,
            }}
          >
            {/* Setengah Atas: Alam1.jpg (Highland) */}
            <motion.button
              type="button"
              onClick={handleButtonClick}
              aria-label="Highland View - Explore Journey"
              className="group relative flex-1 w-full overflow-hidden cursor-pointer p-0 m-0 border-0 outline-none text-left bg-transparent"
            >
              {/* Pendaran Cahaya Emas Mikro saat hover */}
              <div
                className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-10"
                style={{
                  background: 'radial-gradient(ellipse at 0% 0%, rgba(229, 173, 104, 0.25) 0%, rgba(229, 173, 104, 0.08) 50%, transparent 80%)'
                }}
              />
              <div className="w-full h-full overflow-hidden">
                <img
                  src="/images/Alam1.jpg"
                  alt="Highland Landscape Vista"
                  className="w-full h-full object-cover object-center filter brightness-[0.92] contrast-[1.05] group-hover:scale-106 group-hover:brightness-105 transition-all duration-700 ease-out"
                />
              </div>
            </motion.button>

            {/* Garis batas tengah halus (Atmospheric Blend Feather) agar transisi atas dan bawah menyatu lembut */}
            <div
              className="absolute top-1/2 left-0 right-0 h-16 -translate-y-1/2 pointer-events-none z-10"
              style={{
                background: 'linear-gradient(to bottom, transparent, rgba(11, 13, 19, 0.4) 50%, transparent)'
              }}
            />

            {/* Setengah Bawah: Alam3.jpg (Forest / Lake) */}
            <motion.button
              type="button"
              onClick={handleButtonClick}
              aria-label="Forest View - Explore Journey"
              className="group relative flex-1 w-full overflow-hidden cursor-pointer p-0 m-0 border-0 outline-none text-left bg-transparent"
            >
              {/* Pendaran Cahaya Emas Mikro saat hover */}
              <div
                className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-10"
                style={{
                  background: 'radial-gradient(ellipse at 0% 100%, rgba(229, 173, 104, 0.25) 0%, rgba(229, 173, 104, 0.08) 50%, transparent 80%)'
                }}
              />
              <div className="w-full h-full overflow-hidden">
                <img
                  src="/images/Alam3.jpg"
                  alt="Forest Landscape Vista"
                  className="w-full h-full object-cover object-center filter brightness-[0.92] contrast-[1.05] group-hover:scale-106 group-hover:brightness-105 transition-all duration-700 ease-out"
                />
              </div>
            </motion.button>
          </div>
        </motion.div>

        {/* FLANK KANAN: Alam2.jpg (Atas) & Alam4.jpg (Bawah) - Menyatu Vertikal 100% Tanpa Celah */}
        <motion.div
          initial={false}
          animate={{
            opacity: stage === 'explore' ? 1 : 0,
            x: stage === 'explore' ? 0 : 35,
          }}
          transition={{
            duration: stage === 'explore' ? 3.6 : 1.4,
            delay: stage === 'explore' ? 0.25 : 0,
            ease: [0.32, 0.0, 0.24, 1.0],
          }}
          style={{
            pointerEvents: stage === 'explore' && !isActivating ? 'auto' : 'none',
          }}
          className="hidden md:flex flex-col absolute inset-y-0 right-0 w-[28vw] md:w-[30vw] lg:w-[32vw] xl:w-[33vw] max-w-[560px] z-20 overflow-hidden select-none"
        >
          <div
            className="relative w-full h-full flex flex-col"
            style={{
              WebkitMaskImage: FLANK_FADE_MASKS.right,
              maskImage: FLANK_FADE_MASKS.right,
            }}
          >
            {/* Setengah Atas: Alam2.jpg (Valley / River) */}
            <motion.button
              type="button"
              onClick={handleButtonClick}
              aria-label="Valley View - Explore Journey"
              className="group relative flex-1 w-full overflow-hidden cursor-pointer p-0 m-0 border-0 outline-none text-left bg-transparent"
            >
              {/* Pendaran Cahaya Emas Mikro saat hover */}
              <div
                className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-10"
                style={{
                  background: 'radial-gradient(ellipse at 100% 0%, rgba(229, 173, 104, 0.25) 0%, rgba(229, 173, 104, 0.08) 50%, transparent 80%)'
                }}
              />
              <div className="w-full h-full overflow-hidden">
                <img
                  src="/images/Alam2.jpg"
                  alt="Valley Landscape Vista"
                  className="w-full h-full object-cover object-center filter brightness-[0.92] contrast-[1.05] group-hover:scale-106 group-hover:brightness-105 transition-all duration-700 ease-out"
                />
              </div>
            </motion.button>

            {/* Garis batas tengah halus (Atmospheric Blend Feather) agar transisi atas dan bawah menyatu lembut */}
            <div
              className="absolute top-1/2 left-0 right-0 h-16 -translate-y-1/2 pointer-events-none z-10"
              style={{
                background: 'linear-gradient(to bottom, transparent, rgba(11, 13, 19, 0.4) 50%, transparent)'
              }}
            />

            {/* Setengah Bawah: Alam4.jpg (Shore / Trail) */}
            <motion.button
              type="button"
              onClick={handleButtonClick}
              aria-label="Shore View - Explore Journey"
              className="group relative flex-1 w-full overflow-hidden cursor-pointer p-0 m-0 border-0 outline-none text-left bg-transparent"
            >
              {/* Pendaran Cahaya Emas Mikro saat hover */}
              <div
                className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-10"
                style={{
                  background: 'radial-gradient(ellipse at 100% 100%, rgba(229, 173, 104, 0.25) 0%, rgba(229, 173, 104, 0.08) 50%, transparent 80%)'
                }}
              />
              <div className="w-full h-full overflow-hidden">
                <img
                  src="/images/Alam4.jpg"
                  alt="Shore Landscape Vista"
                  className="w-full h-full object-cover object-center filter brightness-[0.92] contrast-[1.05] group-hover:scale-106 group-hover:brightness-105 transition-all duration-700 ease-out"
                />
              </div>
            </motion.button>
          </div>
        </motion.div>

        {/* Tahap 2: Objek 3D Planet & Orbital Showcase meluncur naik dari bawah ke tengah */}
        <motion.div
          initial={false}
          animate={{
            y: stage === 'explore' ? '0vh' : '105vh',
            scale: stage === 'explore' ? 1 : 0.50,
            opacity: stage === 'explore' ? 1 : 0,
          }}
          transition={{
            duration: stage === 'explore' ? 3.8 : 1.5,
            delay: stage === 'explore' ? 0.15 : 0,
            ease: [0.32, 0.0, 0.24, 1.0],
          }}
          style={{
            pointerEvents: stage === 'explore' && !isActivating ? 'auto' : 'none',
          }}
          className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none"
        >
          {/* 1. Latar Belakang Cosmic Orbit Rings (Kedalaman visual atmosferik) */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10 overflow-hidden">
            {/* Cincin Orbit Dalam */}
            <div className="w-[320px] xs:w-[420px] sm:w-[700px] lg:w-[860px] xl:w-[980px] h-[200px] xs:h-[260px] sm:h-[380px] lg:h-[440px] xl:h-[490px] rounded-[50%] border border-dashed border-[#e5ad68]/15 -rotate-6" />
            {/* Cincin Orbit Luar */}
            <div className="w-[460px] xs:w-[580px] sm:w-[960px] lg:w-[1140px] xl:w-[1260px] h-[280px] xs:h-[360px] sm:h-[480px] lg:h-[560px] xl:h-[620px] rounded-[50%] border border-dashed border-white/[0.05] rotate-12" />
          </div>

          {/* 3. Centerpiece Objek Planet (2D Image di Mobile, 3D Canvas di Desktop) */}
          <div className="pointer-events-auto w-full flex items-center justify-center">
            <BubbleButton
              onClick={handleButtonClick}
              isActivating={isActivating}
              imageSrc="/images/Alam.jpg"
            />
          </div>
        </motion.div>

        {/* Tombol Panduan Scroll Cepat di Bawah saat di About */}
        <motion.button
          type="button"
          onClick={goToExplore}
          initial={false}
          animate={{
            opacity: stage === 'about' && !showIntro ? 1 : 0,
            y: stage === 'about' && !showIntro ? 0 : 20,
          }}
          transition={{ duration: 0.7, delay: stage === 'about' ? 0.45 : 0 }}
          style={{
            pointerEvents: stage === 'about' && !showIntro ? 'auto' : 'none',
          }}
          aria-label="Scroll down or click to explore journey"
          className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 sm:gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white/[0.04] border border-white/10 hover:border-[#e5ad68]/40 hover:bg-white/[0.08] active:scale-95 text-[11px] sm:text-xs text-slate-300 font-medium tracking-wider uppercase transition-all duration-300 group cursor-pointer shadow-md"
        >
          <span>Explore Journey</span>
          <svg className="w-3.5 h-3.5 text-[#e5ad68] group-hover:translate-y-0.5 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </motion.button>

        {/* Tombol Kembali ke Bio / Profile saat di Explore */}
        <motion.button
          type="button"
          onClick={goToAbout}
          initial={false}
          animate={{
            opacity: stage === 'explore' ? 1 : 0,
            y: stage === 'explore' ? 0 : -20,
          }}
          transition={{ duration: 0.8, delay: stage === 'explore' ? 2.8 : 0 }}
          style={{
            pointerEvents: stage === 'explore' ? 'auto' : 'none',
          }}
          aria-label="Back to Profile"
          className="absolute top-4 sm:top-6 left-4 sm:left-10 z-40 flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 hover:border-[#e5ad68]/40 hover:bg-white/[0.06] active:scale-95 text-[11px] sm:text-xs text-slate-300 font-medium tracking-wider uppercase transition-all duration-300 group cursor-pointer shadow-lg"
        >
          <svg className="w-3.5 h-3.5 text-[#e5ad68] group-hover:-translate-x-0.5 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Profile / Bio</span>
        </motion.button>

      </div>

      {/* Screen Intro Transparan dengan instruksi gesture responsif */}
      <AnimatePresence mode="wait">
        {showIntro && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            onClick={handleDismissIntro}
            className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-[#13151c]/70 backdrop-blur-sm px-6 select-none cursor-pointer will-change-[opacity]"
            aria-label="Scroll down or swipe up to start exploring"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center text-center max-w-lg space-y-4 pointer-events-auto will-change-[opacity,transform]"
            >
              <p className="text-sm sm:text-base text-slate-200 font-medium tracking-wide drop-shadow-sm">
                <span className="md:hidden">Swipe up to start exploring</span>
                <span className="hidden md:inline">Scroll down to start exploring</span>
              </p>

              {/* Desktop: Animasi mouse scroll wheel */}
              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                className="pt-3 hidden md:flex flex-col items-center"
              >
                <div className="w-7 sm:w-8 h-12 sm:h-14 rounded-full border-2 border-white/40 flex items-start justify-center p-1.5 sm:p-2 shadow-[0_0_20px_rgba(229,173,104,0.15)]">
                  <motion.div
                    animate={{ y: [0, 8, 0], opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                    className="w-1 sm:w-1.5 h-3 sm:h-3.5 rounded-full bg-[#e5ad68]"
                  />
                </div>
              </motion.div>

              {/* Mobile: Animasi swipe up gesture icon */}
              <motion.div
                animate={{ y: [3, -5, 3] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                className="pt-2 flex md:hidden flex-col items-center"
              >
                <div className="w-10 h-10 rounded-full border border-white/20 bg-white/[0.05] flex items-center justify-center shadow-[0_0_16px_rgba(229,173,104,0.2)]">
                  <svg className="w-5 h-5 text-[#e5ad68]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
