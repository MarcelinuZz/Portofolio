import { useState } from 'react';
import { motion } from 'framer-motion';
import { profileData } from '../data/profile';
import { useParallax } from '../hooks/useParallax';
import SocialLinks from './SocialLinks';
import BubbleButton from './BubbleButton';
import marcelinusImg from '../assets/marcelinus.png';

export default function Hero({ onTriggerTransition }) {
  const parallax = useParallax(16);
  const [isActivating, setIsActivating] = useState(false);

  const handleButtonClick = () => {
    if (isActivating) return;
    setIsActivating(true);
    onTriggerTransition();
  };

  return (
    <section
      id="hero"
      className="relative min-h-screen w-full flex flex-col justify-center py-10 px-4 sm:px-8 lg:px-10 xl:px-14 2xl:px-20 overflow-hidden"
    >
      <div
        className="hero-main-grid flex-1 w-full max-w-[1480px] mx-auto flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-8 xl:gap-12 my-auto"
      >
        {/* Left: Biography and Narrative */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={
            isActivating
              ? { scale: 0.97, opacity: 0.35, filter: 'blur(3px)' }
              : { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }
          }
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="hero-bio-column w-full lg:w-auto lg:max-w-[420px] xl:max-w-[480px] 2xl:max-w-[520px] flex flex-col items-start z-10 space-y-6 order-1"
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

        {/* Center: 3D Golden Bubble Transition Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="hero-center-action flex-shrink-0 flex flex-col items-center justify-center z-20 py-4 lg:py-0 order-3 lg:order-2 px-2"
        >
          <BubbleButton
            onClick={handleButtonClick}
            isActivating={isActivating}
            imageSrc="/images/Alam4.jpg"
          />
        </motion.div>

        {/* Right: Large Portrait Integration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={
            isActivating
              ? { scale: 0.97, opacity: 0.35, filter: 'blur(3px)' }
              : { opacity: 1, scale: 1, filter: 'blur(0px)' }
          }
          transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="hero-portrait-wrapper w-full lg:w-auto flex-shrink-0 flex justify-center lg:justify-end items-center relative order-2 lg:order-3"
        >
          <div
            className="hero-portrait-container relative z-10 w-full max-w-[280px] sm:max-w-[320px] md:max-w-[360px] lg:max-w-[380px] xl:max-w-[420px]"
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
          </div>
        </motion.div>
      </div>
    </section>
  );
}
