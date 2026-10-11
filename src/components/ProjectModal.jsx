import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Code2 } from 'lucide-react';
import { GithubIcon } from './Icons';
import { getProjectGithubLinks, getProjectOtherSourceLinks } from '../data/projects';

export default function ProjectModal({ project, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (project) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [project, onClose]);

  if (!project) return null;

  const githubLinks = getProjectGithubLinks(project);
  const otherSourceLinks = getProjectOtherSourceLinks(project);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 lg:p-10 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#0a0c10]/80 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 15 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-3xl bg-[#12151e] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-10 my-auto max-h-[90dvh] flex flex-col"
        >
          <div className="flex items-center justify-between px-4 sm:px-8 py-3.5 sm:py-5 border-b border-white/10 bg-[#161a24] sticky top-0 z-20">
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-[#e5ad68]">
                {project.category}
              </span>
              <span className="text-white/20">•</span>
              <span className="font-mono text-[11px] sm:text-xs text-slate-400">
                {project.year}
              </span>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close project modal"
              className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="overflow-y-auto p-4 sm:p-8 space-y-5 sm:space-y-7">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
                {project.title}
              </h2>
              <p className="text-sm sm:text-base text-slate-300">
                {project.shortDescription}
              </p>
            </div>

            <div className="relative rounded-xl overflow-hidden border border-white/10 bg-[#0a0c10] aspect-[16/9]">
              <img
                src={project.image}
                alt={project.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-2">
              <h3 className="text-xs uppercase tracking-wider font-semibold text-[#e5ad68]">
                Project Overview
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                {project.overview}
              </p>
            </div>

            {project.myContribution && (
              <div className="space-y-2">
                <h3 className="text-xs uppercase tracking-wider font-semibold text-[#e5ad68]">
                  My Contribution
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {project.myContribution}
                </p>
              </div>
            )}

            {project.keyLearning && (
              <div className="space-y-2">
                <h3 className="text-xs uppercase tracking-wider font-semibold text-[#e5ad68]">
                  What I Learned
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {project.keyLearning}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <h3 className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                Technology Stack
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {project.technologies.map((tech) => (
                  <span
                    key={tech}
                    className="text-xs font-mono px-2.5 py-1 rounded bg-white/[0.04] border border-white/10 text-slate-200"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5 sm:gap-3 pt-4 border-t border-white/10">
              {githubLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 active:scale-95 text-white text-xs font-medium transition-all w-full sm:w-auto"
                >
                  <GithubIcon className="w-4 h-4" />
                  <span>{link.label === 'GitHub' || link.label === 'Source' ? 'View Repository' : `${link.label} Repo`}</span>
                </a>
              ))}

              {otherSourceLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 active:scale-95 text-white text-xs font-medium transition-all w-full sm:w-auto"
                >
                  <Code2 className="w-4 h-4" />
                  <span>{link.label === 'Source' ? 'View Source' : link.label}</span>
                </a>
              ))}

              {project.liveDemo && (
                <a
                  href={project.liveDemo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#e5ad68] text-[#0a0c10] text-xs font-bold hover:bg-[#f3c68f] active:scale-95 transition-all w-full sm:w-auto shadow-md"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Launch Live Demo</span>
                </a>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
