import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink } from 'lucide-react';
import { GithubIcon } from './Icons';
import { getProjectGithubLinks } from '../data/projects';

export default function ProjectModal({ project, onClose }) {
  // ESC key listener to close modal (R-32)
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

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-10 overflow-y-auto">
        
        {/* Backdrop (Dose cap: blur on modal backdrop only) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#0a0c10]/80 backdrop-blur-sm"
        />

        {/* Modal Window Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 15 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-3xl bg-[#12151e] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-10 my-auto max-h-[90vh] flex flex-col"
        >
          {/* Top modal header bar */}
          <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-white/10 bg-[#161a24] sticky top-0 z-20">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#e5ad68]">
                {project.category}
              </span>
              <span className="text-white/20">•</span>
              <span className="font-mono text-xs text-slate-400">
                {project.year}
              </span>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close project modal"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Content Scroll Area */}
          <div className="overflow-y-auto p-6 sm:p-8 space-y-7">
            
            {/* Title & Short Description */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
                {project.title}
              </h2>
              <p className="text-sm sm:text-base text-slate-300">
                {project.shortDescription}
              </p>
            </div>

            {/* Project Image */}
            <div className="relative rounded-xl overflow-hidden border border-white/10 bg-[#0a0c10] aspect-[16/9]">
              <img
                src={project.image}
                alt={project.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Overview */}
            <div className="space-y-2">
              <h3 className="text-xs uppercase tracking-wider font-semibold text-[#e5ad68]">
                Project Overview
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                {project.overview}
              </p>
            </div>

            {/* Contribution */}
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

            {/* What I Learned */}
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

            {/* Technologies */}
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

            {/* Action Links */}
            <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-white/10">
              {githubLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-medium transition-colors"
                >
                  <GithubIcon className="w-4 h-4" />
                  <span>{link.label === 'Source' ? 'View Repository' : `${link.label} Repo`}</span>
                </a>
              ))}

              {project.liveDemo && (
                <a
                  href={project.liveDemo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#e5ad68] text-[#0a0c10] text-xs font-bold hover:bg-[#f3c68f] transition-colors"
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
