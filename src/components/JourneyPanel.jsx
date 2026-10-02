import { Calendar, Award } from 'lucide-react';
import TiltedCard from './TiltedCard';

export default function JourneyPanel({ experience, total }) {
  const {
    stepNumber,
    theme,
    title,
    period,
    milestone,
    description,
    technologies,
    growthStage,
    image
  } = experience;

  return (
    <article
      aria-label={`${title} experience panel`}
      className="w-full h-full flex items-center justify-center px-4 sm:px-8 lg:px-12 shrink-0 select-none"
    >
      <TiltedCard
        className="w-full max-w-5xl mx-auto"
        containerWidth="100%"
        rotateAmplitude={2.5}
        scaleOnHover={1.008}
        showMobileWarning={false}
        showTooltip={false}
      >
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center p-6 sm:p-7 lg:p-8 relative">
          
          {/* Step indicator */}
          <div className="absolute top-5 right-6 sm:right-8 font-mono text-xs select-none text-[#e5ad68]">
            {stepNumber} / 0{total}
          </div>

          {/* LEFT COLUMN: Narrative & Timeline (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-center space-y-3.5 z-10">
            
            <div className="text-xs font-semibold uppercase tracking-wider text-[#e5ad68]">
              {theme}
            </div>

            <h3 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight leading-snug">
              {title}
            </h3>

            <div className="inline-flex items-center gap-2 text-xs text-slate-400">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-mono">{period}</span>
            </div>

            {milestone && (
              <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white/[0.03] border border-white/10 text-slate-200">
                <Award className="w-4 h-4 shrink-0 mt-0.5 text-[#e5ad68]" />
                <span className="text-xs sm:text-sm font-medium">
                  {milestone}
                </span>
              </div>
            )}

            <div className="pt-1 text-xs text-slate-400">
              <span className="font-medium text-slate-300">Focus: </span>
              {growthStage}
            </div>
          </div>

          {/* RIGHT COLUMN: Visual & Description (7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-4 z-10">
            
            {/* Visual Showcase */}
            <div className="relative rounded-xl overflow-hidden border border-white/10 bg-[#0a0c10] aspect-[16/9] max-h-[210px] xl:max-h-[230px] flex items-center justify-center">
              <img
                src={image}
                alt={`${title} visual`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>

            {/* Description */}
            <p className="text-sm text-slate-300 leading-relaxed text-left">
              {description}
            </p>

          {/* Technologies */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {technologies.map((tech) => (
              <span
                key={tech}
                className="text-xs font-mono px-2.5 py-1 rounded bg-white/[0.04] border border-white/10 text-slate-300"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>
    </TiltedCard>
  </article>
);
}
