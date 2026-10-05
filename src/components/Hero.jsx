import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
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
  const containerRef = useRef(null);

  // Lintasan scroll panjang (380vh) agar setiap fase transisi terasa bertahap & sinematik
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end']
  });

  // Otomatis hilangkan instruksi overlay setelah 1 detik
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Jika pengguna melakukan scroll sebelum 1 detik selesai, segera sembunyikan overlay
  useEffect(() => {
    const unsubscribe = scrollYProgress.on('change', (latest) => {
      if (latest > 0.02) {
        setShowIntro(false);
      }
    });
    return () => unsubscribe();
  }, [scrollYProgress]);

  // Tahap 1: About Page (Teks perkenalan di kiri & Foto profil di kanan)
  // Menetap utuh dan nyaman dibaca pada rentang awal
  // Lalu perlahan-lahan bergeser ke samping dan memudar pada 0.32 s.d 0.58
  const textX = useTransform(scrollYProgress, [0.0, 0.32, 0.58, 1.0], ['0vw', '0vw', '-75vw', '-75vw']);
  const textOpacity = useTransform(scrollYProgress, [0.0, 0.32, 0.54, 1.0], [1, 1, 0, 0]);
  const textPointerEvents = useTransform(scrollYProgress, (v) => (v <= 0.50 ? 'auto' : 'none'));

  // Foto profil di kanan perlahan-lahan bergeser ke kanan dan memudar seiring scroll
  const portraitX = useTransform(scrollYProgress, [0.0, 0.32, 0.58, 1.0], ['0vw', '0vw', '75vw', '75vw']);
  const portraitOpacity = useTransform(scrollYProgress, [0.0, 0.32, 0.54, 1.0], [1, 1, 0, 0]);
  const portraitPointerEvents = useTransform(scrollYProgress, (v) => (v <= 0.50 ? 'auto' : 'none'));

  // Tahap 2: Objek 3D planet perlahan-lahan naik dari bawah ke tengah seiring scroll lanjutan
  // Mulai naik di 0.56, tiba di tengah pada 0.78, dan TERKUNCI TETAP SOLID di tengah layar dari 0.78 s.d 1.00
  const planetY = useTransform(scrollYProgress, [0.0, 0.56, 0.78, 1.0], ['80vh', '80vh', '0vh', '0vh']);
  const planetOpacity = useTransform(scrollYProgress, [0.0, 0.56, 0.72, 1.0], [0, 0, 1, 1]);
  const planetScale = useTransform(scrollYProgress, [0.0, 0.56, 0.78, 1.0], [0.65, 0.65, 1.0, 1.0]);
  const planetPointerEvents = useTransform(scrollYProgress, (v) => (v >= 0.70 ? 'auto' : 'none'));

  const handleButtonClick = () => {
    if (isActivating) return;
    setIsActivating(true);
    onTriggerTransition();
  };

  const handleDismissIntro = () => {
    setShowIntro(false);
  };

  return (
    <section id="hero" ref={containerRef} className="relative w-full h-[380vh]">
      {/* Viewport fixed memastikan objek 3D & konten tetap terfokus di layar selama proses scroll */}
      <div className="hero-sticky-viewport fixed inset-0 w-full h-screen overflow-hidden flex flex-col justify-center items-center py-6 px-4 sm:px-8 lg:px-12 xl:px-16 pointer-events-none">
        
        {/* Main 2-Column Presentation: Jarak pas & natural antara teks dan foto profil */}
        <div className="hero-main-grid relative w-full max-w-[1240px] xl:max-w-[1320px] mx-auto flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-14 xl:gap-20 my-auto z-10">
          
          {/* Left: Biography and Narrative */}
          <motion.div
            style={{
              x: textX,
              opacity: isActivating ? 0.35 : textOpacity,
              pointerEvents: textPointerEvents,
            }}
            className="hero-bio-column w-full lg:w-auto lg:max-w-[480px] xl:max-w-[520px] 2xl:max-w-[560px] flex flex-col items-start space-y-6 order-1 text-left pointer-events-auto"
          >
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-start space-y-6 w-full"
            >
              <div className="flex items-center gap-2.5 text-xs font-semibold tracking-wider uppercase text-[#e5ad68]">
                <span>{profileData.subtitle}</span>
                <span className="text-white/20">•</span>
                <span className="text-slate-400 font-normal">{profileData.university}</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold tracking-tight text-white leading-[1.08]">
                Marcelinus Wijaya Oey
              </h1>

              <p className="text-sm sm:text-base leading-relaxed text-slate-300 font-normal max-w-xl text-justify">
                {profileData.bio}
              </p>

              <div className="flex flex-wrap gap-2 pt-1">
                {profileData.coreFocus.map((focus) => (
                  <span
                    key={focus}
                    className="text-xs px-3 py-1 rounded-md bg-white/[0.05] border border-white/10 text-slate-300 font-medium"
                  >
                    {focus}
                  </span>
                ))}
              </div>

              <div className="pt-2 w-full">
                <SocialLinks variant="minimal" />
              </div>
            </motion.div>
          </motion.div>

          {/* Right: Large Portrait Integration */}
          <motion.div
            style={{
              x: portraitX,
              opacity: isActivating ? 0.35 : portraitOpacity,
              pointerEvents: portraitPointerEvents,
            }}
            className="hero-portrait-wrapper w-full lg:w-auto flex-shrink-0 flex justify-center lg:justify-end items-center relative order-2 pointer-events-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="hero-portrait-container relative z-10 w-full max-w-[280px] sm:max-w-[320px] md:max-w-[360px] lg:max-w-[390px] xl:max-w-[430px]"
              style={{
                transform: `translate3d(${parallax.x * 0.12}px, ${parallax.y * 0.12}px, 0)`
              }}
            >
              <div className="relative overflow-visible">
                {/* Soft ambient backlight glow harmonizing with the nebula */}
                <div className="absolute -inset-10 bg-radial from-[#e5ad68]/20 via-[#e5ad68]/5 to-transparent blur-3xl pointer-events-none -z-10" />

                {/* Portrait with smooth transparency fade at the bottom edge */}
                <img
                  src={marcelinusImg}
                  alt="Portrait of Marcelinus"
                  className="w-full h-auto object-contain filter contrast-[1.03] drop-shadow-[0_16px_36px_rgba(0,0,0,0.35)]"
                  style={{
                    maskImage: 'linear-gradient(to bottom, black 65%, transparent 98%)',
                    WebkitMaskImage: 'linear-gradient(to bottom, black 65%, transparent 98%)'
                  }}
                  loading="eager"
                />
              </div>
            </motion.div>
          </motion.div>

        </div>


        {/* FLANK KIRI: Alam1.jpg (Atas) & Alam3.jpg (Bawah) - Menyatu Vertikal 100% Tanpa Celah */}
        <motion.div
          style={{
            opacity: planetOpacity,
            pointerEvents: planetPointerEvents,
          }}
          className="hidden md:flex flex-col absolute inset-y-0 left-0 w-[28vw] md:w-[30vw] lg:w-[32vw] xl:w-[33vw] max-w-[560px] pointer-events-auto z-20 overflow-hidden select-none"
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
          style={{
            opacity: planetOpacity,
            pointerEvents: planetPointerEvents,
          }}
          className="hidden md:flex flex-col absolute inset-y-0 right-0 w-[28vw] md:w-[30vw] lg:w-[32vw] xl:w-[33vw] max-w-[560px] pointer-events-auto z-20 overflow-hidden select-none"
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
          style={{
            y: planetY,
            opacity: planetOpacity,
            scale: planetScale,
            pointerEvents: planetPointerEvents,
          }}
          className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none"
        >
          {/* 1. Latar Belakang Cosmic Orbit Rings (Kedalaman visual atmosferik) */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10 overflow-hidden">
            {/* Cincin Orbit Dalam */}
            <div className="w-[560px] sm:w-[700px] lg:w-[860px] xl:w-[980px] h-[300px] sm:h-[380px] lg:h-[440px] xl:h-[490px] rounded-[50%] border border-dashed border-[#e5ad68]/15 -rotate-6" />
            {/* Cincin Orbit Luar */}
            <div className="w-[780px] sm:w-[960px] lg:w-[1140px] xl:w-[1260px] h-[400px] sm:h-[480px] lg:h-[560px] xl:h-[620px] rounded-[50%] border border-dashed border-white/[0.05] rotate-12" />
          </div>

          {/* 3. Centerpiece Objek 3D Planet (Tetap Utuh & Proporsional) */}
          <div className="pointer-events-auto w-full flex items-center justify-center">
            <BubbleButton
              onClick={handleButtonClick}
              isActivating={isActivating}
              imageSrc="/images/Alam.jpg"
            />
          </div>
        </motion.div>

      </div>

      {/* Screen Intro Transparan dengan instruksi scroll dan ikon mouse */}
      <AnimatePresence mode="wait">
        {showIntro && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            onClick={handleDismissIntro}
            className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-[#13151c]/70 backdrop-blur-sm px-6 select-none cursor-pointer will-change-[opacity]"
            aria-label="Scroll down to start exploring the page"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center text-center max-w-lg space-y-4 pointer-events-auto will-change-[opacity,transform]"
            >
              <p className="text-sm sm:text-base text-slate-200 font-medium tracking-wide drop-shadow-sm">
                Scroll down to start exploring the page
              </p>

              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                className="pt-3 flex flex-col items-center"
              >
                {/* Enlarged mouse frame */}
                <div className="w-7 sm:w-8 h-12 sm:h-14 rounded-full border-2 border-white/40 flex items-start justify-center p-1.5 sm:p-2 shadow-[0_0_20px_rgba(229,173,104,0.15)]">
                  {/* Animated scroll wheel */}
                  <motion.div
                    animate={{ y: [0, 8, 0], opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                    className="w-1 sm:w-1.5 h-3 sm:h-3.5 rounded-full bg-[#e5ad68]"
                  />
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
