import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import { profileData } from '../data/profile';
import { useParallax } from '../hooks/useParallax';
import SocialLinks from './SocialLinks';
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
      className="relative min-h-screen w-full flex flex-col justify-between pt-24 pb-14 px-6 sm:px-12 lg:px-20 overflow-hidden"
    >
      <motion.div
        animate={
          isActivating
            ? { scale: 0.97, opacity: 0.35, filter: 'blur(3px)' }
            : { scale: 1, opacity: 1, filter: 'blur(0px)' }
        }
        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        className="flex-1 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center my-auto"
      >
        
        {/* Left: Biography and Narrative */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-6 flex flex-col items-start z-10 space-y-6"
        >
          <div className="flex items-center gap-2.5 text-xs font-semibold tracking-wider uppercase text-[#e5ad68]">
            <span>{profileData.subtitle}</span>
            <span className="text-white/20">•</span>
            <span className="text-slate-400 font-normal">{profileData.university}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold tracking-tight text-white leading-[1.08]">
            Marcelinus Wijaya Oey
          </h1>

          <p className="text-sm sm:text-base leading-relaxed text-slate-300 font-normal max-w-xl text-left">
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

          <div className="pt-2">
            <SocialLinks variant="minimal" />
          </div>
        </motion.div>

        {/* Right: Large Portrait Integration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-6 flex justify-center lg:justify-end items-center relative"
        >
          <div
            className="relative z-10 w-full max-w-[300px] sm:max-w-[340px] md:max-w-[380px] lg:max-w-[420px] xl:max-w-[460px]"
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
      </motion.div>

      {/* Center Portal Transition Button */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="w-full flex flex-col items-center justify-center pt-6 z-20"
      >
        <button
          type="button"
          onClick={handleButtonClick}
          disabled={isActivating}
          aria-label="Enter Journey page"
          className="group flex flex-col items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e5ad68] rounded-full p-2 transition-transform duration-300 hover:scale-105 active:scale-95 cursor-pointer disabled:cursor-default"
        >
          <div className="relative flex items-center justify-center">
            {/* Immediate golden ripple ring on click */}
            {isActivating && (
              <motion.div
                className="absolute -inset-2 rounded-full border border-[#e5ad68]/60"
                initial={{ scale: 0.9, opacity: 0.8 }}
                animate={{ scale: 2.0, opacity: 0 }}
                transition={{ duration: 0.9, ease: 'easeOut' }}
              />
            )}

            <div
              className={`w-14 h-14 rounded-full bg-[#161b26] border flex items-center justify-center shadow-lg transition-all duration-300 ${
                isActivating
                  ? 'border-[#e5ad68] shadow-[0_0_24px_rgba(229,173,104,0.5)] bg-[#e5ad68]/15'
                  : 'border-white/20 group-hover:border-[#e5ad68]'
              }`}
            >
              <ArrowDown
                className={`w-5 h-5 transition-all duration-300 ${
                  isActivating
                    ? 'text-[#e5ad68] translate-y-0.5'
                    : 'text-slate-300 group-hover:text-[#e5ad68] group-hover:translate-y-0.5'
                }`}
              />
            </div>
          </div>

          <span className="mt-2 text-[11px] font-medium tracking-widest uppercase text-slate-400 group-hover:text-slate-200 transition-colors">
            {isActivating ? 'Entering Journey...' : 'Explore Journey'}
          </span>
        </button>
      </motion.div>
    </section>
  );
}
