import { ExternalLink, ArrowUpRight } from 'lucide-react';
import { GithubIcon } from './Icons';
import { getProjectGithubLinks } from '../data/projects';

export default function ProjectCard({ project, onSelect }) {
  const {
    title,
    category,
    year,
    shortDescription,
    image,
    technologies,
    liveDemo
  } = project;

  const githubLinks = getProjectGithubLinks(project);

  return (
    <div
      onClick={() => onSelect(project)}
      className="group relative cursor-pointer flex flex-col justify-between rounded-xl bg-[#12151e] hover:bg-[#161a24] border border-white/10 hover:border-white/20 p-6 sm:p-7 transition-all duration-300 hover:-translate-y-1 shadow-md hover:shadow-xl overflow-hidden"
    >
      <div>
        {/* Top metadata */}
        <div className="flex items-center justify-between gap-4 mb-4">
          <span className="text-xs font-medium uppercase tracking-wider text-[#e5ad68]">
            {category}
          </span>
          <span className="font-mono text-xs text-slate-400">
            {year}
          </span>
        </div>

        {/* Project Image */}
        <div className="relative rounded-lg overflow-hidden border border-white/10 bg-[#0a0c10] aspect-[16/10] mb-5">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        </div>

        {/* Title & Short Description */}
        <div className="space-y-2 mb-5">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-xl sm:text-2xl font-bold text-white group-hover:text-[#e5ad68] transition-colors">
              {title}
            </h3>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-[#e5ad68] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
          <p className="text-sm text-slate-300 leading-relaxed line-clamp-2">
            {shortDescription}
          </p>
        </div>
      </div>

      {/* Tech Stack & Links */}
      <div className="space-y-4 pt-3 border-t border-white/10">
        <div className="flex flex-wrap gap-1.5">
          {technologies.map((tech) => (
            <span
              key={tech}
              className="text-xs font-mono px-2 py-0.5 rounded bg-white/[0.04] text-slate-300 border border-white/10"
            >
              {tech}
            </span>
          ))}
        </div>

        {/* Action Link Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 pt-1">
          {githubLinks.map((link) => (
            <a
              key={link.label}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors py-1 px-2 rounded hover:bg-white/[0.05]"
              aria-label={`${link.label} repository for ${title}`}
            >
              <GithubIcon className="w-3.5 h-3.5" />
              <span>{link.label}</span>
            </a>
          ))}

          {liveDemo && (
            <a
              href={liveDemo}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1.5 text-xs text-[#e5ad68] hover:text-[#f3c68f] transition-colors py-1 px-2 rounded hover:bg-white/[0.05]"
              aria-label={`Live demo for ${title}`}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Live Demo</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
