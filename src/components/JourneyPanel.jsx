import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Award, ExternalLink, X, Compass } from 'lucide-react';
import TiltedCard from './TiltedCard';

export default function JourneyPanel({ experience }) {
  const {
    theme,
    title,
    period,
    milestone,
    description,
    technologies,
    growthStage,
    image,
    planet
  } = experience;

  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  return (
    <>
      <article
        aria-label={`${title} journey story`}
        className="w-full flex items-center justify-center select-none"
      >
        <TiltedCard
          className="w-full"
          containerWidth="100%"
          rotateAmplitude={1.2}
          scaleOnHover={1.003}
          showMobileWarning={false}
          showTooltip={false}
        >
          <div className="w-full relative p-5 sm:p-6 lg:p-7 rounded-2xl overflow-hidden transition-all duration-300">
            <div className="absolute inset-0 rounded-2xl pointer-events-none journey-fading-card-bg backdrop-blur-2xl transition-all duration-500" />

            <div
              className="absolute inset-0 rounded-2xl pointer-events-none border journey-fading-card-border transition-all duration-500"
              style={{
                borderColor: planet?.accent ? `${planet.accent}35` : 'rgba(255, 255, 255, 0.12)',
                boxShadow: planet?.glow
                  ? `0 1px 0 0 rgba(255, 255, 255, 0.08) inset, 0 0 24px ${planet.glow}`
                  : '0 1px 0 0 rgba(255, 255, 255, 0.08) inset'
              }}
            />

            <div
              className="absolute -top-24 -left-24 w-60 h-60 rounded-full pointer-events-none opacity-25 blur-3xl transition-colors duration-700"
              style={{ backgroundColor: planet?.accent || '#e5ad68' }}
              aria-hidden="true"
            />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 lg:gap-7 items-center">
              <div className={`${image ? 'lg:col-span-5' : 'col-span-12'} flex flex-col justify-between space-y-3.5`}>
                <div className="flex items-center justify-between border-b border-white/[0.07] pb-3 gap-2 flex-wrap sm:flex-nowrap">
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className="px-3 py-1 rounded-full text-xs font-semibold tracking-wide flex items-center gap-1.5 shadow-sm whitespace-nowrap shrink-0"
                      style={{
                        backgroundColor: `${planet?.accent || '#e5ad68'}15`,
                        color: planet?.accent || '#e5ad68',
                        border: `1px solid ${planet?.accent || '#e5ad68'}30`
                      }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: planet?.accent || '#e5ad68' }}
                      />
                      <span className="whitespace-nowrap">{theme}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-400 font-mono tracking-tight whitespace-nowrap shrink-0">
                    <Calendar className="w-3.5 h-3.5 text-slate-400/80 shrink-0" />
                    <span className="whitespace-nowrap">{period}</span>
                  </div>
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
                  {title}
                </h3>

                {milestone && (
                  <div className="relative flex items-start gap-2.5 px-3 py-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm overflow-hidden">
                    <div
                      className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
                      style={{ backgroundColor: planet?.accent || '#e5ad68' }}
                    />
                    <Award
                      className="w-4 h-4 shrink-0 mt-0.5 ml-1"
                      style={{ color: planet?.accent || '#e5ad68' }}
                    />
                    <span className="text-xs sm:text-[13px] font-medium text-slate-200 leading-snug">
                      {milestone}
                    </span>
                  </div>
                )}

                <p className="text-xs sm:text-[13px] text-slate-300/90 leading-relaxed text-left">
                  {description}
                </p>

                <div className="flex items-center gap-2 text-xs text-slate-400 pt-0.5">
                  <Compass className="w-3.5 h-3.5 text-slate-400/80 shrink-0" />
                  <span className="font-medium text-slate-300">Growth Focus:</span>
                  <span className="text-slate-100 font-medium">{growthStage}</span>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {technologies.map((tech) => (
                    <span
                      key={tech}
                      className="text-[11px] font-mono px-2.5 py-0.5 rounded-md bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.07] hover:border-white/20 text-slate-300 hover:text-white transition-colors duration-150 cursor-default select-none"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {image && (
                <div className="lg:col-span-7 flex flex-col justify-center">
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => setIsImageModalOpen(true)}
                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setIsImageModalOpen(true)}
                    className="group relative w-full aspect-video rounded-xl sm:rounded-2xl overflow-hidden border border-white/[0.12] bg-[#07090e] shadow-[0_12px_36px_rgba(0,0,0,0.65)] cursor-pointer transition-all duration-300 hover:border-white/30 active:scale-[0.985] select-none"
                    aria-label={`View enlarged photo for ${title}`}
                  >
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent z-10 pointer-events-none" />

                    <img
                      src={image}
                      alt={`${title} documentation`}
                      className="w-full h-full object-cover object-center transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-[1.04]"
                      loading="lazy"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none transition-opacity duration-300 group-hover:opacity-65" />

                    <div className="absolute bottom-3 right-3 z-10">
                      <span
                        className="flex items-center gap-1.5 font-mono text-[11px] font-semibold px-3 py-1 rounded-full bg-black/75 group-hover:bg-black/95 backdrop-blur-md border border-white/15 group-hover:border-white/35 transition-all duration-200 active:scale-95 shadow-md"
                        style={{ color: planet?.accent || '#e5ad68' }}
                      >
                        <ExternalLink className="w-3 h-3 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        <span>Enlarge</span>
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </TiltedCard>
      </article>

      <AnimatePresence>
        {isImageModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-black/85 backdrop-blur-xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
              className="relative max-w-4xl lg:max-w-5xl w-full bg-[#0a0d14]/95 border border-white/15 rounded-2xl overflow-hidden shadow-[0_24px_70px_rgba(0,0,0,0.85)] flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#0c1017]">
                <div className="flex items-center gap-2.5">
                  <span
                    className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
                    style={{
                      backgroundColor: `${planet?.accent || '#e5ad68'}15`,
                      color: planet?.accent || '#e5ad68',
                      border: `1px solid ${planet?.accent || '#e5ad68'}30`
                    }}
                  >
                    {theme}
                  </span>
                  <span className="text-slate-400 text-xs">•</span>
                  <h4 className="text-sm font-bold text-white tracking-tight">{title}</h4>
                </div>
                <button
                  type="button"
                  onClick={() => setIsImageModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors active:scale-95 cursor-pointer"
                  aria-label="Close image modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="w-full aspect-video bg-black/95 relative flex items-center justify-center overflow-hidden">
                <img
                  src={image}
                  alt={`${title} documentation`}
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="p-3.5 bg-[#080b10] border-t border-white/10 text-xs text-slate-400 flex items-center justify-between">
                <span className="font-mono text-slate-400">{period}</span>
                <span className="font-medium text-slate-300">{milestone}</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
